/**
 * Real HTTP client for Admin Panel API calls.
 * Uses native fetch with credentials (cookies) included.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(method: string, url: string, body?: any, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    credentials: "include", // send httpOnly cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw error;
  }

  // Return blob as-is for downloads
  const contentType = res.headers.get("content-type") || "";
  const reqHeaders = (options.headers || {}) as Record<string, string>;
  if (contentType.includes("application/pdf") || reqHeaders["Accept"] === "application/pdf") {
    return { data: await res.blob() };
  }

  return { data: await res.json() };
}

const adminApi = {
  get: (url: string, opts?: RequestInit) => request("GET", url, undefined, opts),
  post: (url: string, body?: any, opts?: RequestInit) => request("POST", url, body, opts),
  put: (url: string, body?: any, opts?: RequestInit) => request("PUT", url, body, opts),
  delete: (url: string, opts?: RequestInit) => request("DELETE", url, undefined, opts),
};

export default adminApi;
