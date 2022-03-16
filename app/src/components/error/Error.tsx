import { Box, Typography, Link } from "@material-ui/core";
import { ReactElement } from "react";
import { useSupportWidget } from "../../domains/support-widget/components/SupportWidgetProvider";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import CenteredContainer from "../container/CenteredContainer";

interface Props {
  text?: string;
  withRetry?: boolean;
  retryButtonHandler?: () => void;
  withActionButton?: boolean;
  actionButton?: ReactElement;
  classNames?: string;
}

function PleaseTryAgain({ retryButtonHandler }: { retryButtonHandler?: () => void }) {
  const classes = useStyles();
  const widget = useSupportWidget();

  return (
    <Box>
      <Typography variant="body1" className={classes.bodyP}>
        Please{" "}
        <Link
          component="button"
          variant="body1"
          className={classes.linkBtn}
          onClick={() => (retryButtonHandler ? retryButtonHandler() : window.location.reload())}
          underline="always"
        >
          try again
        </Link>{" "}
        or{" "}
        <Link component="button" variant="body1" className={classes.linkBtn} onClick={widget.open} underline="always">
          contact us
        </Link>
        .
      </Typography>
    </Box>
  );
}

// TODO refactor this to "generic `display message to user screen` and proper `error screen with retry`"
function ErrorWithRetry({ text, withRetry, withActionButton, actionButton, classNames, retryButtonHandler }: Props) {
  const classes = useStyles();

  if (!text) {
    text = "Something went wrong.";
    withRetry = true;
  }

  return (
    <CenteredContainer className={`${classes.container} ${classNames ?? ""}`}>
      <Typography variant="h5">{text}</Typography>
      {withActionButton && actionButton ? (
        actionButton
      ) : withRetry ? (
        <PleaseTryAgain retryButtonHandler={retryButtonHandler} />
      ) : (
        <></>
      )}
    </CenteredContainer>
  );
}

export default ErrorWithRetry;

const useStyles = makeAppStyles(() => ({
  container: {
    flexDirection: "column",
    margin: "0 10rem",
    textAlign: "center",
  },
  bodyP: {
    margin: "1rem 0",
  },
  linkBtn: {
    verticalAlign: "baseline",
  },
}));
