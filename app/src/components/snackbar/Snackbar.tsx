import { SyntheticEvent, MouseEvent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import Snackbar from "@material-ui/core/Snackbar";
import Grow from "@material-ui/core/Grow";
import { TransitionProps } from "@material-ui/core/transitions";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { useStore } from "../../store/StoreProvider";
import { SnackbarController } from "../../lib/snackbar/snackbar.controller";

function GrowTransition(props: TransitionProps) {
  return <Grow {...props} />;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface Props {
  setOpen: (val: boolean) => void;
}

function TransitionSnackbar() {
  const { snackbarStore } = useStore();
  const { message, messageList, open } = snackbarStore;
  const controller = new SnackbarController(snackbarStore);

  const handleClose = (_: SyntheticEvent | MouseEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    controller.close();
  };

  useEffect(() => {
    if (messageList.length && !message) {
      // show new message
      controller.renderMessage();
    } else if (messageList.length && message && open) {
      // new snack addedd to msgList
      // close current snack -> will cause re-render and call onExited
      controller.close();
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
