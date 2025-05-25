let apiMapCache = null; // Global cache for API map, invalidated on KV writes

// Define escapeHtml globally or ensure it's accessible where t() is called
function escapeHtml(unsafe) {
  if (unsafe === null || typeof unsafe === 'undefined') return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const translations = {
  en: {
    pageTitle: 'API Gateway',
    mainTitle: 'API Gateway',
    login: 'Login',
    logout: 'Logout',
    currentApiEndpoints: 'Current API Endpoints',
    addApiEndpoint: 'Add Endpoint',
    tableHeaderPrefix: 'Prefix',
    tableHeaderTargetUrl: 'Target URL',
    tableHeaderActions: 'Actions',
    noApiEndpoints: 'No API endpoints are currently configured.',
    labelPrefix: 'Prefix (e.g., /v1/api):',
    labelTargetUrl: 'Target URL (e.g., https://your-target-api.com/endpoint):',
    buttonAddApi: 'Add API',
    buttonUpdate: 'Update',
    buttonDelete: 'Delete',
    confirmDelete: 'Are you sure you want to delete {prefix}?',
    modalTitleLogin: 'Login',
    modalLabelUsername: 'Username:',
    modalLabelPassword: 'Password:',
    modalLoginButton: 'Login',
    kvNotConfigured:
      'API_ENDPOINTS KV namespace is not configured. API endpoint management (add, update, delete) via this panel is disabled. The list below shows currently active endpoints (possibly from environment variables).',
    // Messages from backend
    errorKvRequired:
      'Error: API management operations require the API_ENDPOINTS KV namespace to be configured.',
    errorFieldsRequired: 'Prefix and Target URL are required.',
    errorPrefixFormat: "Prefix must start with '/'.",
    apiAddedSuccess: "API endpoint '{prefix}' added successfully.",
    apiExistsUpdated:
      "API endpoint '{prefix}' already exists, its Target URL has been updated.",
    errorUpdateMissingOriginalPrefix:
      'Error: Original prefix missing for update operation.',
    errorUpdateNewPrefixExists:
      "Error: New prefix '{prefix}' already exists. Cannot rename.",
    apiUpdatedSuccess:
      "API endpoint '{original_prefix}' successfully updated to '{prefix}'.",
    apiTargetUpdatedSuccess: "API endpoint '{prefix}' updated successfully.",
    apiDeletedSuccess: "API endpoint '{prefix}' deleted successfully.",
    errorKvOperation: 'Error performing operation: {errorMessage}',
    // Login messages
    loginFailedInvalid: 'Invalid username or password.',
    loginFailedGeneric: 'Login failed. Please try again.',
    loginErrorGeneric: 'An error occurred. Please try again.',
    unauthorized: 'Unauthorized',
    paginationPrevious: 'Previous',
    paginationNext: 'Next',
    footerCopyright:
      '&copy;2024-{year} <a href="https://github.com/lopinx/serverless-api-proxy" target="_blank">API Gateway</a> All rights reserved.',
    searchPlaceholder: 'Search by prefix or target...',
    buttonSearch: 'Search',
    buttonClearSearch: 'Clear',
    noApiEndpointsSearch: 'No API endpoints match your search for "{query}".',
  },
  zh: {
    pageTitle: 'API网关',
    mainTitle: 'API网关',
    login: '登录',
    logout: '注销',
    currentApiEndpoints: '当前API端点',
    addApiEndpoint: '添加节点',
    tableHeaderPrefix: '前缀 (Prefix)',
    tableHeaderTargetUrl: '目标 URL (Target URL)',
    tableHeaderActions: '操作',
    noApiEndpoints: '当前没有配置API端点。',
    labelPrefix: '前缀 (例如, /v1/api):',
    labelTargetUrl: '目标 URL (例如, https://your-target-api.com/endpoint):',
    buttonAddApi: '添加API',
    buttonUpdate: '更新',
    buttonDelete: '删除',
    confirmDelete: '您确定要删除 {prefix} 吗?',
    modalTitleLogin: '登录',
    modalLabelUsername: '用户名:',
    modalLabelPassword: '密码:',
    modalLoginButton: '登录',
    kvNotConfigured:
      'API_ENDPOINTS KV命名空间未配置。通过此面板进行的API端点管理（添加、更新、删除）功能已禁用。下面的列表显示当前活动的端点（可能来自环境变量）。',
    // Messages from backend
    errorKvRequired: '错误: API 管理操作需要配置 API_ENDPOINTS KV命名空间。',
    errorFieldsRequired: '前缀 (Prefix) 和目标 URL (Target URL) 都是必填项。',
    errorPrefixFormat: "前缀 (Prefix) 必须以 '/' 开头。",
    apiAddedSuccess: "API端点 '{prefix}' 添加成功。",
    apiExistsUpdated: "API端点 '{prefix}' 已存在，其目标 URL 已更新。",
    errorUpdateMissingOriginalPrefix: '错误: 更新操作缺少原始前缀。',
    errorUpdateNewPrefixExists: "错误: 新前缀 '{prefix}' 已存在。无法重命名。",
    apiUpdatedSuccess: "API端点 '{original_prefix}' 已成功更新为 '{prefix}'。",
    apiTargetUpdatedSuccess: "API端点 '{prefix}' 更新成功。",
    apiDeletedSuccess: "API端点 '{prefix}' 删除成功。",
    errorKvOperation: '执行操作时出错: {errorMessage}',
    // Login messages
    loginFailedInvalid: '用户名或密码无效。',
    loginFailedGeneric: '登录失败，请重试。',
    loginErrorGeneric: '发生错误，请重试。',
    unauthorized: '未授权',
    paginationPrevious: '上一页',
    paginationNext: '下一页',
    footerCopyright:
      '&copy;2024-{year} <a href="https://github.com/lopinx/serverless-api-proxy" target="_blank">API网关</a> 版权所有.',
    searchPlaceholder: '通过前缀或目标搜索...',
    buttonSearch: '搜索',
    buttonClearSearch: '清除',
    noApiEndpointsSearch: '没有找到与 "{query}" 匹配的API端点。',
  },
};

// Translation helper function
function t(key, lang = 'zh', params = {}) {
  let langToUse = 'en'; // Default to English
  if (translations[lang]) {
    langToUse = lang;
  }
  // Fallback to key itself if not found in the selected language OR in the default English
  let str =
    (translations[langToUse] && translations[langToUse][key]) ||
    (translations['en'] && translations['en'][key]) ||
    key;
  for (const paramKey in params) {
    str = str.replace(
      new RegExp(`{${paramKey}}`, 'g'),
      escapeHtml(params[paramKey])
    );
  }
  return str;
}

// List of User-Agent substrings to block
const BLOCKED_USER_AGENTS = [
  'MJ12bot',
  'AhrefsBot',
  'SemrushBot',
  'DotBot',
  'BLEXBot',
  'YandexBot',
  'MegaIndex',
  'ZoominfoBot',
  'serpstatbot',
  'DataForSeoBot',
  'linkfluence',
  'Bytespider',
  'PetalBot',
  'YisouSpider',
  'Baiduspider',
  'sogou web spider',
  '360Spider',
  'Googlebot',
  'bingbot',
  'Slurp',
  'DuckDuckBot',
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'PaperLiBot',
  'ContentGrabber',
  'WebThumbnail',
  'Adidxbot',
  'CCBot',
  'archive.org_bot',
  'SeekportBot',
  'Exabot',
  'ZmEu',
  '80legs',
  'Yeti',
  // Add more bot/spider user agent substrings as needed
];

// Define CORS headers globally
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Consider restricting this in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export default {
  async fetch(request, env, ctx) {
    // Create an effectiveEnv object with defaults for admin credentials
    const effectiveEnv = {
      ...env,
      ADMIN_USERNAME: env.ADMIN_USERNAME || 'admin',
      ADMIN_PASSWORD: env.ADMIN_PASSWORD || 'admin',
      SESSION_SECRET: env.SESSION_SECRET || '$qA,.3!_I1^0AQ5rZm3!z-S3^(IgF$A8', // IMPORTANT: Change this in production!
    };
    return handleRequest(request, effectiveEnv);
  },
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Dashboard for /, /index.html, /admin, /admin/
  if (['/', '/index.html', '/admin', '/admin/'].includes(pathname)) {
    const isAuthorized = await checkAuth(request, env);

    // --- Early exit for blocked User-Agents ---
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase();
    for (const blockedAgent of BLOCKED_USER_AGENTS) {
      if (userAgent.includes(blockedAgent.toLowerCase())) {
        return new Response('Access Denied: Your client is not permitted.', {
          status: 403,
        });
      }
    }

    // 确定语言：1. URL 参数（优先），2. Accept-Language 请求头，3. 默认为英文
    let lang = url.searchParams.get('lang');

    // 如果 URL 中的 lang 无效（不是 'en' 或 'zh'）或未提供，则尝试 Accept-Language
    if (!lang || !translations[lang]) {
      const acceptLanguageHeader = request.headers.get('Accept-Language');
      if (acceptLanguageHeader) {
        // 检查中文语言偏好（例如 "zh-CN", "zh"）
        // 这是一个简化的检查。一个健壮的解析器会考虑 q 值。
        const preferredLanguages = acceptLanguageHeader
          .split(',')
          .map((langEntry) => langEntry.split(';')[0].trim().toLowerCase());
        if (preferredLanguages.some((pl) => pl.startsWith('zh'))) {
          lang = 'zh';
        } else {
          lang = 'en';
        }
      } else {
        lang = 'en'; // 如果没有 Accept-Language 请求头，则默认为英文
      }
    }

    // 最终验证：如果确定的 lang（即使来自无效的 URL 参数，如 'fr'）
    // 不是我们支持的语言之一，则默认为 'en'。
    if (!translations[lang]) {
      lang = 'en';
    }

    const messageKey = url.searchParams.get('messageKey');
    const messageType = url.searchParams.get('messageType') || 'info';
    let messageParams = {};
    const messageParamsStr = url.searchParams.get('messageParams');
    if (messageParamsStr) {
      try {
        messageParams = JSON.parse(decodeURIComponent(messageParamsStr));
      } catch (e) {
        console.error('Failed to parse messageParams:', e);
      }
    }
    return renderDashboard(
      request,
      env,
      isAuthorized,
      lang,
      messageKey,
      messageParams,
      messageType,
      url // Pass the parsed URL object
    );
  }

  // Login action (POST only, for modal)
  if (pathname === '/admin/login' && request.method === 'POST') {
    return handleAdminLogin(request, env, CORS_HEADERS);
  }

  // Logout action
  if (pathname === '/admin/logout' && request.method === 'GET') {
    return handleAdminLogout(request);
  }

  // API management actions (POST only)
  if (pathname === '/admin/api' && request.method === 'POST') {
    const isAuthorized = await checkAuth(request, env);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, messageKey: 'unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...CORS_HEADERS,
          },
        }
      );
    }
    // KV check is inside handleAdminApiAction
    // handleAdminApiAction will redirect, so it doesn't directly use CORS_HEADERS for its final response.
    return handleAdminApiAction(request, env);
  }

  // Define static responses
  const staticResponses = new Map([
    ['/favicon.ico', { content: '', type: 'image/png' }],
    [
      '/robots.txt',
      { content: 'User-agent: *\nDisallow: /', type: 'text/plain' },
    ],
  ]);

  // Load APIs for proxying (needed for non-admin routes)
  if (staticResponses.has(pathname)) {
    const { content, type } = staticResponses.get(pathname);
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': type },
    });
  }

  // --- Early exit for blocked User-Agents (for non-admin routes too) ---
  const userAgent = request.headers.get('User-Agent') || '';
  for (const blockedAgent of BLOCKED_USER_AGENTS) {
    if (userAgent.toLowerCase().includes(blockedAgent.toLowerCase())) {
      // console.log(`[Request Blocker] Blocked User-Agent: ${userAgent}`);
      return new Response('Access Denied: Your client is not permitted.', {
        status: 403,
      });
    }
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Handle API proxying
  const apis = await loadApis(env);
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
        rData = response.body;
      } else {
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
          },
        });
      }

      return new Response(rData, {
        status: response.status,
        statusText: response.statusText,
        headers: { ...Object.fromEntries(response.headers), ...CORS_HEADERS },
      });
    } catch (error) {
      return new Response('Internal Server Error', {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }

  // Handle unknown route
  return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
}

// Parse API information from pathname
function getApiInfo(pathname, apis) {
  // Sort keys by length descending to match longest prefix first
  const sortedPrefixes = Array.from(apis.keys()).sort(
    (a, b) => b.length - a.length
  );

  for (const prefix of sortedPrefixes) {
    if (pathname.startsWith(prefix)) {
      const baseUrl = apis.get(prefix);
      return [baseUrl, pathname.slice(prefix.length)];
    }
  }
  return [null, null];
}

// --- API Loading (KV or JSON string fallback) ---
async function loadApis(env) {
  if (apiMapCache !== null) return apiMapCache;
  const apiMap = new Map();
  let kvLoadAttempted = false;
  let kvLoadSuccessfulAndPopulated = false; // True if KV was accessed and yielded at least one API

  // --- Attempt to load from KV Store ---
  if (env.API_ENDPOINTS && typeof env.API_ENDPOINTS.list === 'function') {
    kvLoadAttempted = true;
    // console.log('Attempting to load APIs from KV store...');
    try {
      const { keys } = await env.API_ENDPOINTS.list();
      if (keys && keys.length > 0) {
        for (const key of keys) {
          const target = await env.API_ENDPOINTS.get(key.name);
          if (target) {
            // Ensure target is not null or empty string
            apiMap.set(key.name, target);
          }
        }
        if (apiMap.size > 0) {
          kvLoadSuccessfulAndPopulated = true;
          // console.log(`Successfully loaded ${apiMap.size} API(s) from KV.`);
        } else {
          console.warn(
            'KV store reported keys, but no valid API endpoints (with targets) were loaded from KV.'
          );
        }
      } else {
        console.warn(
          'API_ENDPOINTS KV namespace is configured but found to be empty.'
        );
      }
    } catch (e) {
      console.error('Failed to load APIs from KV:', e);
      apiMap.clear(); // Clear any partial load from KV due to error
    }
  }

  // --- Fallback to JSON string if KV was not configured, or KV load failed, or KV was empty/yielded no APIs ---
  if (!kvLoadSuccessfulAndPopulated) {
    if (kvLoadAttempted) {
      console.log(
        'KV store did not yield API configurations or failed; attempting fallback to API_ENDPOINTS JSON string.'
      );
    } else {
      console.log(
        'API_ENDPOINTS KV namespace not configured or not accessible; attempting to use API_ENDPOINTS JSON string.'
      );
    }

    if (env.API_ENDPOINTS && typeof env.API_ENDPOINTS === 'string') {
      console.warn(
        'Using API_ENDPOINTS JSON string for proxy configuration. Note: Admin panel API management features require a KV namespace; endpoints from JSON are not manageable via the admin panel.'
      );
      apiMap.clear(); // Ensure map is clean before loading from JSON
      try {
        const apiConfig = JSON.parse(env.API_ENDPOINTS);
        let parsedCount = 0;
        if (Array.isArray(apiConfig)) {
          apiConfig.forEach((item) => {
            if (
              Array.isArray(item) &&
              item.length === 2 &&
              typeof item[0] === 'string' &&
              item[0].length > 0 &&
              typeof item[1] === 'string' &&
              item[1].length > 0
            ) {
              apiMap.set(item[0], item[1]);
              parsedCount++;
            }
          });
        } else if (typeof apiConfig === 'object' && apiConfig !== null) {
          for (const [key, value] of Object.entries(apiConfig)) {
            if (
              typeof key === 'string' &&
              key.length > 0 &&
              typeof value === 'string' &&
              value.length > 0
            ) {
              apiMap.set(key, value);
              parsedCount++;
            }
          }
        }

        if (parsedCount > 0) {
          console.log(
            `Successfully loaded ${apiMap.size} API(s) from JSON string.`
          );
        } else {
          console.warn(
            'API_ENDPOINTS JSON string was parsed, but no valid API endpoints were found or it was empty.'
          );
        }
      } catch (e) {
        console.error('Failed to parse API_ENDPOINTS JSON string:', e);
        apiMap.clear(); // Ensure map is empty if JSON parsing failed
      }
    } else if (env.API_ENDPOINTS && typeof env.API_ENDPOINTS !== 'string') {
      // API_ENDPOINTS env var exists but is not a string (and KV was not successful)
      console.warn(
        'API_ENDPOINTS environment variable is present but is not a parseable JSON string. KV was also not used or was empty.'
      );
    }
    // If API_ENDPOINTS (string) is simply not set, the final summary log will cover it.
  }

  if (apiMap.size === 0) {
    console.warn(
      'No API endpoints loaded from any source. API proxying will likely not function as expected.'
    );
  }

  apiMapCache = apiMap;
  return apiMap;
}

// --- Admin Panel Logic ---

async function createSignedSessionValue(username, secret) {
  const encoder = new TextEncoder();
  const dataToSign = `${username}:${Date.now()}`; // Add timestamp for potential expiry
  const data = encoder.encode(dataToSign);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);

  // Convert signature ArrayBuffer to Base64 string explicitly
  const signatureUint8Array = new Uint8Array(signatureBuffer);
  let signatureBinaryString = '';
  for (let i = 0; i < signatureUint8Array.length; i++) {
    signatureBinaryString += String.fromCharCode(signatureUint8Array[i]);
  }
  const signatureB64 = btoa(signatureBinaryString);

  return `${btoa(dataToSign)}.${signatureB64}`;
}

