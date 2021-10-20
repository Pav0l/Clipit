
export interface ILocalStorage {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
}

export class LocalStorage implements ILocalStorage {

  setItem(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  removeItem(key: string): void {
    window.localStorage.removeItem(key);
  }
}


export const localStorage = new LocalStorage();
