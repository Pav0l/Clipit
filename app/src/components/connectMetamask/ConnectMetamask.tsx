import { Button } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { useStore } from "../../store/StoreProvider";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

export const OnboardingButton = observer(() => {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);

  const onboarding = useRef<MetaMaskOnboarding>();

  const { nftStore } = useStore();

  const setAccounts = () => {
    (window.ethereum as EthereumProvider)
      .request<string[]>({ method: "eth_requestAccounts" })
      .then((newAccounts) => nftStore.setAccounts(newAccounts));
  };

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      (window.ethereum as EthereumProvider).on(
        "accountsChanged",
        (account: string[]) => {
          nftStore.setAccounts(account);
        }
      );
      return () => {
        (window.ethereum as EthereumProvider).off(
          "accountsChanged",
          (account: string[]) => {
            nftStore.setAccounts(account);
          }
        );
      };
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (nftStore.accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current!.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [nftStore.accounts, nftStore.accounts.length]);

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
});