async function verifySignedSession(signedValue, secret) {
  const parts = signedValue.split('.');
  if (parts.length !== 2) {
    console.log(
      '[verifySignedSession] Invalid format: does not contain two parts separated by a dot.'
    );
    return null;
  }
  try {
    const b64Data = parts[0];
    const b64Signature = parts[1];
    const decodedDataString = atob(b64Data);
    const dataToVerify = new TextEncoder().encode(decodedDataString);
    const signatureChars = atob(b64Signature);
    const signatureToCompare = new Uint8Array(signatureChars.length);
    for (let i = 0; i < signatureChars.length; i++) {
      signatureToCompare[i] = signatureChars.charCodeAt(i);
    }
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureToCompare,
      dataToVerify
    );

    if (isValid) {
      const [username, timestampStr] = decodedDataString.split(':');
      const trimmedUsername = username.trim();
      // console.log(
      //   `[verifySignedSession] Extracted and trimmed username: "${trimmedUsername}" (Timestamp: ${timestampStr})`
      // );
      return trimmedUsername;
    }
    console.log(
      '[verifySignedSession] Signature verification failed (isValid is false).'
    );
  } catch (e) {
    console.error(
      '[verifySignedSession] Error during verification:',
      e.message,
      e.stack
    );
  }
  console.log(
    '[verifySignedSession] Returning null (verification failed or error).'
  );
  return null;
}

