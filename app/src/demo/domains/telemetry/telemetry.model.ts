import { makeAutoObservable } from "mobx";

/**
 * TelemetryModel holds data used for various telemetry events/attributes
 */
export class TelemetryModel {
  opener = "";

  constructor() {
    makeAutoObservable(this);
  }

  setOpener(value: string) {
    this.opener = value;
  }
}
