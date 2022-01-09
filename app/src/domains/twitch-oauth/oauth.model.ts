import { makeAutoObservable } from "mobx"
import { MetaModel } from "../app/meta.model";

/**
 * OAuthModel keeps track of users authorization status
 */
export class OAuthModel {
  meta: MetaModel;

  isLoggedIn: boolean = false;
  referrer?: string;

  constructor(meta: MetaModel) {
    makeAutoObservable(this);
    this.meta = meta;
  }

  setLoggedIn(value: boolean) {
    this.isLoggedIn = value;
  }

  setReferrer(value: string) {
    this.referrer = value;
  }
}
