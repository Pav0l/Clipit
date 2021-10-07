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
import { useInputData } from "../../lib/hooks/useInputData";
import { useHistory } from "react-router-dom";
import { ClipsStore } from "../../domains/twitch-clips/clips.store";
import { ClipController } from "../../domains/twitch-clips/clip.controller";

interface Props {
  model: {
    clip: ClipsStore;
  };
  operations: {
    clip: ClipController;
  };
}

function Home({ model, operations }: Props) {
  const [inputData, inputHandler, clearInput] = useInputData();

  const history = useHistory();

  const buttonHandler = (event: React.MouseEvent) => {
    event.preventDefault();

    model.clip.meta.setLoading(true);
    const clipId = operations.clip.validateClipUrl(inputData.trim());

    if (clipId) {
      history.push(`/clips/${clipId}`);
    }
    clearInput();
    model.clip.meta.setLoading(false);
  };

  if (model.clip.meta.isLoading) {
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
