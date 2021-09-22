import { makeAutoObservable } from "mobx"

/**
 * MetaStore keeps metadata about stores (loading, error, ...)
 */
export class MetaStore {
  isLoading: boolean = false;
  hasError: boolean = false;
  error: string = ""

  constructor() {
    makeAutoObservable(this);
  }

  setLoading = (value: boolean) => {
    this.isLoading = value;
  }

  setError = (message: string) => {
    this.hasError = true;
    this.error = message;
  }
}
