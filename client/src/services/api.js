const API_BASE = '/api';

/**
 * Common fetch wrapper with automatic JWT token attachment and error handling
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('gramseva_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // If downloading a blob/file (like CSV export)
    if (options.responseType === 'blob') {
      if (!res.ok) {
        throw new Error('Failed to download file');
      }
      return await res.blob();
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),
  post: (url, body, options) => request(url, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options }),
  download: (url) => request(url, { method: 'GET', responseType: 'blob' })
};

export default api;
