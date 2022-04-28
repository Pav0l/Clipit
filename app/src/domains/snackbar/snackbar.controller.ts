import { SyntheticEvent } from "react";
import { SnackbarModel } from "./snackbar.model";

export interface SnackbarClient {
  sendError: (text: string, durationInMs?: number | null) => void;
  sendSuccess: (text: string, durationInMs?: number | null) => void;
  sendInfo: (text: string, durationInMs?: number | null) => void;
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

  sendError = (text: string, durationInMs?: number | null) => {
    this.model.addErrorToSnackbarQue(text, durationInMs);
    this.showNextMessageFromQue();
  };

  sendInfo = (text: string, durationInMs?: number | null) => {
    this.model.addInfoToSnackbarQue(text, durationInMs);
    this.showNextMessageFromQue();
  };

  sendSuccess = (text: string, durationInMs?: number | null) => {
    this.model.addSuccessToSnackbarQue(text, durationInMs);
    this.showNextMessageFromQue();
  };

  private showNextMessageFromQue() {
    if (this.model.messageList.length && !this.model.message) {
      this.model.displayMessageFromQue();
    }
  }
}
