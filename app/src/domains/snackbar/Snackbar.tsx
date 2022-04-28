import { observer } from "mobx-react-lite";
import Snackbar from "@material-ui/core/Snackbar";
import Grow from "@material-ui/core/Grow";
import { TransitionProps } from "@material-ui/core/transitions";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { SnackbarModel } from "./snackbar.model";
import { SnackbarController } from "./snackbar.controller";

function GrowTransition(props: TransitionProps) {
  return <Grow {...props} />;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface Props {
  model: { snackbar: SnackbarModel };
  operations: SnackbarController;
}

function TransitionSnackbar({ model, operations }: Props) {
  const { message, open } = model.snackbar;

  if (!message) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      onClose={operations.handleSnackClose}
      autoHideDuration={message.durationInMs}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      TransitionComponent={GrowTransition}
    >
      <Alert severity={message.severity}>{message.text}</Alert>
    </Snackbar>
  );
}

export default observer(TransitionSnackbar);
