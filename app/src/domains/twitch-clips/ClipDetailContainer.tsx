import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Card,
  CardContent,
  CardMedia,
  Button,
  Typography,
  makeStyles
} from "@material-ui/core";
import ErrorWithRetry from "../../components/error/Error";

import { SnackbarClient } from "../../lib/snackbar/snackbar.client";
import { ClipModel } from "./clip.model";
import { UserModel } from "../twitch-user/user.model";
import { GameModel } from "../twitch-games/game.model";
import { NftModel } from "../nfts/nft.model";
import { IAppController } from "../app/app.controller";
import FullPageLoader from "../../components/loader/FullPageLoader";
import LinearLoader from "../../components/loader/LinearLoader";
import { EthereumModel } from "../../lib/ethereum/ethereum.model";

interface Props {
  model: {
    clip: ClipModel;
    user: UserModel;
    game: GameModel;
    nft: NftModel;
    eth: EthereumModel;
  };
  operations: IAppController;
}

const useStyles = makeStyles(() => ({
  container: {
    margin: "2rem auto",
    borderRadius: "0px"
  },
  iframe: {
    // video aspect ratio is 16:9
    width: "80vw",
    height: "45vw",
    maxHeight: "70vh"
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
}));

function ClipDetailContainer({ model, operations }: Props) {
  const { clipId } = useParams<{ clipId: string }>();
  const [isDisabled, setDisabled] = useState(false);

  const clip = model.clip.getClip(clipId);

  const classes = useStyles();

  useEffect(() => {
    if (!model.user.id) {
      operations.user.getUser();
    }

    if (!clip || clip.id !== clipId) {
      operations.clip.getClip(clipId);
    }
  }, []);

  useEffect(() => {
    if (clip && !model.game.getGame(clip.gameId)) {
      operations.game.getGames(clip.gameId);
    }
  }, [model.clip.clips.length]);

  const mint = async () => {
    setDisabled(true);
    // we need to verify that current user is owner of broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (
      clip != null &&
      // TODO hardcoded user Id
      (model.user.id === "30094526" || clip.broadcasterId === model.user.id)
    ) {
      await operations.requestConnectAndMint(clip.id);

      setDisabled(false);
    }
  };

  if (model.user.meta.hasError) {
    return <ErrorWithRetry text={model.user.meta.error}></ErrorWithRetry>;
  }

  if (model.clip.meta.hasError) {
    return <ErrorWithRetry text={model.clip.meta.error}></ErrorWithRetry>;
  }

  if (model.nft.meta.hasError) {
    return <ErrorWithRetry text={model.nft.meta.error}></ErrorWithRetry>;
  }

  if (
    model.clip.meta.isLoading ||
    model.user.meta.isLoading ||
    model.nft.meta.isLoading
  ) {
    return <FullPageLoader />;
  }

  if (!clip) {
    return (
      <ErrorWithRetry
        text="It seems we can't find the clip you are looking for. It's possible the
      clip does not belong to you, or it doesn't exist."
        withRetry={false}
      ></ErrorWithRetry>
    );
  }

  if (
    // TODO hardcoded user id
    model.user.id !== "30094526" &&
    clip.broadcasterId !== model.user.id
  ) {
    return (
      <ErrorWithRetry
        text="You can only create clip NFTs of your own clips"
        withRetry={false}
      ></ErrorWithRetry>
    );
  }

  if (model.nft.storeClipLoad && model.nft.storeClipStatus !== undefined) {
    return <LinearLoader text={model.nft.storeClipStatus}></LinearLoader>;
  }

  if (model.nft.mintLoad && model.nft.mintStatus !== undefined) {
    return (
      <ErrorWithRetry
        text={model.nft.mintStatus}
        withRetry={false}
      ></ErrorWithRetry>
    );
  }

  return (
    <Card className={classes.container}>
      <CardMedia
        component="iframe"
        frameBorder="0"
        scrolling="no"
        allowFullScreen={true}
        height="100%"
        width="100%"
        src={clip.embedUrl}
        title={"Twitch clip embedded in iframe"}
        className={classes.iframe}
      />

      <CardContent className={classes.content}>
        <div>
          <Typography variant="subtitle1" component="h6" className="clip-title">
            {clip.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {clip.broadcasterName} playing{" "}
            {model.game.getGame(clip.gameId) ?? "game"}
          </Typography>
        </div>
        <Button
          size="medium"
          color="primary"
          variant="contained"
          disabled={isDisabled}
          onClick={mint}
        >
          {/* Mint */}
          Create NFT
        </Button>
      </CardContent>
    </Card>
  );
}

export default observer(ClipDetailContainer);
