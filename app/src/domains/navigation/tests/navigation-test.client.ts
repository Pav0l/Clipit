import { INavigationClient } from "../navigation.client";

export class NavigationTestClient implements INavigationClient {
  private history: string[] = [];

  push(path: string): void {
    this.history.push(path);
  }

  replace(path: string): void {
    this.history[this.history.length - 1] = path;
  }

  getHistory() {
    return this.history;
  }
}
