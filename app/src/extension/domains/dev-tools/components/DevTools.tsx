import { Button, makeStyles, MenuItem, Select, TextField } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Web3Model } from "../../../../domains/web3/web3.model";
import { useInputData } from "../../../../lib/hooks/useInputData";
import { StreamerUiController } from "../../streamer/streamer-ui.controller";
import { StreamerUiModel } from "../../streamer/streamer-ui.model";

interface Props {
  model: {
    streamerUi: StreamerUiModel;
    web3: Web3Model;
  };
  operations: {
    streamerUi: StreamerUiController;
  };
}

export const DevTools = observer(function DevTools({ model, operations }: Props) {
  // resourceId can be clipId or tokenId
  const [resourceId, inputHandler, clearInput] = useInputData("");
  const [page, setPage] = useState(model.streamerUi.page);

  const classes = useStyles();

  const submitHandler = async () => {
    switch (page) {
      case "MISSING_PROVIDER":
        model.streamerUi.goToMissingProvider();
        break;
      case "INPUT":
        model.streamerUi.goToInput();
        break;
      case "CLIP":
        await operations.streamerUi.getClipDataAndGoToClip(resourceId);
        break;
      case "NFT":
        await operations.streamerUi.getTokenMetadataAndGoToNft(resourceId);
        break;
      case "AUCTION":
        await operations.streamerUi.getAuctionDataAndGoToAuction(resourceId);
        break;

      default:
        throw new Error("unknown page");
    }
    clearInput();
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPage(event.target.value as any);
  };

  return (
    <div className={classes.container}>
      <TextField id="dev-tools-id" value={resourceId} onChange={(ev) => inputHandler(ev)}></TextField>
      <Select labelId="select-resource" id="select-resource-id" value={page} onChange={handleChange}>
        <MenuItem value={"MISSING_PROVIDER"}>MISSING_PROVIDER</MenuItem>
        <MenuItem value={"INPUT"}>INPUT</MenuItem>
        <MenuItem value={"CLIP"}>CLIP</MenuItem>
        <MenuItem value={"NFT"}>NFT</MenuItem>
        <MenuItem value={"AUCTION"}>AUCTION</MenuItem>
      </Select>
      <Button variant="contained" color="primary" onClick={submitHandler}>
        Go!
      </Button>
      <Button onClick={model.web3.setApproveAuctionLoader}>1</Button>
      <Button onClick={model.web3.setWaitForApproveAuctionTxLoader}>2</Button>
      <Button onClick={model.web3.setAuctionCreateLoader}>3</Button>
      <Button onClick={model.web3.setWaitForAuctionCreateTxLoader}>4</Button>
      <Button onClick={model.web3.clearAuctionLoader}>5</Button>
    </div>
  );
});

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",

    border: "1px solid black",
    borderRadius: "4px",

    padding: "4px",
  },
}));
