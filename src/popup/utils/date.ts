export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function toDatetimeLocalValue(timestamp: number): string {
  const date = new Date(timestamp);
  const offsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offsetMinutes * 60_000);
  return localDate.toISOString().slice(0, 16);
}
