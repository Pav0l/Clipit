import "./Home.css";
import React from "react";
import {
  Button,
  CircularProgress,
  Box,
  TextField,
  Typography
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useStore } from "../../store/StoreProvider";
import { useInputData } from "../../hooks/useInputData";
import { TwitchClipsService } from "../../domains/twitch-clips/twitch-clips.service";
import { useHistory } from "react-router-dom";

function Home() {
  const { clipsStore } = useStore();
  const [inputData, inputHandler, clearInput] = useInputData();

  const clipService = new TwitchClipsService(clipsStore);
  const history = useHistory();

  const buttonHandler = (event: React.MouseEvent) => {
    event.preventDefault();

    clipsStore.meta.setLoading(true);
    const clipId = clipService.validateClipUrl(inputData.trim());

    if (clipId) {
      history.push(`/clips/${clipId}`);
    }
    clearInput();
    clipsStore.meta.setLoading(false);
  };

  if (clipsStore.meta.hasError) {
    return (
      <Box className="container">
        <Typography variant="h6" align="center" className="typography">
          {clipsStore.meta.error}
        </Typography>
      </Box>
    );
  }

  if (clipsStore.meta.isLoading) {
    return (
      <Box className="container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">clip it</h1>
        <Typography variant="h4" className="description">
          {/* Show off your great moments by generating immutable NFTs stored on distributed file system */}
          Convert your greatest moments to unique digital collectibles for your
          fans to collect
        </Typography>
        <TextField
          id="clip_url_input"
          label="Twitch clip URL:"
          className="input"
          value={inputData}
          onChange={(ev) => inputHandler(ev)}
        ></TextField>
        <Button
          variant="contained"
          color="primary"
          className="button"
          onClick={(ev) => buttonHandler(ev)}
        >
          Generate NFT
        </Button>
      </main>
    </div>
  );
}

export default observer(Home);
