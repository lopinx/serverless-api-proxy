addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Define CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Define static responses
  const staticResponses = new Map([
    ['/', { content: 'service is running!', type: 'text/html' }],
    ['/index.html', { content: 'service is running!', type: 'text/html' }],
    ['/favicon.ico', { content: '', type: 'image/png' }],
    ['/robots.txt', { content: 'User-agent: *\nDisallow: /', type: 'text/plain' }]
  ]);

  // Define API endpoints
  const apis = new Map([
    ['/discord', 'https://discord.com/api'],
    ['/telegram', 'https://api.telegram.org'],
    ['/openai', 'https://api.openai.com'],
    ['/claude', 'https://api.anthropic.com'],
    ['/gemini', 'https://generativelanguage.googleapis.com'],
    ['/meta', 'https://www.meta.ai/api'],
    ['/groq', 'https://api.groq.com'],
    ['/x', 'https://api.x.ai'],
    ['/cohere', 'https://api.cohere.ai'],
    ['/huggingface', 'https://api-inference.huggingface.co'],
    ['/together', 'https://api.together.xyz'],
    ['/novita', 'https://api.novita.ai'],
    ['/portkey', 'https://api.portkey.ai'],
    ['/fireworks', 'https://api.fireworks.ai'],
    ['/openrouter', 'https://openrouter.ai/api']
  ]);

  // Handle root static response
  if (staticResponses.has(pathname)) {
    const { content, type } = staticResponses.get(pathname);
    return new Response(content, { status: 200, headers: { 'Content-Type': type } });
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  // Handle API proxying
  const [prefix, rest] = getApiInfo(pathname, apis);
  if (prefix) {
    const targetUrl = new URL(`${prefix}${rest}`);
    targetUrl.search = url.search;

    // Clone the request to avoid mutating the original request object.
    const clonedRequest = request.clone();

    try {
      const response = await fetch(targetUrl, clonedRequest);
      let rData = null;
      // handle non-streaming data
      if (!response.ok || !response.body) {
        rData = response.body
      }else{
        // handle streaming data
        rData = new ReadableStream({
          async start(controller) {
            const reader = response.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
          cancel() {
            // Handle cancellation if necessary
          }
        });
      }

      return new Response(rData, {
        status: response.status,
        statusText: response.statusText,
        headers: { ...Object.fromEntries(response.headers), ...corsHeaders }
      });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
    }
  }

  // Handle unknown route
  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

// Parse API information from pathname
function getApiInfo(pathname, apis) {
  for (const [prefix, baseUrl] of apis) {
      if (pathname.startsWith(prefix)) {
          return [baseUrl, pathname.slice(prefix.length)];
      }
  }
  return [null, null];
}