import { makeAutoObservable } from "mobx";

/**
 * TelemetryModel holds data used for various telemetry events/attributes
 */
export class TelemetryModel {
  opener = "";
  ip: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  setOpener(value: string) {
    this.opener = value;
  }

  setIp(value: any) {
    this.ip = value;
  }
}
