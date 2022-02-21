import { SyntheticEvent } from "react";
import { SnackbarModel } from "./snackbar.model";

export interface SnackbarClient {
  sendError: (text: string) => void;
  sendSuccess: (text: string) => void;
  sendInfo: (text: string) => void;
}

export class SnackbarController implements SnackbarClient {
  constructor(private model: SnackbarModel) {}

  handleSnackClose = (_: SyntheticEvent | MouseEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    this.model.close();
    this.showNextMessageFromQue();
  };

  sendError = (text: string, duration?: number) => {
    this.model.addErrorToSnackbarQue(text, duration);
    this.showNextMessageFromQue();
  };

  sendInfo = (text: string, duration?: number) => {
    this.model.addInfoToSnackbarQue(text, duration);
    this.showNextMessageFromQue();
  };

  sendSuccess = (text: string, duration?: number) => {
    this.model.addSuccessToSnackbarQue(text, duration);
    this.showNextMessageFromQue();
  };

  private showNextMessageFromQue() {
    if (this.model.messageList.length && !this.model.message) {
      this.model.displayMessageFromQue();
    }
  }
}
