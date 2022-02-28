import { Button, makeStyles } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import ErrorWithRetry from "../../components/error/Error";
import { AppError } from "../../lib/errors/errors";

interface Props {
  error: AppError;
  createAuctionHandler: () => Promise<void>;
}

export const ExtensionNftError = observer(function ExtensionNftError({ error, createAuctionHandler }: Props) {
  const classes = useStyles();
  let showActionButton = true;
  let actionBtnHandler;

  let showRetryButton = false;
  let retryHandler;

  /**
   * Error types:
   * web3-unknown     -> failed to create auction   -> back to NFT page to create auction
   * subgraph-query   -> invalid query above        -> contact us
   */
  switch (error.type) {
    case "web3-unknown":
      showActionButton = false;
      showRetryButton = true;
      retryHandler = createAuctionHandler;
      break;
    case "subgraph-query":
      showActionButton = false;
      actionBtnHandler = undefined;

      showRetryButton = true;
      retryHandler = undefined; // fallback to reload
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
          Back
        </Button>
      }
    />
  );
});

const useStyles = makeStyles(() => ({
  error: {
    margin: "0",
  },
  errorBtn: {
    margin: "1rem 0",
  },
}));
