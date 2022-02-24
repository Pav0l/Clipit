import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import ConnectMetamask from "../../../../components/connectMetamask/ConnectMetamask";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { useInputData } from "../../../../lib/hooks/useInputData";
import { ExtensionClip } from "../../../components/ExtensionClip";
import { IExtensionModel } from "../../extension/extension.model";
import { StreamerUiController } from "../streamer-ui.controller";

interface Props {
  model: IExtensionModel;
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
    await operations.streamerUi.prepareClip(inputData.trim());
    clearInput();
  };

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
          <Button variant="contained" color="primary" className={classes.button} onClick={buttonHandler}>
            Prepare NFT
          </Button>
        </div>
      );
    case "CLIP":
      return (
        <ExtensionClip
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          clip={model.clip.getClip(model.streamerUi.clipId!)!}
          model={{ clip: model.clip, game: model.game, web3: model.web3 }}
          operations={{ streamerUi: operations.streamerUi }}
        />
      );
    case "NFT":
      return <div>Minted Nft Detail Page</div>;
    case "AUCTION":
      return <div>Auction Page</div>;
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
