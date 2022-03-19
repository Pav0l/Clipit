import { Button } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import MetamaskIcon from "../../assets/metamask.svg";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { Web3Model } from "../../domains/web3/web3.model";

interface Props {
  model: {
    web3: Web3Model;
  };

  onClick: () => Promise<void>;
  onClickError: (msg: string) => void;
}

function ConnectMetamaskButton({ model, onClick, onClickError }: Props) {
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
        model.web3.setConnected();
        setDisabled(true);
        onboarding.current!.stopOnboarding();
      } else {
        model.web3.setConnect();
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
      {model.web3.walletStatus}
    </Button>
  );
}

export default observer(ConnectMetamaskButton);

const useStyles = makeAppStyles((theme) => ({
  button: {
    border: `1px solid ${theme.colors.border_primary}`,
    padding: "5px 10px",
    textTransform: "none",
    color: theme.colors.text_secondary,
  },
}));
