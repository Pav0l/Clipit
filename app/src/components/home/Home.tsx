import React from "react";
import { Button, makeStyles, TextField, Typography } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import { useInputData } from "../../lib/hooks/useInputData";
import { useHistory } from "react-router-dom";
import { ClipModel } from "../../domains/twitch-clips/clip.model";
import { ClipController } from "../../domains/twitch-clips/clip.controller";
import FullPageLoader from "../loader/FullPageLoader";
import CenteredContainer from "../container/CenteredContainer";

interface Props {
  model: {
    clip: ClipModel;
  };
  operations: {
    clip: ClipController;
  };
}

function Home({ model, operations }: Props) {
  const [inputData, inputHandler, clearInput] = useInputData();

  const history = useHistory();
  const classes = useStyles();

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
    return <FullPageLoader />;
  }

  return (
    <CenteredContainer className={classes.main}>
      <section className={classes.section}>
        <Typography variant="h2" className={classes.title}>
          clip it
        </Typography>
        <Typography variant="h4" className={classes.description}>
          {/* Show off your great moments by generating immutable NFTs stored on distributed file system */}
          {/* Convert your greatest moments to unique digital collectibles for your fans to collect */}
          Convert your greatest moments to unique digital collectibles for your
          fans
        </Typography>
        <TextField
          id="clip_url_input"
          label="Login with Twitch or enter Twitch clip URL:"
          className={classes.input}
          value={inputData}
          onChange={(ev) => inputHandler(ev)}
        ></TextField>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={(ev) => buttonHandler(ev)}
        >
          Prepare NFT
        </Button>
      </section>
    </CenteredContainer>
  );
}

export default observer(Home);

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: "center",
    cursor: "default",
    color: "#2176FF",
    textDecoration: "none",
    margin: "1rem 0",
    fontWeight: "bolder"
  },
  input: {
    width: "80vw",
    margin: "1.8rem 0",
    color: theme.palette.text.hint
  },
  description: {
    maxWidth: "80vw"
  },
  button: {
    alignSelf: "flex-end"
  },
  main: {
    flexDirection: "column"
  },
  section: {
    padding: "5rem 0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start"
  }
}));
