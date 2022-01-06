import { Button, makeStyles } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import { Web3Model } from "../../domains/web3/web3.model";
import { IWeb3Controller } from "../../domains/web3/web3.controller";
import { SnackbarClient } from "../../domains/snackbar/snackbar.controller";

import MetamaskIcon from "../../assets/metamask.svg";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

interface Props {
  model: {
    web3: Web3Model;
  };
  operations: {
    web3: IWeb3Controller;
    snackbar: SnackbarClient;
  };
}

function ConnectMetamaskButton({ model, operations }: Props) {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  const onboarding = useRef<MetaMaskOnboarding>();
  const classes = useStyles();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }

    operations.web3.connectMetaMaskIfNecessaryForConnectBtn();
  }, []);

  useEffect(() => {
    if (model.web3.isMetaMaskInstalled()) {
      if (model.web3.isProviderConnected()) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current!.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [model.web3.accounts, model.web3.accounts?.length]);

  const onClick = async () => {
    if (model.web3.isMetaMaskInstalled()) {
      try {
        operations.web3.requestConnect();
      } catch (error) {
        operations.snackbar.sendError((error as Error).message);
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
