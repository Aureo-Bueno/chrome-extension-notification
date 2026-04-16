export function parseDomain(url: string): string {
  return new URL(url).hostname;
}

export function isInjectableUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
