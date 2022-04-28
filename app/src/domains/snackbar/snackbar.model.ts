import { makeAutoObservable } from "mobx";
import { ISnack, SnackSeverity } from "./types";

const DEFAULT_SNACKBAR_DURATION = 5000;

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

  addErrorToSnackbarQue(text: string, durationInMs?: number | null) {
    this.pushSnackMessage(text, "error", durationInMs);
    this.open = true;
  }

  addInfoToSnackbarQue(text: string, durationInMs?: number | null) {
    this.pushSnackMessage(text, "info", durationInMs);
    this.open = true;
  }

  addSuccessToSnackbarQue(text: string, durationInMs?: number | null) {
    this.pushSnackMessage(text, "success", durationInMs);
    this.open = true;
  }

  close() {
    this.message = undefined;
    this.open = false;
  }

  private pushSnackMessage(
    text: string,
    severity: SnackSeverity,
    durationInMs: number | null = DEFAULT_SNACKBAR_DURATION
  ) {
    this.messageList.push({ text, severity, durationInMs });
  }
}
