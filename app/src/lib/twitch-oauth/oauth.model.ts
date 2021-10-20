import { makeAutoObservable } from "mobx"

/**
 * OAuthModel keeps track of users authorization status
 */
export class OAuthModel {

  isLoggedIn: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLoggedIn(value: boolean) {
    this.isLoggedIn = value;
  }
}