async function checkAuth(request, env) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    console.log('[checkAuth] No Cookie header found.');
    return false;
  }
  // console.log(`[checkAuth] Raw Cookie header: "${cookieHeader}"`);

  const cookies = cookieHeader.split(';');
  for (const cookieStr of cookies) {
    const trimmedCookieStr = cookieStr.trim();
    const eqIndex = trimmedCookieStr.indexOf('=');

    // Ensure '=' is present and there's a name before it.
    if (eqIndex > 0) {
      const name = trimmedCookieStr.substring(0, eqIndex).trim();
      const value = trimmedCookieStr.substring(eqIndex + 1).trim();

      if (name === 'site_session') {
        const username = await verifySignedSession(value, env.SESSION_SECRET);
        // console.log(`[checkAuth] Username from session: "${username}"`);
        // console.log(
        //   `[checkAuth] ADMIN_USERNAME from env: "${env.ADMIN_USERNAME}"`
        // );
        const isAuthenticated = username === env.ADMIN_USERNAME?.trim(); // Trim env var for comparison too
        // console.log(`[checkAuth] Is authenticated: ${isAuthenticated}`);
        return isAuthenticated;
      }
    }
  }
  console.log('[checkAuth] Session cookie not found or no match.');
  return false;
}

async function handleAdminLogin(request, env, corsHeaders) {
  const formData = await request.formData();
  const responseHeaders = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders,
  });

  if (
    formData.get('username') === env.ADMIN_USERNAME &&
    formData.get('password') === env.ADMIN_PASSWORD
  ) {
    const sessionValue = await createSignedSessionValue(
      env.ADMIN_USERNAME,
      env.SESSION_SECRET
    );
    responseHeaders.set(
      'Set-Cookie',
      `site_session=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600` // Secure; // Add Secure in HTTPS context
    );
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: responseHeaders,
    });
  }
  return new Response(
    JSON.stringify({ success: false, messageKey: 'loginFailedInvalid' }),
    {
      status: 401,
      headers: responseHeaders,
    }
  );
}

