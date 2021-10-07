import { Button } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";

import { NftModel } from "../../domains/nfts/nft.model";
import { IAppController } from "../../domains/app/app.controller";
import { useWeb3 } from "../../lib/hooks/useWeb3";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

interface Props {
  model: {
    nft: NftModel;
  };
  operations: IAppController;
}

function ConnectMetamaskButton({ model, operations }: Props) {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  const { ethereum, contract, initializeWeb3 } = useWeb3(model.nft);

  const onboarding = useRef<MetaMaskOnboarding>();

  const setAccounts = async () => {
    if (operations.nft) {
      operations.nft.requestAccounts();
    }
  };

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }

    if (!ethereum || !contract) {
      initializeWeb3();
    }
  }, []);

  useEffect(() => {
    if (!operations.nft && ethereum && contract) {
      operations.createNftCtrl(ethereum, contract);
    }
  }, [ethereum, contract]);

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
      setAccounts();
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
