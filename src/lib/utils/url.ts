/**
 * Validates if a redirect path is safe (internal to the site).
 * It must start with a single '/' and not be followed by another '/' or '\'.
 */
export function isSafeRedirect(path: string): boolean {
  if (!path.startsWith('/')) {
    return false
  }

  // Prevent protocol-relative redirects like //evil.com
  if (path.startsWith('//') || path.startsWith('/\\')) {
    return false
  }

  return true
}