async function handleAdminLogout(request) {
  // Create new Headers object for the redirect response
  const headers = new Headers();
  const lang = new URL(request.url).searchParams.get('lang') || 'en'; // Default to English on logout if not specified
  headers.set('Location', new URL(`/?lang=${lang}`, request.url).toString()); // Redirect to home page with lang
  headers.set(
    'Set-Cookie',
    `site_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` // Expire cookie, Secure; // Add Secure in HTTPS context
  ); // Expire cookie

  return new Response(null, {
    status: 302,
    headers: headers,
  });
}

async function renderDashboard(
  request,
  env,
  isAuthorized,
  lang,
  messageKey = null,
  messageParams = {},
  messageType = 'info',
  currentUrl // Added parameter for the current URL object
) {
  const ITEMS_PER_PAGE = 10;
  let currentPage = parseInt(currentUrl.searchParams.get('page'), 10);
  if (isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  }

  const searchQuery = (currentUrl.searchParams.get('q') || '').trim();
  const currentApis = await loadApis(env); // Load fresh from KV (or cache if not invalidated)

  let allApiEntries = Array.from(currentApis.entries());
  if (searchQuery) {
    const lowerSearchQuery = searchQuery.toLowerCase();
    allApiEntries = allApiEntries.filter(
      ([prefix, target]) =>
        prefix.toLowerCase().includes(lowerSearchQuery) ||
        (target && target.toLowerCase().includes(lowerSearchQuery)) // Check if target exists
    );
  }

  const totalItems = allApiEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)); // Ensure totalPages is at least 1

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApiEntries = allApiEntries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const kvIsConfigured =
    env.API_ENDPOINTS && typeof env.API_ENDPOINTS.list === 'function';

  let apiListHtml = `<table><thead><tr><th>${t(
    'tableHeaderPrefix',
    lang
  )}</th><th>${t('tableHeaderTargetUrl', lang)}</th>`;
  if (kvIsConfigured && isAuthorized) {
    apiListHtml += `<th>${t('tableHeaderActions', lang)}</th>`;
  }
  apiListHtml += '</tr></thead><tbody>';

  if (allApiEntries.length === 0) {
    if (searchQuery) {
      apiListHtml += `<tr><td colspan="${kvIsConfigured && isAuthorized ? 3 : 2}">${t('noApiEndpointsSearch', lang, { query: escapeHtml(searchQuery) })}</td></tr>`;
    } else {
      apiListHtml += `<tr><td colspan="${kvIsConfigured && isAuthorized ? 3 : 2}">${t('noApiEndpoints', lang)}</td></tr>`;
    }
  } else {
    for (const [prefix, target] of paginatedApiEntries) {
      apiListHtml += `<tr><td>${escapeHtml(prefix)}</td><td>${escapeHtml(
        target
      )}</td>`;
      if (kvIsConfigured && isAuthorized) {
        const formId = `form-${prefix.replace(/[^a-zA-Z0-9]/g, '')}`;
        // Ensure confirmDelete uses the correct prefix for the item being deleted
        const confirmDeleteMessage = t('confirmDelete', lang, {
          prefix: escapeHtml(prefix),
        });
        apiListHtml += `<td>
          <form id="${formId}" method="POST" action="/admin/api" style="display: flex; align-items: center; gap: 5px;">
            <input type="hidden" name="original_prefix" value="${escapeHtml(prefix)}">
            <input type="text" name="prefix" value="${escapeHtml(prefix)}" required pattern="/.*" style="flex-grow: 1; min-width: 100px;">
            <input type="url" name="target" value="${escapeHtml(target)}" required style="flex-grow: 1; min-width: 150px;" placeholder="https://example.com/api">
            <button type="submit" name="action" value="update">${t('buttonUpdate', lang)}</button>
            <button type="submit" name="action" value="delete" onclick="return confirm('${t('confirmDelete', lang, { prefix: escapeHtml(prefix) })}');">${t('buttonDelete', lang)}</button>
          </form> 
        </td>`;
      }
      apiListHtml += `</tr>`;
    }
  }
  apiListHtml += '</tbody></table>';

  let paginationHtml = '';
  if (totalPages > 1) {
    paginationHtml = '<div class="pagination">';
    const baseUrlForPageLinks = new URL(currentUrl.pathname, currentUrl.origin);

    const createPageLink = (pageNum) => {
      const linkUrl = new URL(baseUrlForPageLinks.toString());
      currentUrl.searchParams.forEach((value, key) => {
        if (key !== 'page') {
          linkUrl.searchParams.set(key, value);
        }
      });
      if (pageNum > 1) {
        linkUrl.searchParams.set('page', pageNum);
      } else {
        linkUrl.searchParams.delete('page'); // Keep URL clean for page 1
      }
      if (searchQuery) {
        linkUrl.searchParams.set('q', searchQuery);
      }
      return linkUrl.toString();
    };

    // Previous button
    if (currentPage > 1) {
      paginationHtml += `<a href="${createPageLink(currentPage - 1)}">&laquo; ${t('paginationPrevious', lang)}</a>`;
    } else {
      paginationHtml += `<span class="disabled">&laquo; ${t('paginationPrevious', lang)}</span>`;
    }

    // Page numbers
    const pageLinkBuffer = 2; // Max 2 pages on each side of the current page
    let pageLinks = [];

    if (totalPages <= 1) {
      // Handles 0 or 1 total pages
      if (totalPages === 1) pageLinks.push(1);
    } else {
      // Always add page 1
      pageLinks.push(1);

      // Calculate window around current page
      // Start of the window, must be at least 2 (since 1 is already added)
      let windowStart = Math.max(2, currentPage - pageLinkBuffer);
      // End of the window, must be at most totalPages - 1 (since totalPages is added separately)
      let windowEnd = Math.min(totalPages - 1, currentPage + pageLinkBuffer);

      // Ellipsis after page 1 if needed
      if (windowStart > 2) {
        // Gap between 1 and windowStart
        pageLinks.push('...');
      }

      // Add pages in the window
      for (let i = windowStart; i <= windowEnd; i++) {
        pageLinks.push(i);
      }

      // Ellipsis before last page if needed
      if (windowEnd < totalPages - 1) {
        // Gap between windowEnd and totalPages
        pageLinks.push('...');
      }

      // Always add last page (if different from page 1)
      pageLinks.push(totalPages);
    }

    pageLinks.forEach((p) => {
      if (p === '...') paginationHtml += `<span class="ellipsis">...</span>`;
      else if (p === currentPage)
        paginationHtml += `<span class="current">${p}</span>`;
      else paginationHtml += `<a href="${createPageLink(p)}">${p}</a>`;
    });

    // Next button
    if (currentPage < totalPages) {
      paginationHtml += `<a href="${createPageLink(currentPage + 1)}">${t('paginationNext', lang)} &raquo;</a>`;
    } else {
      paginationHtml += `<span class="disabled">${t('paginationNext', lang)} &raquo;</span>`;
    }
    paginationHtml += '</div>';
  }

  let searchControlsHtml = `
    <div class="search-controls">
      <form method="GET" action="${currentUrl.pathname}">
        <input type="hidden" name="lang" value="${lang}">
  `;
  currentUrl.searchParams.forEach((value, key) => {
    if (key !== 'q' && key !== 'page' && key !== 'lang') {
      // Preserve other relevant params
      searchControlsHtml += `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`;
    }
  });
  searchControlsHtml += `
        <input type="search" name="q" placeholder="${t('searchPlaceholder', lang)}" value="${escapeHtml(searchQuery)}" aria-label="${t('searchPlaceholder', lang)}">
        <button type="submit">${t('buttonSearch', lang)}</button>
  `;
  if (searchQuery) {
    const clearSearchLink = new URL(currentUrl.pathname, currentUrl.origin);
    clearSearchLink.searchParams.set('lang', lang); // Preserve lang
    // Optionally preserve other non-q, non-page params if needed from currentUrl
    currentUrl.searchParams.forEach((value, key) => {
      if (key !== 'q' && key !== 'page' && key !== 'lang') {
        clearSearchLink.searchParams.set(key, value);
      }
    });
    searchControlsHtml += ` <a href="${clearSearchLink.toString()}" class="button-link clear-search-button">${t('buttonClearSearch', lang)}</a>`;
  }
  searchControlsHtml += `</form></div>`;

  const messageHtml = messageKey
    ? `<p class="message ${messageType}">${t(messageKey, lang, messageParams)}</p>`
    : '';

  let addNewApiFormHtml = '';
  let kvNoticeHtml = '';

  if (isAuthorized) {
    const formOnSubmitAttribute = !kvIsConfigured
      ? `onsubmit="event.preventDefault(); alert('${t('errorKvRequired', lang)}'); return false;"`
      : '';

    addNewApiFormHtml = `
      <!-- <h2>${t('addApiEndpoint', lang)}</h2> -->
      <form method="POST" action="/admin/api" class="add-api-form" style="display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: 10px;" ${formOnSubmitAttribute}>
        <input type="hidden" name="action" value="add">
        <input type="text" name="prefix" id="add-prefix" required pattern="/.*" placeholder="${t('labelPrefix', lang).replace('(e.g., /v1/api):', '(e.g., /v1/api)')}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        <input type="url" name="target" id="add-target" required placeholder="${t('labelTargetUrl', lang).replace('(e.g., https://your-target-api.com/endpoint):', '(e.g., https://your-target-api.com/endpoint)')}" style="width: 100%; padding: 8px; box-sizing: border-box;">
        <button type="submit">${t('buttonAddApi', lang)}</button>
      </form>
    `;
    if (!kvIsConfigured) {
      kvNoticeHtml = `<p class="message error">${t('kvNotConfigured', lang)}</p>`;
    }
  }

  let authControlsHtml = '';
  let modalHtml = '';
  let modalScript = '';

  if (isAuthorized) {
    authControlsHtml = `<a href="/admin/logout?lang=${lang}" class="logout-link">${t('logout', lang)}</a>`;
  } else {
    authControlsHtml = `<button id="loginButton" class="login-button">${t('login', lang)}</button>`;
    modalHtml = `
    <div id="loginModal" class="modal" style="display:none;">
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>${t('modalTitleLogin', lang)}</h2>
        <form id="loginForm">
          <div id="loginError" class="message error" style="display:none;"></div>
          <div><label for="modal_username">${t('modalLabelUsername', lang)}</label><input type="text" name="username" id="modal_username" required></div>
          <div><label for="modal_password">${t('modalLabelPassword', lang)}</label><input type="password" name="password" id="modal_password" required></div>
          <button type="submit">${t('modalLoginButton', lang)}</button>
        </form>
      </div>
    </div>`;
    modalScript = `
    <script>
      const loginModal = document.getElementById('loginModal');
      const loginButton = document.getElementById('loginButton');
      const closeButton = loginModal.querySelector('.close-button');
      const loginForm = document.getElementById('loginForm');
      const loginError = document.getElementById('loginError');

      if (loginButton) {
        loginButton.addEventListener('click', () => { loginModal.style.display = 'block'; loginError.style.display = 'none'; });
      }
      if (closeButton) {
        closeButton.addEventListener('click', () => { loginModal.style.display = 'none'; });
      }
      window.addEventListener('click', (event) => { if (event.target === loginModal) { loginModal.style.display = 'none'; } });

      if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          loginError.style.display = 'none';
          const formData = new FormData(loginForm);
          try {
            const response = await fetch('/admin/login', { method: 'POST', body: formData });
            const data = await response.json();
            if (response.ok && data.success) {
              window.location.reload();
            } else {
              loginError.textContent = data.messageKey ? t(data.messageKey, '${lang}') : t('loginFailedGeneric', '${lang}');
              loginError.style.display = 'block';
            }
          } catch (error) {
            loginError.textContent = t('loginErrorGeneric', '${lang}'); loginError.style.display = 'block'; console.error('Login fetch error:', error);
          }
        });
      }
    </script>`.replace(/\$\{lang\}/g, lang); // Inject current lang into script
  }

  return new Response(
    `<!DOCTYPE html><html lang="${lang}"><head><title>${t('pageTitle', lang)}</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background-color: #f8f9fa; color: #333; padding:20px;}
      .container { max-width: 1200px; margin: 0 auto; background-color: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
      .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
      h1, h2 { color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;}
      .admin-header h1 { font-size: 28px; margin-top: 0; margin-bottom: 0; border-bottom: none; padding-bottom: 0;}
      h2 { font-size: 22px; }
      a { color: #007bff; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .login-button {
        padding: 8px 15px; background-color: #007bff; color: white; 
        border-radius: 4px; text-decoration: none; font-size: 14px;
        border: none; cursor: pointer; transition: background-color 0.2s ease;
      }
      .login-button:hover { background-color: #0056b3; }
      .logout-link { 
        padding: 8px 15px; background-color: #6c757d; color: white; 
        border-radius: 4px; text-decoration: none; font-size: 14px;
        transition: background-color 0.2s ease;
      }
      .logout-link:hover { background-color: #5a6268; text-decoration: none; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); font-size: 14px;}
      th, td { border: 1px solid #dee2e6; padding: 10px 12px; text-align: left; vertical-align: middle; }
      th { background-color: #e9ecef; color: #495057; font-weight: bold; }
      tbody tr:nth-child(odd) { background-color: #f8f9fa; }
      tbody tr:hover { background-color: #e9ecef; }
      td form { display: flex; align-items: center; gap: 8px; }
      td form input[type="text"], td form input[type="url"] { flex-grow: 1; padding: 8px 10px; border: 1px solid #ced4da; border-radius: 4px; box-sizing: border-box; min-width: 120px; font-size: 14px;}
      button, input[type="submit"] { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.2s ease; color: white; }
      button[type="submit"][name="action"][value="add"],
      button[type="submit"][name="action"][value="update"],
      .add-api-form button[type="submit"] { background-color: #007bff; }
      button[type="submit"][name="action"][value="add"]:hover,
      button[type="submit"][name="action"][value="update"]:hover,
      .add-api-form button[type="submit"]:hover { background-color: #0056b3; }
      button[type="submit"][name="action"][value="delete"] { background-color: #dc3545; }
      button[type="submit"][name="action"][value="delete"]:hover { background-color: #c82333; }
      .message { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; font-size: 15px; }
      .message.success { color: #155724; background-color: #d4edda; border-color: #c3e6cb; }
      .message.error { color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; }
      .message.info { color: #0c5460; background-color: #d1ecf1; border-color: #bee5eb; }
      .add-api-form div { margin-bottom: 15px; }
      .add-api-form label { display: block; margin-bottom: 5px; font-weight: bold; color: #495057; font-size: 14px;}
      .add-api-form input[type="text"], .add-api-form input[type="url"] { width: 100%; max-width: 450px; padding: 10px; border: 1px solid #ced4da; border-radius: 4px; box-sizing: border-box; font-size: 14px;}
      .add-api-form button[type="submit"] { padding: 10px 20px; font-size: 16px; }
      /* Modal Styles */
      .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4); }
      .modal-content { background-color: #fefefe; margin: 15% auto; padding: 25px 30px; border: 1px solid #888; width: 90%; max-width: 400px; border-radius: 8px; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19); text-align: left; }
      .modal-content h2 { text-align: center; margin-top: 0; color: #333; margin-bottom:20px; }
      .modal-content form div { margin-bottom: 15px; }
      .modal-content label { display: block; margin-bottom: 5px; color: #555; font-weight: bold; font-size: 14px;}
      .modal-content input[type="text"], .modal-content input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 14px;}
      .modal-content button[type="submit"] { width: 100%; padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease;}
      .modal-content button[type="submit"]:hover { background-color: #0056b3; }
      .close-button { color: #aaa; float: right; font-size: 28px; font-weight: bold; line-height: 0.8; }
      .close-button:hover, .close-button:focus { color: black; text-decoration: none; cursor: pointer; }
      .modal-content .message.error { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; font-size: 14px; text-align:center; }
    </style></head><body>
    <style>
      .search-controls { /* margin-bottom: 20px; /* Removed as it's now in the header */ }
      .search-controls form { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .search-controls input[type="search"] { padding: 8px 10px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; min-width: 200px; flex-grow: 1; max-width: 350px;}
      .search-controls button, .search-controls .button-link { padding: 9px 15px; font-size: 14px; white-space: nowrap; } /* Match button height */
      .clear-search-button { background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; display: inline-block; line-height: normal; }
      .clear-search-button:hover { background-color: #5a6268; text-decoration: none; }
    </style>
    <style>.footer {display: flex; align-items: center; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #6c757d; }</style>
    <div class="container">
    <style>
      .pagination { display: flex; justify-content: center; align-items: center; margin-top: 20px; margin-bottom: 20px; gap: 5px; flex-wrap: wrap; }
      .pagination a, .pagination span { padding: 8px 12px; border: 1px solid #dee2e6; text-decoration: none; color: #007bff; border-radius: 4px; font-size: 14px; }
      .pagination a:hover { background-color: #e9ecef; border-color: #adb5bd; }
      .pagination span.current { background-color: #007bff; color: white; border-color: #007bff; font-weight: bold; }
      .pagination span.disabled { color: #6c757d; background-color: #f8f9fa; border-color: #dee2e6; cursor: not-allowed; }
      .pagination span.ellipsis { border: none; padding: 8px 0px; color: #6c757d; }
    </style></head><body>
    <div class="container">
      <div class="admin-header">
        <h1><a href="/admin?lang=${lang}">${t('mainTitle', lang)}</a></h1>
        ${searchControlsHtml}
      </div>
      ${messageHtml}
      ${isAuthorized ? addNewApiFormHtml : ''}
      ${kvNoticeHtml}
      <!--<h2>${t('currentApiEndpoints', lang)}</h2>-->
      ${apiListHtml}
      ${paginationHtml}
      <div class="footer">
        <span style="display: flex; align-items: center;">
        ${t('footerCopyright', lang, { year: new Date().getFullYear() })}
        <a href="https://github.com/lopinx/serverless-api-proxy/releases"><img src="https://camo.githubusercontent.com/cdd69748c687a1d7bc9c9c1e836596fee58b58335bdf60d28b4f8f6c81596cfb/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f72656c656173652f6c6f70696e782f7365727665726c6573732d6170692d70726f78792e737667" alt="GitHub release" data-canonical-src="https://img.shields.io/github/release/lopinx/serverless-api-proxy.svg" style="max-width: 100%;"></a>
        <a href="https://github.com/lopinx/serverless-api-proxy/stargazers"><img src="https://camo.githubusercontent.com/f8a87a75ce9ef27e3f9b56c3ea322d5110b3675ceaddca67c7e10dd9e6982b78/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6c6f70696e782f7365727665726c6573732d6170692d70726f7879" alt="GitHub stars" data-canonical-src="https://img.shields.io/github/stars/lopinx/serverless-api-proxy" style="max-width: 100%;"></a>
        <a href="https://github.com/lopinx/serverless-api-proxy/network/members"><img src="https://camo.githubusercontent.com/1b84ea023066dc68baf2c0ff7fe0efcb0a22b52f07d8b4bc1e0cb0edfa42e53b/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f666f726b732f6c6f70696e782f7365727665726c6573732d6170692d70726f7879" alt="GitHub forks" data-canonical-src="https://img.shields.io/github/forks/lopinx/serverless-api-proxy" style="max-width: 100%;"></a>
        <a href="https://github.com/lopinx/serverless-api-proxy/issues"><img src="https://camo.githubusercontent.com/4e2823f4e59003b1e0a0c3837f82ee2dbe19c987c940c0b11d0957d68d1463a6/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f6c6f70696e782f7365727665726c6573732d6170692d70726f7879" alt="GitHub issues" data-canonical-src="https://img.shields.io/github/issues/lopinx/serverless-api-proxy" style="max-width: 100%;"></a>
        <a href="https://github.com/lopinx/serverless-api-proxy/blob/main/LICENSE"><img src="https://camo.githubusercontent.com/68da4289b6968ecca729c2f63eb44f0d1193d42b4eae53fa4465e3b0346d7402/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6c6963656e73652f6c6f70696e782f7365727665726c6573732d6170692d70726f7879" alt="GitHub license" data-canonical-src="https://img.shields.io/github/license/lopinx/serverless-api-proxy" style="max-width: 100%;"></a></span>
        ${authControlsHtml}
      </div>
    </div>
    ${!isAuthorized ? modalHtml : ''}
    ${!isAuthorized ? modalScript : ''}
    </body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function handleAdminApiAction(request, env) {
  const formData = await request.formData();
  const action = formData.get('action');

  // Ensure KV is configured before proceeding with actions that require it.
  // This check is vital as only authorized users should reach here,
  // but this function modifies KV.
  const lang = new URL(request.url).searchParams.get('lang') || 'en'; // Get lang for redirect, default to English

  if (!env.API_ENDPOINTS || typeof env.API_ENDPOINTS.list !== 'function') {
    const messageKey = 'errorKvRequired';
    const messageType = 'error';
    const redirectUrl = new URL(
      request.headers.get('referer') || '/admin',
      request.url
    );
    redirectUrl.searchParams.set('messageKey', messageKey);
    redirectUrl.searchParams.set('messageType', messageType);
    redirectUrl.searchParams.set('lang', lang);
    return Response.redirect(redirectUrl.toString(), 302);
  }

  const prefix = formData.get('prefix')?.trim();
  const target = formData.get('target')?.trim();
  const original_prefix = formData.get('original_prefix')?.trim();
  let messageKey = '';
  let messageParams = {};
  let messageType = 'error'; // Default to error

  if (!prefix || (action !== 'delete' && !target)) {
    messageKey = 'errorFieldsRequired';
  } else if (!prefix.startsWith('/')) {
    messageKey = 'errorPrefixFormat';
  } else {
    try {
      if (action === 'add') {
        const existing = await env.API_ENDPOINTS.get(prefix);
        if (existing !== null) {
          // 前缀已存在，执行更新操作
          await env.API_ENDPOINTS.put(prefix, target);
          messageKey = 'apiExistsUpdated';
          messageParams = { prefix };
          messageType = 'success';
        } else {
          // 前缀不存在，执行添加操作
          await env.API_ENDPOINTS.put(prefix, target);
          messageKey = 'apiAddedSuccess';
          messageParams = { prefix };
          messageType = 'success';
        }
      } else if (action === 'update') {
        if (!original_prefix) {
          messageKey = 'errorUpdateMissingOriginalPrefix';
        } else {
          if (original_prefix !== prefix) {
            // Prefix changed
            const existingNewPrefix = await env.API_ENDPOINTS.get(prefix);
            if (existingNewPrefix !== null) {
              messageKey = 'errorUpdateNewPrefixExists';
              messageParams = { prefix };
            } else {
              await env.API_ENDPOINTS.delete(original_prefix);
              await env.API_ENDPOINTS.put(prefix, target);
              messageKey = 'apiUpdatedSuccess';
              messageParams = { original_prefix, prefix };
              messageType = 'success';
            }
          } else {
            // Prefix same, only target might have changed
            await env.API_ENDPOINTS.put(prefix, target);
            messageKey = 'apiTargetUpdatedSuccess';
            messageParams = { prefix };
            messageType = 'success';
          }
        }
      } else if (action === 'delete') {
        await env.API_ENDPOINTS.delete(prefix); // original_prefix is not needed for delete, prefix is the key
        messageKey = 'apiDeletedSuccess';
        messageParams = { prefix };
        messageType = 'success';
      }
      if (messageType === 'success') {
        apiMapCache = null; // Invalidate cache on any successful modification
      }
    } catch (e) {
      console.error('KV operation failed:', e);
      messageKey = 'errorKvOperation';
      messageParams = { errorMessage: e.message };
      messageType = 'error'; // Ensure it's error on catch
    }
  }

  // Redirect back to the admin dashboard (which is now also the root) with a message
  const refererHeader = request.headers.get('referer');
  const fallbackRedirectUrl = new URL('/admin', request.url); // Fallback if no referer
  fallbackRedirectUrl.searchParams.set('lang', lang); // Always set lang on fallback

  // Use referer to try and preserve search/pagination state
  const redirectUrl = refererHeader
    ? new URL(refererHeader)
    : fallbackRedirectUrl;

  // Clear out old message params from referer if any, we'll set new ones
  redirectUrl.searchParams.delete('messageKey');
  redirectUrl.searchParams.delete('messageParams');
  redirectUrl.searchParams.delete('messageType');

  // Set the new message and ensure lang is correctly set from current context
  redirectUrl.searchParams.set('messageKey', messageKey);
  if (Object.keys(messageParams).length > 0) {
    redirectUrl.searchParams.set(
      'messageParams',
      encodeURIComponent(JSON.stringify(messageParams))
    );
  }
  redirectUrl.searchParams.set('messageType', messageType);
  redirectUrl.searchParams.set('lang', lang); // Override lang from referer with current action's lang context

  return Response.redirect(redirectUrl.toString(), 302);
}
