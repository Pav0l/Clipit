import { Button, InputAdornment, makeStyles, TextField, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { NftController } from "../../domains/nfts/nft.controller";
import { Metadata } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { useInputData } from "../../lib/hooks/useInputData";
import LinearLoader from "../loader/LinearLoader";

interface Props {
  metadata: Metadata;

  operations: {
    web3: Web3Controller;
    nft: NftController;
  };

  model: {
    web3: Web3Model;
  };
}

const calcMinBid = (metadata: Metadata) => {
  const auction = metadata.auction;
  if (!auction) {
    return "0";
  }

  if (auction.highestBid) {
    return `${Number(auction.highestBid.displayAmount) * 1.05}`;
  }

  return auction.displayReservePrice ? auction.displayReservePrice : "0";
};

export const BidForm = observer(function BidForm({ metadata, operations, model }: Props) {
  const [isDisabled, setDisabled] = useState(false);
  const [isInputErr, setInputErr] = useState(false);

  const minimalBid = calcMinBid(metadata);

  const [input, setInput] = useInputData(minimalBid);

  const classes = useStyles();

  const signer = model.web3.getAccount();
  const helperInputText = `Your bid must be at least ${minimalBid} ETH.`;

  useEffect(() => {
    if (!model.web3.isProviderConnected()) {
      model.web3.resetEthBalance();
      operations.web3.requestConnect(operations.web3.getBalance);
    }

    if (signer) {
      operations.web3.getBalance(signer);
    }
  }, []);

  const handleBid = async () => {
    // bid input must be higher than minimalBid
    if (input < minimalBid) {
      setInputErr(true);
      setDisabled(true);
      return;
    }

    if (!metadata.auction || !metadata.auction.id) {
      setInputErr(true);
      setDisabled(true);
      return;
    }

    await operations.web3.requestConnectAndBid(metadata.auction?.id, input);
    await operations.nft.getAuctionForToken(metadata.tokenId, {
      clearCache: true,
    });
  };

  const handleBidChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (ev.target.value < minimalBid) {
      setInputErr(true);
      setDisabled(true);
    } else {
      setInputErr(false);
      setDisabled(false);
    }

    setInput(ev.target.value);
  };

  if (model.web3.auctionBidLoadStatus) {
    return <LinearLoader text={model.web3.auctionBidLoadStatus} />;
  }

  return (
    <div className={classes.container}>
      {metadata.auction?.highestBid?.bidderAddress === signer ? (
        <Typography className={classes.highestBidder}>You are the highest bidder!</Typography>
      ) : null}
      <div className={classes.title}>
        <Typography>Enter your Bid</Typography>
        {model.web3.displayBalance ? <Typography>Balance: {model.web3.displayBalance} ETH</Typography> : null}
      </div>
      <TextField
        label="Bid"
        id="bid-input"
        value={input}
        size="small"
        onChange={handleBidChange}
        InputProps={{
          endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
        }}
        helperText={helperInputText}
        variant="outlined"
        error={isInputErr}
        className={classes.input}
      ></TextField>
      <Button
        size="medium"
        color="primary"
        variant="contained"
        disabled={isDisabled}
        onClick={handleBid}
        className={classes.button}
      >
        Enter Bid
      </Button>
      <Typography className={classes.text}>Once submitted, you can not withdraw your bid.</Typography>
      <Typography className={classes.text}>
        If you get outbidded, your bid will be automatically returned to your wallet.
      </Typography>
    </div>
  );
});

const useStyles = makeStyles((theme) => ({
  container: {
    margin: "1rem",
    maxWidth: "35vw",
  },
  button: {
    width: "100%",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    margin: "0.8rem 0 0.5rem 0",
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
  },
  text: {
    color: theme.palette.text.secondary,
    fontSize: "0.9rem",
  },
  highestBidder: {
    textAlign: "center",
    margin: "1rem 0",
    fontWeight: "bold",
  },
}));
