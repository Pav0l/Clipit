import { makeAutoObservable } from "mobx";

/**
 * MetaStore keeps metadata about stores (loading, error, ...)
 */
export class MetaModel {
  isLoading = false;
  hasError = false;
  error = "";

  constructor() {
    makeAutoObservable(this);
  }

  setLoading = (value: boolean) => {
    this.isLoading = value;
  };

  setError = (message: string) => {
    this.hasError = true;
    this.error = message;
  };
}
