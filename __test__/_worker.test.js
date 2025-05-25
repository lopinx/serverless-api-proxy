import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

describe('API Proxying Tests', () => {
  let worker;
  let mockEnv;
  let originalFetch;

  // Helper to create a Request object
  const createRequest = (method, path, headers = {}, body = null) => {
    const url = `http://localhost:8787${path}`; // Base URL for the worker
    return new Request(url, { method, headers, body });
  };

  beforeEach(async () => {
    jest.resetModules(); // Resets module cache, including apiMapCache in _worker.js
    worker = (await import('../src/_worker.js')).default;

    originalFetch = global.fetch;
    global.fetch = jest.fn(); 

    mockEnv = {
      API_ENDPOINTS: JSON.stringify({
        '/openai/v1': 'https://api.openai.com/v1',
        '/openrouter': 'https://openrouter.ai/api/v1',
        '/deepseek': 'https://api.deepseek.com'
      }),
      // Provide default admin credentials and session secret for effectiveEnv in worker
      ADMIN_USERNAME: 'admin', // Not strictly needed for API proxy tests, but harmless
      ADMIN_PASSWORD: 'admin',
      SESSION_SECRET: 't$_4c#rIY+AE38tRKsK!3TVXvw&SI#hd',
    };
  });

  afterEach(() => {
    global.fetch = originalFetch; // Restore original fetch
  });

  test('should proxy GET request to /openai/v1/chat/completions', async () => {
    const mockTargetResponse = { id: 'chatcmpl-xxxx', choices: [{ message: { content: 'Hello!' } }] };
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockTargetResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Target-Specific': 'value' },
      })
    );
    const request = createRequest('GET', '/openai/v1/chat/completions');
    const response = await worker.fetch(request, mockEnv);
    const responseBody = await response.json();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      new URL('https://api.openai.com/v1/chat/completions'),
      expect.anything()
    );
    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockTargetResponse);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('X-Target-Specific')).toBe('value'); // Target header should be preserved
  });

  test('should proxy GET request with query parameters to /openrouter/models', async () => {
    const mockTargetResponse = { data: [{ id: 'model1' }, { id: 'model2' }] };
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockTargetResponse), { status: 200 })
    );

    const request = createRequest('GET', '/openrouter/models?filter=free');
    await worker.fetch(request, mockEnv);

    expect(global.fetch).toHaveBeenCalledWith(
      new URL('https://openrouter.ai/api/v1/models?filter=free'),
      expect.anything()
    );
  });

  test('should proxy POST request with JSON body to /deepseek/chat/completions', async () => {
    const requestBody = { model: "deepseek-chat", messages: [{role: "user", content: "Hello"}] };
    const mockTargetResponse = { id: 'ds-cmpl-xxxx', choices: [{message: {content: "Hi there!"}}], usage: {} };

    global.fetch.mockImplementation(async (url, options) => {
      if (url.toString() === 'https://api.deepseek.com/chat/completions' && options.method === 'POST') {
        const receivedBody = await new Request(url, options).json(); // Simulate reading the body
        expect(receivedBody).toEqual(requestBody);
        return new Response(JSON.stringify(mockTargetResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Mock fetch: Not Found', { status: 404 });
    });

    const request = createRequest('POST', '/deepseek/chat/completions', { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-test' }, JSON.stringify(requestBody));
    const response = await worker.fetch(request, mockEnv);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual(mockTargetResponse);
  });

  test('should return 404 for non-configured API prefix', async () => {
    const request = createRequest('GET', '/v2/unknown/path');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not Found');
    expect(global.fetch).not.toHaveBeenCalled(); // Should not attempt to fetch a target
  });

  test('should add CORS headers to proxied responses', async () => {
    global.fetch.mockResolvedValueOnce(
      new Response('Success', { status: 200 })
    );

    const request = createRequest('GET', '/openai/v1/some/path');
    const response = await worker.fetch(request, mockEnv);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS, PUT, DELETE');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization, X-Requested-With');
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  test('should correctly proxy to an HTTP target', async () => {
    // Update mockEnv for this specific test to include an HTTP target
    mockEnv.API_ENDPOINTS = JSON.stringify({
      '/local': 'http://localhost:3000/api'
    });
    // Re-import worker or clear cache if loadApis relies on initial env
    jest.resetModules(); // Ensure apiMapCache is cleared
    worker = (await import('../src/_worker.js')).default;

    const mockTargetResponse = { status: 'ok_http' };
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockTargetResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const request = createRequest('GET', '/local/status');
    const response = await worker.fetch(request, mockEnv);
    const responseBody = await response.json();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      new URL('http://localhost:3000/api/status'),
      expect.anything()
    );
    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockTargetResponse);
  });

  test('should preserve request method when proxying', async () => {
    global.fetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

    // Use a configured prefix to ensure proxy logic is hit
    const requestPath = '/openai/v1/some/resource/to_update';
    const expectedTargetPath = 'https://api.openai.com/v1/some/resource/to_update';
    const request = createRequest('PUT', requestPath, { 'Content-Type': 'application/json'}, JSON.stringify({ data: 'update' }));
    await worker.fetch(request, mockEnv);
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = global.fetch.mock.calls[0];
    const fetchedUrl = fetchCall[0];
    const fetchedRequest = fetchCall[1]; // The second argument to fetch is the RequestInit object or Request itself
    expect(fetchedUrl.toString()).toBe(expectedTargetPath);
    expect(fetchedRequest.method).toBe('PUT');
  });

  test('should handle target API returning an error status', async () => {
    const errorPayload = { error: 'Invalid input', details: 'field_xyz is missing' };
    global.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const request = createRequest('POST', '/openai/v1/submit_error', {}, JSON.stringify({}));
    const response = await worker.fetch(request, mockEnv);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual(errorPayload);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*'); // CORS headers still applied
  });

  test('should handle network error when fetching target API', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Network failed')); // Simulate a network error

    const request = createRequest('GET', '/openrouter/fetch_error');
    const response = await worker.fetch(request, mockEnv);
    const responseText = await response.text();

    expect(response.status).toBe(500);
    expect(responseText).toBe('Internal Server Error');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*'); // CORS headers still applied
  });
});