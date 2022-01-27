import { Button, InputAdornment, makeStyles, TextField, Typography } from "@material-ui/core";
import { utils } from "ethers";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { NftController } from "../../domains/nfts/nft.controller";
import { NftModel } from "../../domains/nfts/nft.model";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { useInputData } from "../../lib/hooks/useInputData";
import FullPageLoader from "../loader/FullPageLoader";
import LinearLoader from "../loader/LinearLoader";

interface Props {
  tokenId: string;

  operations: {
    web3: Web3Controller;
    nft: NftController;
  };
  model: {
    web3: Web3Model;
    nft: NftModel;
  };
}

export const AuctionCreateForm = observer(function AuctionCreateForm({ tokenId, operations, model }: Props) {
  const classes = useStyles();
  const [durationInput, setDuration] = useInputData("1");
  const [durationErr, setDurationErr] = useState(false);

  const [reservePriceInput, setReservePrice] = useInputData("1");
  const [reservePriceErr, setReservePriceErr] = useState(false);

  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!isValidDuration(durationInput) || !isValidReservePrice(reservePriceInput)) {
      setDisabled(true);
    } else if (isDisabled) {
      setDisabled(false);
    }
  }, [durationInput, reservePriceInput]);

  const handleButton = async () => {
    if (!isValidDuration(durationInput)) {
      setDurationErr(true);
      return;
    }

    if (!isValidReservePrice(reservePriceInput)) {
      setReservePriceErr(true);
      return;
    }

    await operations.web3.requestConnectAndCreateAuction(
      tokenId,
      Number(durationInput) * 86400, // 1 day in seconds
      utils.parseEther(reservePriceInput)
    );

    await operations.nft.getAuctionForToken(tokenId, { clearCache: true });
  };

  const handleDurationChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isValidDuration(ev.target.value)) {
      setDuration(ev.target.value);
      setDurationErr(false);
    }
  };

  const handleReservePriceChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isValidReservePrice(ev.target.value)) {
      setReservePrice(ev.target.value);
      setReservePriceErr(false);
    }
  };

  if (model.web3.auctionLoadStatus !== undefined) {
    return <LinearLoader text={model.web3.auctionLoadStatus} />;
  }

  if (model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className={classes.container}>
      <Typography component="h5" variant="h5">
        List your NFT for an auction
      </Typography>
      <TextField
        label="Duration"
        id="duration-input"
        value={durationInput}
        size="small"
        onChange={handleDurationChange}
        type="number"
        InputProps={{
          endAdornment: <InputAdornment position="end">{durationInput === "1" ? "day" : "days"}</InputAdornment>,
        }}
        error={durationErr}
        helperText={durationErr ? "Duration has to be more than 1 day" : "How many days should the Auction run for"}
        variant="outlined"
        className={classes.input}
      />
      <TextField
        label="Reserve price"
        id="reserve-price-input"
        value={reservePriceInput}
        size="small"
        onChange={handleReservePriceChange}
        type="number"
        InputProps={{
          endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
        }}
        error={reservePriceErr}
        helperText={reservePriceErr ? "Invalid minimal price for your NFT" : "Minimal value of bid for your NFT"}
        variant="outlined"
        className={classes.input}
      />
      <Button
        onClick={handleButton}
        size="medium"
        color="primary"
        variant="contained"
        disabled={isDisabled}
        className={classes.button}
      >
        Create auction
      </Button>
    </div>
  );
});

const useStyles = makeStyles(() => ({
  container: {
    margin: "1rem",
    maxWidth: "50vw",
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
    color: "rgba(0, 0, 0, 0.54)",
    fontSize: "0.9rem",
  },
}));

function isValidDuration(duration: string): boolean {
  return duration >= "1" && !duration.includes(".");
}
function isValidReservePrice(price: string): boolean {
  return price >= "0";
}
