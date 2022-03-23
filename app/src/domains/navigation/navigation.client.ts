export interface INavigationClient {
  /**
   * `push` creates and activate another history entry associated with the current document.
   * @param url The url does not need to be absolute; if it's relative, it's resolved relative to the current URL. The new URL must be of the same origin as the current URL; otherwise, pushState() will throw an exception
   */
  push(path: string): void;

  /**
   * works like `push`, except that it modifies the current history entry instead of creating a new one
   */
  replace(path: string): void;
}

export class NavigationClient implements INavigationClient {
  constructor(private window: Window) {}

  push(path: string) {
    this.window.history.pushState("", "", path);
  }

  replace(path: string) {
    this.window.history.replaceState("", "", path);
  }
}
