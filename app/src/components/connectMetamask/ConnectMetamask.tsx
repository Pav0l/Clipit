import { Button, makeStyles } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import { EthereumModel } from "../../lib/ethereum/ethereum.model";
import { IWeb3Controller } from "../../domains/web3/web3.controller";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";

import MetamaskIcon from "../../assets/metamask.svg";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

interface Props {
  model: {
    eth: EthereumModel;
  };
  operations: IWeb3Controller;
  snackbar: SnackbarClient;
}

function ConnectMetamaskButton({ model, operations, snackbar }: Props) {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  const onboarding = useRef<MetaMaskOnboarding>();
  const classes = useStyles();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }

    operations.connectMetaMaskIfNecessaryForConnectBtn();
  }, []);

  useEffect(() => {
    if (model.eth.isMetaMaskInstalled()) {
      if (model.eth.isProviderConnected()) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current!.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [model.eth.accounts, model.eth.accounts?.length]);

  const onClick = async () => {
    if (model.eth.isMetaMaskInstalled()) {
      try {
        operations.requestConnect();
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
