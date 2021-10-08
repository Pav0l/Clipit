import { Button } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import { NftModel } from "../../domains/nfts/nft.model";
import { IAppController } from "../../domains/app/app.controller";
import { SnackbarClient } from "../../lib/snackbar/snackbar.client";

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

function ConnectMetamaskButton({ model, operations, snackbar }: Props) {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  const onboarding = useRef<MetaMaskOnboarding>();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
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
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      try {
        const { ethereum, contract } = await operations.initializeWeb3Clients();

        if (!operations.nft && ethereum && contract) {
          operations.createNftCtrl(ethereum, contract);
        }

        if (!operations.nft) {
          throw new Error(
            "Something went wrong. Please install MetaMask and try again"
          );
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
    <Button disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </Button>
  );
}

export default observer(ConnectMetamaskButton);
