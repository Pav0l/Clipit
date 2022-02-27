import { makeAutoObservable } from "mobx";
import { AppError } from "../../lib/errors/errors";

/**
 * MetaStore keeps metadata about stores (loading, error, ...)
 */
export class MetaModel {
  isLoading = false;
  error?: AppError;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading = (value: boolean) => {
    this.isLoading = value;
  };

  setError = (err: AppError) => {
    this.error = err;
  };

  resetError = () => {
    this.error = undefined;
  };
}
