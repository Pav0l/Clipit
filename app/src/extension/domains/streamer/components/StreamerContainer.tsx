import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import ConnectMetamask from "../../../../components/connectMetamask/ConnectMetamask";
import ErrorWithRetry from "../../../../components/error/Error";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { Web3Model } from "../../../../domains/web3/web3.model";
import { useInputData } from "../../../../lib/hooks/useInputData";
import { StreamerUiController } from "../streamer-ui.controller";
import { StreamerUiModel } from "../streamer-ui.model";

interface Props {
  model: {
    web3: Web3Model;
    streamerUi: StreamerUiModel;
  };
  operations: {
    snackbar: SnackbarController;
    streamerUi: StreamerUiController;
  };
}

export const StreamerContainer = observer(function StreamerContainer({ model, operations }: Props) {
  const classes = useStyles();
  const [inputData, inputHandler, clearInput] = useInputData();

  const buttonHandler = async (event: React.MouseEvent) => {
    event.preventDefault();
    await operations.streamerUi.prepareNft(inputData.trim());
    clearInput();
  };

  if (model.streamerUi.meta.hasError) {
    return <ErrorWithRetry text={model.streamerUi.meta.error} />;
  }

  switch (model.streamerUi.page) {
    case "MISSING_PROVIDER":
      return (
        <ConnectMetamask
          model={{ web3: model.web3 }}
          onClick={operations.streamerUi.connectMetamask}
          onClickError={operations.snackbar.sendError}
        />
      );
    case "INPUT":
      return (
        <div className={classes.container}>
          <TextField
            id="clip_url_input"
            label="Enter your Clip URL:"
            className={classes.input}
            value={inputData}
            onChange={(ev) => inputHandler(ev)}
          ></TextField>
          <Button variant="contained" color="primary" className={classes.button} onClick={(ev) => buttonHandler(ev)}>
            Prepare NFT
          </Button>
        </div>
      );
    case "CLIP":
      return <div>Clip Detail Page</div>;
    case "NFT":
      return <div>Minted Nft Detail Page</div>;
    default:
      // TODO
      return <div>Invalid Page</div>;
  }
});

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "80vw",
    margin: "1.8rem 0",
  },
  button: {
    alignSelf: "flex-end",
  },
}));
