import { SnackSeverity } from "./types";


class SnackbarClient {

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

export const snackbarClient = new SnackbarClient();
