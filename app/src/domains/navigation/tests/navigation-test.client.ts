import { INavigationClient } from "../navigation.client";

type Listener = (path: string, href: string) => void;

export class NavigationTestClient implements INavigationClient {
  private history: string[] = [];
  private listeners: Listener[] = [];

  push(path: string): void {
    this.history.push(path);
  }

  replace(path: string): void {
    this.history[this.history.length - 1] = path;
  }

  onPopState(listener: Listener) {
    this.listeners.push(listener);
  }

  getHistory() {
    return this.history;
  }

  emitPopStateForTest() {
    // TODO
  }
}
