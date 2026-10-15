export function safeReturnTo(value: string | null | undefined) {
  if (!value || value.length > 1000 || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/';
  try {
    const url = new URL(value, 'https://campus.invalid');
    if (url.origin !== 'https://campus.invalid' || !/^\/(?:create|mine|events\/\d+)?$/.test(url.pathname)) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}
export function loginHref(next: string, reason = '') {
  return `/login?next=${encodeURIComponent(safeReturnTo(next))}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`;
}
