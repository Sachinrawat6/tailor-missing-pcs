import { BASE_URL } from '../constants/index.js';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin wrapper around fetch.
 * Throws ApiError on non-2xx responses.
 */
export async function apiFetch(path, options = {}) {
  const { headers = {}, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...rest,
  });

  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status);
  }

  return res.json();
}
