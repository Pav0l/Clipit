import { makeAutoObservable } from "mobx";
import { MetaModel } from "../meta/meta.model";

/**
 * OAuthModel keeps track of users authorization status
 */
export class OAuthModel {
  meta: MetaModel;

  isLoggedIn = false;
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
