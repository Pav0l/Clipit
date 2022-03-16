import { Button } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import ErrorWithRetry from "../../components/error/Error";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { AppError } from "../../lib/errors/errors";

interface Props {
  error: AppError;
  mintHandler: () => Promise<void>;
  fetchClipFromSubgraphHandler: () => Promise<void>;
}

export const ExtensionClipError = observer(function ExtensionClipError({
  error,
  mintHandler,
  fetchClipFromSubgraphHandler,
}: Props) {
  const classes = useStyles();
  let showActionButton = true;
  let actionBtnHandler;

  let showRetryButton = false;
  let retryHandler;

  let buttonText = "Back";

  /**
   * Error types:
   * subgraph-clip  -> failed to get CLIP data based on txHash  -> try again in couple of minutes
   * web3-unknown   -> failed mint                              -> try again / contact us
   * subgraph-query -> invalid query above                      -> contact us
   */
  switch (error.type) {
    case "web3-unknown":
      showActionButton = false;
      showRetryButton = true;
      retryHandler = mintHandler;
      break;
    case "subgraph-clip":
      showActionButton = true;
      actionBtnHandler = fetchClipFromSubgraphHandler;

      showRetryButton = false;
      retryHandler = undefined;

      buttonText = "Try again";
      break;
    case "subgraph-query":
      showActionButton = false;
      actionBtnHandler = undefined;

      showRetryButton = true;
      retryHandler = undefined;
      break;
    default:
      break;
  }

  return (
    <ErrorWithRetry
      text={error.message}
      classNames={classes.error}
      withActionButton={showActionButton}
      withRetry={showRetryButton}
      retryButtonHandler={retryHandler}
      actionButton={
        <Button
          size="medium"
          color="primary"
          variant="contained"
          onClick={actionBtnHandler}
          className={classes.errorBtn}
        >
          {buttonText}
        </Button>
      }
    />
  );
});

const useStyles = makeAppStyles(() => ({
  error: {
    margin: "0",
  },
  errorBtn: {
    margin: "1rem 0",
  },
}));
