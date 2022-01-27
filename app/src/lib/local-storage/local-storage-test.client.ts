import { ILocalStorage } from "./local-storage.client";

export class LocalStorageTestClient implements ILocalStorage {
  private inMemoryStorage: Record<string, string> = {};

  setItem(key: string, value: string) {
    this.inMemoryStorage[key] = value;
  }

  removeItem(key: string) {
    delete this.inMemoryStorage[key];
  }

  getItem(key: string): string | null {
    return this.inMemoryStorage[key] ?? null;
  }
}
