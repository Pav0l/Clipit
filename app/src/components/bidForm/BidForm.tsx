import {
  Button,
  InputAdornment,
  makeStyles,
  TextField,
  Typography
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Web3Controller } from "../../domains/web3/web3.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import { useInputData } from "../../lib/hooks/useInputData";

interface Props {
  minimalBid: string;

  operations: {
    web3: Web3Controller;
  };

  model: {
    web3: Web3Model;
  };
}

export const BidForm = observer(function BidForm({
  minimalBid,
  operations,
  model
}: Props) {
  const [isDisabled, setDisabled] = useState(false);
  const [isInputErr, setInputErr] = useState(false);

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

  const handleBid = () => {
    // TODO
  };

  const handleBidChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (ev.target.value < minimalBid) {
      setInputErr(true);
      setDisabled(true);
    } else {
      setInputErr(false);
      setDisabled(false);
    }

    setInput(ev.target.value);
  };

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Typography>Enter your Bid</Typography>
        {model.web3.displayBalance ? (
          <Typography>Balance: {model.web3.displayBalance} ETH</Typography>
        ) : null}
      </div>
      <TextField
        label="Bid"
        id="bid-input"
        value={input}
        size="small"
        onChange={handleBidChange}
        InputProps={{
          endAdornment: <InputAdornment position="end">ETH</InputAdornment>
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
      <Typography className={classes.text}>
        Once submitted, you can not withdraw your bid.
      </Typography>
      <Typography className={classes.text}>
        If you get outbidded, your bid will be automatically returned to your
        wallet.
      </Typography>
    </div>
  );
});

const useStyles = makeStyles(() => ({
  container: {
    margin: "1rem",
    maxWidth: "35vw"
  },
  button: {
    width: "100%",
    marginBottom: "0.5rem"
  },
  input: {
    width: "100%",
    margin: "0.8rem 0 0.5rem 0"
  },
  title: {
    display: "flex",
    justifyContent: "space-between"
  },
  text: {
    color: "rgba(0, 0, 0, 0.54)",
    fontSize: "0.9rem"
  }
}));
