import { Button, MenuItem, Select, TextField } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { makeAppStyles } from "../../../../domains/theme/theme.constants";
import { useInputData } from "../../../../lib/hooks/useInputData";
import { ExtensionModel } from "../../extension/extension.model";
import { StreamerUiController } from "../../streamer/streamer-ui.controller";
interface Props {
  model: ExtensionModel;
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
      <Button onClick={model.auction.setApproveAuctionLoader}>1</Button>
      <Button onClick={model.auction.setWaitForApproveAuctionTxLoader}>2</Button>
      <Button onClick={model.auction.setAuctionCreateLoader}>3</Button>
      <Button onClick={model.auction.setWaitForAuctionCreateTxLoader}>4</Button>
      <Button onClick={model.auction.clearAuctionLoader}>5</Button>
    </div>
  );
});

const useStyles = makeAppStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",

    border: `1px solid ${theme.colors.border_primary}`,
    borderRadius: "4px",

    padding: "4px",
  },
}));
