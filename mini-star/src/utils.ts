export function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : path + '/';
}

export function removeTrailingSlash(path: string): string {
  return path.replace(/\/$/, '');
}

export function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

export function getPluginNameFromUrl(url: string): string {
  const match = url.match(/plugins\/([^/]+)/);
  return match ? match[1] : '';
}

export function processModulePath(url: string, path: string): string {
  if (path.startsWith('.')) {
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    return joinPath(baseUrl, path);
  }
  return path;
}

export function mergeUrl(baseUrl: string, relativeUrl: string): string {
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  const base = new URL(baseUrl, 'http://localhost');
  const resolved = new URL(relativeUrl, base);
  return resolved.pathname + resolved.search + resolved.hash;
}