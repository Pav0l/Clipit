import { SyntheticEvent } from "react";
import { SnackbarModel } from "./snackbar.model";
import { ISnack, SnackSeverity } from "./types";

export interface SnackbarClient {
  sendError: (text: string) => void;
  sendSuccess: (text: string) => void;
  sendInfo: (text: string) => void;
}

export class SnackbarController implements SnackbarClient {
  constructor(private model: SnackbarModel) { }


  handleSnackClose = (_: SyntheticEvent | MouseEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    this.model.close();
    this.showNextMessageFromQue();
  };

  handleMessage = (ev: MessageEvent<ISnack>) => {
    if (ev.origin !== window.origin) {
      return;
    }

    if (ev.data && ev.data.text && ev.data.severity) {
      switch (ev.data.severity) {
        case "error":
          this.model.addErrorToSnackbarQue(ev.data.text, ev.data.duration);
          break;
        case "success":
          this.model.addSuccessToSnackbarQue(
            ev.data.text,
            ev.data.duration
          );
          break;
        case "info":
          this.model.addInfoToSnackbarQue(ev.data.text, ev.data.duration);
          break;
      }

      this.showNextMessageFromQue();
    }
  };

  sendError(text: string) {
    this.send(text, "error");
  }

  sendInfo(text: string) {
    this.send(text, "info");
  }

  sendSuccess(text: string) {
    this.send(text, "success");
  }

  private send(text: string, severity: SnackSeverity) {
    window.postMessage({ text, severity }, window.origin);
  }

  private showNextMessageFromQue() {
    if (this.model.messageList.length && !this.model.message) {
      this.model.displayMessageFromQue();
    }
  }
}
