import { makeAutoObservable } from "mobx"

/**
 * SnackbarStore handles messages that should be displayed to user via Snackbar
 */
export class SnackbarStore {
  open = false;
  message: ISnack | undefined = undefined;
  messageList: ISnack[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setSnackError = (text: string) => {
    this.setSnackMessage(text, "error");
  }

  setSnackSuccess = (text: string) => {
    this.setSnackMessage(text, "success");
  }

  setOpen = (val: boolean) => {
    this.open = val;
  }

  private setSnackMessage(text: string, severity: SnackSeverity) {
    this.messageList.push({ text, severity })
  }
}

export type SnackSeverity = "error" | "success";

interface ISnack {
  text: string;
  severity: SnackSeverity;
  /**
   * Duration in ms after which the snackbar is hidden
   */
  duration?: number;
}
