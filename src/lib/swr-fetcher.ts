// Generic fetcher for SWR
export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    // For non-OK responses, reject with error info (including 400)
    const error: { status: number; statusText: string; body?: unknown } = {
      status: res.status,
      statusText: res.statusText,
    };
    try {
      // Try to parse error body as JSON if possible
      error.body = await res.json();
    } catch {
      // If not JSON, ignore
    }
    return Promise.reject(error);
  }
  // For 204 No Content, return empty array for consistency
  if (res.status === 204) {
    return [] as T;
  }
  return res.json();
};
