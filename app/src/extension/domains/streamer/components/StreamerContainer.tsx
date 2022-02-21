import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { observer } from "mobx-react-lite";
import ConnectMetamask from "../../../../components/connectMetamask/ConnectMetamask";
import { NftController } from "../../../../domains/nfts/nft.controller";
import { NftModel } from "../../../../domains/nfts/nft.model";
import { SnackbarController } from "../../../../domains/snackbar/snackbar.controller";
import { ClipController } from "../../../../domains/twitch-clips/clip.controller";
import { Web3Controller } from "../../../../domains/web3/web3.controller";
import { Web3Model } from "../../../../domains/web3/web3.model";
import { useInputData } from "../../../../lib/hooks/useInputData";

interface Props {
  model: {
    web3: Web3Model;
    nft: NftModel;
  };
  operations: {
    web3: Web3Controller;
    nft: NftController;
    clip: ClipController;
    snackbar: SnackbarController;
  };
}

export const StreamerContainer = observer(function StreamerContainer({ model, operations }: Props) {
  const classes = useStyles();
  const [inputData, inputHandler, clearInput] = useInputData();

  const buttonHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    operations.clip.validateUrlAndGetClip(inputData.trim());
    clearInput();
  };

  if (!model.web3.isMetaMaskInstalled() || !model.web3.isProviderConnected()) {
    return (
      <ConnectMetamask
        operations={{ web3: operations.web3, snackbar: operations.snackbar }}
        model={{ web3: model.web3 }}
      />
    );
  }

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
