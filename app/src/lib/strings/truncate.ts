/**
 * `truncate` truncates a string to specified length, adding "..." at the end
 */
export function truncate(str: string, len = 5): string {
  if (!str) return str;

  if (str.length <= len) return str;

  return str.substring(0, len) + "...";
}
