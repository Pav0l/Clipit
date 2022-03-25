import { observer } from "mobx-react-lite";
import { ChangeEvent, useState, useEffect, useMemo } from "react";
import { Paper, Tabs, Tab } from "@material-ui/core";

import { IWeb3Controller } from "../../web3/web3.controller";
import { NftController } from "../nft.controller";
import { NftModel } from "../nft.model";
import NftsPage from "./NftsPage";
import ActiveBidsPage from "./ActiveBidsPage";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../../components/error/Error";
import { Web3Model, Web3Errors } from "../../web3/web3.model";
import ReceivedBids from "./ReceivedBids";
import { makeAppStyles } from "../../theme/theme.constants";
import { NavigatorController } from "../../navigation/navigation.controller";

interface Props {
  model: {
    web3: Web3Model;
    nft: NftModel;
  };
  operations: {
    web3: IWeb3Controller;
    nft: NftController;
    navigator: NavigatorController;
  };
}

function NftsContainer({ model, operations }: Props) {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const signer = model.web3.getAccount();
  const metadata = operations.nft.getOwnerMetadata(signer);
  const bidsOnAuctions = useMemo(
    () => metadata.filter((m) => m.auction?.displayBid !== null && m.auction?.isActive === true),
    [metadata]
  );

  const handleChange = (_event: ChangeEvent<Record<string, never>>, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (!model.web3.isProviderConnected()) {
      // MM was not connected -> no reason to keep some previous NFTs on state
      model.nft.resetMetadata();
    }

    if (signer) {
      operations.nft.getCurrentSignerTokensMetadata(signer);
    }
  }, []);

  useEffect(() => {
    if (signer) {
      operations.nft.getCurrentSignerTokensMetadata(signer);
    }
  }, [model.web3.accounts]);

  if (model.nft.meta.error) {
    return <ErrorWithRetry text={model.nft.meta.error.message} withRetry={true} />;
  }

  if (model.nft.meta.isLoading || model.web3.meta.isLoading) {
    return <FullPageLoader />;
  }

  if (!signer) {
    return <ErrorWithRetry text={Web3Errors.CONNECT_METAMASK} withRetry={false} />;
  }

  return (
    <>
      <Paper className={classes.container} data-testid="nfts-container">
        <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
          <Tab label="Clips" />
          <Tab label="Active Bids" />
          <Tab label="Received Bids" />
        </Tabs>
      </Paper>
      {value === 0 ? (
        <NftsPage metadata={metadata} handleRouteChange={operations.navigator.goToRoute} />
      ) : value === 1 ? (
        <ActiveBidsPage
          metadata={model.nft.activeAuctionBidsMetadata}
          handleRouteChange={operations.navigator.goToRoute}
        />
      ) : value === 2 ? (
        <ReceivedBids
          metadata={bidsOnAuctions}
          setTabValue={() => setValue(0)}
          handleRouteChange={operations.navigator.goToRoute}
        />
      ) : null}
    </>
  );
}

export default observer(NftsContainer);

const useStyles = makeAppStyles(() => ({
  container: {
    margin: "0 2rem",
  },
}));
