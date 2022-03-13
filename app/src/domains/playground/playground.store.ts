import { makeAutoObservable } from "mobx";

interface Data {
  id: number;
  text: string;
}
export class TestStore {
  mightHaveText?: string;
  yesText: string;

  data: Data[] = [];

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

  addData(data: Data): void {
    this.data.push(data);
  }

  findData(id: number): Data | undefined {
    return this.data.filter((d) => d.id === id)[0];
  }

  replaceData(data: Data): void {
    const original = this.findData(data.id);
    if (!original) {
      this.addData(data);
      return;
    }
    const idx = this.data.indexOf(original);
    this.data[idx] = data;
  }
}
