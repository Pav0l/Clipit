import { Button } from "@material-ui/core";
import MetaMaskOnboarding from "@metamask/onboarding";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";
import { EthereumProvider } from "../../lib/ethereum/ethereum.types";
import { useStore } from "../storeProvider/StoreProvider";
import { NftService } from "../../domains/nfts/nft.service";
import EthereumClient from "../../lib/ethereum/ethereum.client";

const ONBOARD_TEXT = "Install MetaMask";
const CONNECT_TEXT = "Connect";
const CONNECTED_TEXT = "Connected";

function ConnectMetamaskButton() {
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const [ethereumClient, setEthClient] = useState<EthereumClient | null>(null);

  const onboarding = useRef<MetaMaskOnboarding>();

  const { nftStore } = useStore();
  const nftService = new NftService(nftStore);

  const setAccounts = async () => {
    if (ethereumClient !== null) {
      nftService.requestAccounts(ethereumClient);
    }
  };

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      const ethereumClient = nftService.initializeEthereumClient(
        window.ethereum as EthereumProvider
      );
      setEthClient(ethereumClient);
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (ethereumClient && nftStore.accounts.length === 0) {
        // TODO - without calling this, we don't know if user already connected wallet or not
        // so the button can say "CONNECT" even if it is already connected
        // but with this, we always popup metamask when wallet is not yet connected
        // nftService.requestAccounts(ethereumClient);
      }
    }
  }, [ethereumClient]);

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
}

export default observer(ConnectMetamaskButton);
