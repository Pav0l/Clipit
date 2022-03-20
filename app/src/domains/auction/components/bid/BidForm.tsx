import { Button, InputAdornment, TextField, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { AuctionModel } from "../../auction.model";
import { Metadata } from "../../../nfts/nft.model";
import { makeAppStyles } from "../../../theme/theme.constants";
import { Web3Controller } from "../../../web3/web3.controller";
import { Web3Model } from "../../../web3/web3.model";
import { useInputData } from "../../../../lib/hooks/useInputData";
import LinearLoader from "../../../../components/loader/LinearLoader";
import { UiController } from "../../../app/ui.controller";

interface Props {
  metadata: Metadata;

  operations: {
    web3: Web3Controller;
    ui: UiController;
  };

  model: {
    web3: Web3Model;
    auction: AuctionModel;
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

// TODO move to auction domain
export const BidForm = observer(function BidForm({ metadata, operations, model }: Props) {
  const [isDisabled, setDisabled] = useState(false);
  const [isInputErr, setInputErr] = useState(false);
  const minimalBid = calcMinBid(metadata);
  const [input, setInput] = useInputData(minimalBid);
  const classes = useStyles();
  const signer = model.web3.getAccount();

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

    await operations.ui.createAuctionBid(metadata.auction.id, input, metadata.tokenId);
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

  if (model.auction.auctionBidLoadStatus) {
    return <LinearLoader text={model.auction.auctionBidLoadStatus} />;
  }

  return (
    <div className={classes.container}>
      {metadata.auction?.highestBid?.bidderAddress === signer ? (
        <Typography className={`${classes.highestBidder} ${classes.textColor}`}>You are the highest bidder!</Typography>
      ) : null}
      <div className={`${classes.title} ${classes.textColor}`}>
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
          endAdornment: (
            <InputAdornment position="end" className={classes.textColor}>
              ETH
            </InputAdornment>
          ),
        }}
        helperText={`Your bid must be at least ${minimalBid} ETH.`}
        variant="outlined"
        error={isInputErr}
        className={`${classes.input} ${classes.textColor}`}
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
      <Typography className={`${classes.text} ${classes.textColor}`}>
        Once submitted, you can not withdraw your bid.
      </Typography>
      <Typography className={`${classes.text} ${classes.textColor}`}>
        If you get outbidded, your bid will be automatically returned to your wallet.
      </Typography>
    </div>
  );
});

const useStyles = makeAppStyles((theme) => ({
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
    fontSize: "0.9rem",
  },
  highestBidder: {
    textAlign: "center",
    margin: "1rem 0",
    fontWeight: "bold",
  },
  textColor: {
    color: theme.colors.text_ternary,
  },
}));
