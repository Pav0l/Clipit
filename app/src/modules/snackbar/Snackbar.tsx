import { SyntheticEvent, MouseEvent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import Snackbar from "@material-ui/core/Snackbar";
import Grow from "@material-ui/core/Grow";
import { TransitionProps } from "@material-ui/core/transitions";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { useStore } from "../../store/StoreProvider";
import { ISnack } from "./snackbar.model";

function GrowTransition(props: TransitionProps) {
  return <Grow {...props} />;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function TransitionSnackbar() {
  const { snackbarStore } = useStore();
  const { message, messageList, open } = snackbarStore;

  const handleClose = (_: SyntheticEvent | MouseEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    snackbarStore.close();
  };

  const handleMessage = (ev: MessageEvent<ISnack>) => {
    console.log("[snackbar]:event", ev);
    if (ev.data && ev.data.text && ev.data.severity) {
      switch (ev.data.severity) {
        case "error":
          snackbarStore.addErrorToSnackbarQue(ev.data.text, ev.data.duration);
          break;
        case "success":
          snackbarStore.addSuccessToSnackbarQue(ev.data.text, ev.data.duration);
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (messageList.length && !message) {
      // show new message
      snackbarStore.displayMessageFromQue();
    } else if (messageList.length && message && open) {
      // new snack addedd to msgList
      // close current snack
      snackbarStore.close();
    }
  }, [message, messageList, open]);

  if (!message) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={message.duration ? message.duration : 6000}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left"
      }}
      TransitionComponent={GrowTransition}
    >
      <Alert severity={message.severity}>{message.text}</Alert>
    </Snackbar>
  );
}

export default observer(TransitionSnackbar);
