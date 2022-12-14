import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardMedia } from "@material-ui/core";

import ErrorWithRetry from "../../../components/error/Error";
import { ClipModel } from "../clip.model";
import { UserModel } from "../../twitch-user/user.model";
import { GameModel } from "../../twitch-games/game.model";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import LinearLoader from "../../../components/loader/LinearLoader";
import { UserController } from "../../twitch-user/user.controller";
import { ClipController } from "../clip.controller";
import { GameController } from "../../twitch-games/game.controller";
import { useInputData } from "../../../lib/hooks/useInputData";
import { Web3Model } from "../../web3/web3.model";
import ClipCardContent from "./ClipCardContent";
import { NftModel } from "../../nfts/nft.model";
import { makeAppStyles } from "../../theme/theme.constants";
import { MintModel, MintStatus } from "../../mint/mint.model";
import { UiController } from "../../../app/ui.controller";

interface Props {
  clipId: string;
  model: {
    clip: ClipModel;
    user: UserModel;
    game: GameModel;
    web3: Web3Model;
    nft: NftModel;
    mint: MintModel;
  };
  operations: {
    ui: UiController;
    clip: ClipController;
    user: UserController;
    game: GameController;
  };
}

export const ClipContainer = observer(function ClipDetailContainer({ model, operations, clipId }: Props) {
  const clip = model.clip.getClip(clipId);

  const [titleInput, setTitleInput, clearTitleInput] = useInputData();
  const [descriptionInput, setDescInput, clearDescInput] = useInputData();
  const [creatorShare, setShareInput, clearShareInput] = useInputData("0");

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

  useEffect(() => {
    if (clip) {
      setTitleInput(clip.title);

      setDescInput(model.clip.createDefaultClipDescription(clip.broadcasterName, model.game.getGame(clip.gameId)));
    }
  }, [model.game.games.size, model.clip.clips.length]);

  const mint = async () => {
    await operations.ui.mint(clip!, creatorShare, titleInput, descriptionInput);
  };

  if (model.user.meta.error) {
    return <ErrorWithRetry text={model.user.meta.error.message} />;
  }

  if (model.clip.meta.error) {
    return <ErrorWithRetry text={model.clip.meta.error.message} />;
  }

  if (model.mint.meta.error) {
    return <ErrorWithRetry text={model.mint.meta.error.message} />;
  }

  if (model.nft.meta.error) {
    return <ErrorWithRetry text={model.nft.meta.error.message} />;
  }

  if (
    model.nft.meta.isLoading ||
    model.clip.meta.isLoading ||
    model.user.meta.isLoading ||
    model.mint.meta.isLoading ||
    model.web3.meta.isLoading
  ) {
    return <FullPageLoader />;
  }

  if (!clip) {
    return (
      <ErrorWithRetry
        text="It seems we can't find the clip you are looking for. It's possible the
      clip does not belong to you, or it doesn't exist."
        withRetry={false}
      />
    );
  }

  if (model.mint.storeClipStatus) {
    return <LinearLoader text={model.mint.storeClipStatus} classNames={classes.linLoaderWidth} />;
  }

  if (model.mint.mintStatus) {
    switch (model.mint.mintStatus) {
      case MintStatus.CONFIRM_MINT:
        return <ErrorWithRetry text={model.mint.mintStatus} withRetry={false} />;
      case MintStatus.WAIT_FOR_MINT_TX:
        return <LinearLoader text={model.mint.mintStatus} classNames={classes.linLoaderWidth} />;
    }
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

      <ClipCardContent
        validateCreatorShare={operations.clip.validateCreatorShare}
        mint={mint}
        titleInputHook={[titleInput, setTitleInput, clearTitleInput]}
        descInputHook={[descriptionInput, setDescInput, clearDescInput]}
        shareInputHook={[creatorShare, setShareInput, clearShareInput]}
      />
    </Card>
  );
});

const useStyles = makeAppStyles((theme) => ({
  container: {
    margin: "2rem",
    backgroundColor: theme.colors.background_primary,
  },
  iframe: {
    height: "45vw",
    maxHeight: "70vh",
    margin: "0.5rem auto",
  },
  linLoaderWidth: {
    width: "inherit",
  },
}));
