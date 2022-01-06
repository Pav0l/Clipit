import { makeAutoObservable } from "mobx"

/**
 * OAuthModel keeps track of users authorization status
 */
export class OAuthModel {

  isLoggedIn: boolean = false;
  referrer?: string;

  constructor() {
    makeAutoObservable(this);
  }

  setLoggedIn(value: boolean) {
    this.isLoggedIn = value;
  }

  setReferrer(value: string) {
    this.referrer = value;
  }
}
