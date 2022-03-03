export function parseJwt<T>(token: string): T | undefined {
  try {
    return JSON.parse(window.atob(token.split(".")[1]));
  } catch {
    return undefined;
  }
}
