import { SnackSeverity } from "./types";

export interface SnackbarClient {
  sendError: (text: string) => void;
  sendSuccess: (text: string) => void;
}

class Snackbar implements SnackbarClient {
  sendError(text: string) {
    this.send(text, "error");
  }

  sendSuccess(text: string) {
    this.send(text, "success");
  }

  private send(text: string, severity: SnackSeverity) {
    window.postMessage({ text, severity }, window.origin);
  }
}

/**
 * snackbarClient exposes a simple API to interact with the Snackbar component
 */
export const snackbarClient = new Snackbar();
