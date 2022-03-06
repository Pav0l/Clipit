import { observer } from "mobx-react-lite";
import { ChangeEvent, useState, useEffect, useMemo } from "react";
import { Paper, Tabs, Tab } from "@material-ui/core";

import { IWeb3Controller } from "../../web3/web3.controller";
import { NftController } from "../nft.controller";
import { NftModel } from "../nft.model";
import { NavigationModel } from "../../navigation/navigation.model";
import NftsPage from "./NftsPage";
import { makeStyles } from "@material-ui/styles";
import ActiveBidsPage from "./ActiveBidsPage";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import ErrorWithRetry from "../../../components/error/Error";
import { Web3Model, Web3Errors } from "../../web3/web3.model";
import ReceivedBids from "./ReceivedBids";

interface Props {
  model: {
    web3: Web3Model;
    nft: NftModel;
    navigation: NavigationModel;
  };
  operations: {
    web3: IWeb3Controller;
    nft: NftController;
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
      operations.web3.requestConnect(operations.nft.getCurrentSignerTokensMetadata);
    }

    if (signer) {
      operations.nft.getCurrentSignerTokensMetadata(signer);
    }
  }, []);

  if (model.web3.meta.error) {
    return <ErrorWithRetry text={model.web3.meta.error.message} withRetry={false} />;
  }

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
      <Paper className={classes.container}>
        <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
          <Tab label="Clips" />
          <Tab label="Active Bids" />
          <Tab label="Received Bids" />
        </Tabs>
      </Paper>
      {value === 0 ? (
        <NftsPage model={model} metadata={metadata} />
      ) : value === 1 ? (
        <ActiveBidsPage model={model} metadata={model.nft.activeAuctionBidsMetadata} />
      ) : value === 2 ? (
        <ReceivedBids metadata={bidsOnAuctions} setTabValue={() => setValue(0)} />
      ) : null}
    </>
  );
}

export default observer(NftsContainer);

const useStyles = makeStyles(() => ({
  container: {
    margin: "0 2rem",
  },
}));
