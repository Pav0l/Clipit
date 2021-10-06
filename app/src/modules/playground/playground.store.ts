import { makeAutoObservable } from "mobx"

export class TestStore {
  mightHaveText?: string;
  yesText: string;

  constructor() {
    makeAutoObservable(this);
    this.yesText = "yes text!";
  }

  setText(text: string) {
    this.mightHaveText = text;
  }

  setYesText(text: string) {
    this.yesText = text;
  }
}
