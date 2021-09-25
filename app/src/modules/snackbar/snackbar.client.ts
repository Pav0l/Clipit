import { SnackSeverity } from "./snackbar.model";


class SnackbarClient {

  sendError(text: string) {
    this.send(text, "error");
  }

  sendSuccess(text: string) {
    this.send(text, "success");
  }

  private send(text: string, severity: SnackSeverity) {
    console.log('sending msg', text, severity, window.origin, window.opener);
    window.postMessage({ text, severity }, "*");
  }
}

export const snackbarClient = new SnackbarClient();
