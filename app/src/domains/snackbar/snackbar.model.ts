import { makeAutoObservable } from "mobx"
import { ISnack, SnackSeverity } from "./types";

/**
 * SnackbarModel handles messages that should be displayed to user via Snackbar
 */
export class SnackbarModel {
  open = false;
  // currently displayed message
  message: ISnack | undefined = undefined;
  // list (queue) of messages to be displayed after current message is closed/duration elapsed
  messageList: ISnack[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  displayMessageFromQue() {
    this.message = this.messageList[0];
    this.messageList = this.messageList.slice(1);
    this.open = true;
  }

  addErrorToSnackbarQue(text: string, duration?: number) {
    this.pushSnackMessage(text, "error", duration);
    this.open = true;
  }

  addInfoToSnackbarQue(text: string, duration?: number) {
    this.pushSnackMessage(text, "info", duration);
    this.open = true;
  }

  addSuccessToSnackbarQue(text: string, duration?: number) {
    this.pushSnackMessage(text, "success", duration);
    this.open = true;
  }

  close() {
    this.message = undefined;
    this.open = false;
  }

  private pushSnackMessage(text: string, severity: SnackSeverity, duration?: number) {
    this.messageList.push({ text, severity })
  }
}
