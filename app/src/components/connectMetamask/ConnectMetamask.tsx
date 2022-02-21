import { Button, makeStyles } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import { Web3Model, MetamaskButton } from "../../domains/web3/web3.model";

import MetamaskIcon from "../../assets/metamask.svg";

interface Props {
  model: {
    web3: Web3Model;
  };

  onClick: () => Promise<void>;
  onClickError: (msg: string) => void;
}

function ConnectMetamaskButton({ model, onClick, onClickError }: Props) {
  const [buttonText, setButtonText] = useState(MetamaskButton.INSTALL);
  const [isDisabled, setDisabled] = useState(false);

  const onboarding = useRef<MetaMaskOnboarding>();
  const classes = useStyles();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (model.web3.isMetaMaskInstalled()) {
      if (model.web3.isProviderConnected()) {
        setButtonText(MetamaskButton.CONNECTED);
        setDisabled(true);
        onboarding.current!.stopOnboarding();
      } else {
        setButtonText(MetamaskButton.CONNECT);
        setDisabled(false);
      }
    }
  }, [model.web3.accounts, model.web3.accounts?.length]);

  const onClickHandler = async () => {
    if (model.web3.isMetaMaskInstalled()) {
      try {
        onClick();
      } catch (error) {
        onClickError((error as Error).message);
        return;
      }
    } else {
      onboarding.current!.startOnboarding();
    }
  };

  return (
    <Button startIcon={<MetamaskIcon />} className={classes.button} disabled={isDisabled} onClick={onClickHandler}>
      {buttonText}
    </Button>
  );
}

export default observer(ConnectMetamaskButton);

const useStyles = makeStyles(() => ({
  button: {
    border: "1px solid black",
    padding: "5px 10px",
    textTransform: "none",
  },
}));
