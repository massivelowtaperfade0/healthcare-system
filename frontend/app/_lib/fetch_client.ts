
export const fetchWithAuth = async (url: string, options: any = {}) => {

  const activeOrgId = typeof window !== 'undefined' ? localStorage.getItem('x-org-id') : null;

  // 1. Default to GET and include credentials for Http-Only cookies
  const requestOptions = {
    method: 'GET', // Default method
    ...options,
    credentials: 'include',
    headers: {
      ...(activeOrgId && { 'x-org-id': activeOrgId }),
      ...options.headers,
    }
  };

  // 2. Add JSON headers if sending a body
  if (requestOptions.body) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Content-Type': 'application/json',
    };
    if (typeof requestOptions.body !== 'string') {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }
  }

  try {
    let response = await fetch(url, requestOptions);

    if (response.status === 401) {
      // Safety: Use text() then parse so it doesn't crash on non-JSON 401s
      const rawText = await response.clone().text();
      let data;
      try { data = JSON.parse(rawText); } catch { data = {}; }

      if (data.message === 'Token expired') {
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          return await fetch(url, requestOptions); // Retry
        }
      }
    }
    return response;
  } catch (err) {
    console.error("Network or Auth Error:", err);
    throw err;
  }
};