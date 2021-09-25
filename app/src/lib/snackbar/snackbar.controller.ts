import { SnackbarStore } from "../../store/snackbar.store";



export class SnackbarController {

  constructor(private store: SnackbarStore) { }

  renderMessage() {
    this.store.message = this.store.messageList[0];
    this.store.messageList = this.store.messageList.slice(1);
    this.open();
  }

  displayError(msg: string) {
    this.store.setSnackError(msg);
    this.open();
  }

  displaySuccess(msg: string) {
    this.store.setSnackSuccess(msg);
    this.open();
  }

  open() {
    this.store.setOpen(true);
  }

  close() {
    this.store.message = undefined;
    this.store.setOpen(false);
  }
}