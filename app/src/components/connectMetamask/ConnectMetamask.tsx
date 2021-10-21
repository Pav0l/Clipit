import { Button, makeStyles } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import { NftModel } from "../../domains/nfts/nft.model";
import { IAppController } from "../../domains/app/app.controller";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";

import MetamaskIcon from "../../assets/metamask.svg";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IAppController;
  snackbar: SnackbarClient;
}

const { isMetaMaskInstalled } = MetaMaskOnboarding;

function ConnectMetamaskButton({ model, operations, snackbar }: Props) {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  const onboarding = useRef<MetaMaskOnboarding>();
  const classes = useStyles();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }

    if (isMetaMaskInstalled()) {
      operations.getEthAccounts();
    }
  }, []);

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      if (model.nft.accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current!.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [model.nft.accounts, model.nft.accounts.length]);

  const onClick = async () => {
    if (isMetaMaskInstalled()) {
      try {
        if (!operations.nft) {
          const { ethereum, contract } =
            await operations.initializeWeb3Clients();

          if (ethereum && contract) {
            operations.createNftCtrl(ethereum, contract);
          }

          if (!operations.nft) {
            throw new Error(
              "Something went wrong. Please install MetaMask and try again"
            );
          }
        }

        operations.nft.requestAccounts();
      } catch (error) {
        snackbar.sendError((error as Error).message);
        return;
      }
    } else {
      onboarding.current!.startOnboarding();
    }
  };

  return (
    <Button
      startIcon={<MetamaskIcon />}
      className={classes.button}
      disabled={isDisabled}
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );
}

export default observer(ConnectMetamaskButton);

const useStyles = makeStyles(() => ({
  button: {
    border: "1px solid black",
    padding: "5px 10px",
    textTransform: "none"
  }
}));
