/**
 * A list of auth-related endpoints.
 * If a 401 error occurs on one of these routes, we should NOT
 * attempt to refresh the token. It's a final failure.
 */
export const AUTH_FAILURE_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/complete-setup',
  '/api/auth/logout',
];

/**
 * Helper function to check if a URL is an auth failure endpoint.
 */
export function isAuthFailureEndpoint(url: string): boolean {
  return AUTH_FAILURE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}
