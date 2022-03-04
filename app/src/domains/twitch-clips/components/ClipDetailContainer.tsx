import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Card, CardMedia, makeStyles } from "@material-ui/core";

import ErrorWithRetry from "../../../components/error/Error";
import { ClipModel } from "../clip.model";
import { UserModel } from "../../twitch-user/user.model";
import { GameModel } from "../../twitch-games/game.model";
import { IWeb3Controller } from "../../web3/web3.controller";
import FullPageLoader from "../../../components/loader/FullPageLoader";
import LinearLoader from "../../../components/loader/LinearLoader";
import { UserController } from "../../twitch-user/user.controller";
import { ClipController } from "../clip.controller";
import { GameController } from "../../twitch-games/game.controller";
import { useInputData } from "../../../lib/hooks/useInputData";
import { MintStatus, Web3Model } from "../../web3/web3.model";
import ClipCardContent from "./ClipCardContent";
import { SnackbarController } from "../../snackbar/snackbar.controller";
import { NftController } from "../../nfts/nft.controller";
import { NftModel } from "../../nfts/nft.model";

interface Props {
  model: {
    clip: ClipModel;
    user: UserModel;
    game: GameModel;
    web3: Web3Model;
    nft: NftModel;
  };
  operations: {
    web3: IWeb3Controller;
    nft: NftController;
    user: UserController;
    clip: ClipController;
    game: GameController;
    snackbar: SnackbarController;
  };
}

function ClipDetailContainer({ model, operations }: Props) {
  const { clipId } = useParams<{ clipId: string }>();
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
    // we need to verify that current user is owner of broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (clip?.broadcasterId !== model.user.id) {
      operations.snackbar.sendError("Only Clip broadcaster can mint Clip into NFT");
      return;
    }

    if (clip != null) {
      await operations.web3.requestConnectAndMint(clip.id, {
        creatorShare,
        clipTitle: titleInput,
        clipDescription: descriptionInput,
      });

      const txHash = model.web3.mintTxHash;
      if (!txHash) {
        // mint failed
        return;
      }

      const clipNft = await operations.nft.getClipIdForTxHash(txHash);
      if (!clipNft) {
        // fetch failed, nft.error is set tho
        return;
      }

      // TODO ideally we do not want to reload the app here and just update state
      location.assign(location.origin + `/nfts/${clipNft.id}`);
    }
  };

  if (model.user.meta.error) {
    return <ErrorWithRetry text={model.user.meta.error.message} />;
  }

  if (model.clip.meta.error) {
    return <ErrorWithRetry text={model.clip.meta.error.message} />;
  }

  if (model.web3.meta.error) {
    return <ErrorWithRetry text={model.web3.meta.error.message} />;
  }

  if (model.nft.meta.error) {
    return <ErrorWithRetry text={model.nft.meta.error.message} />;
  }

  if (model.nft.meta.isLoading || model.clip.meta.isLoading || model.user.meta.isLoading || model.web3.meta.isLoading) {
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

  if (model.web3.storeClipStatus) {
    return <LinearLoader text={model.web3.storeClipStatus} classNames={classes.linLoaderWidth} />;
  }

  if (model.web3.mintStatus) {
    switch (model.web3.mintStatus) {
      case MintStatus.CONFIRM_MINT:
        return <ErrorWithRetry text={model.web3.mintStatus} withRetry={false} />;
      case MintStatus.WAIT_FOR_MINT_TX:
        return <LinearLoader text={model.web3.mintStatus} classNames={classes.linLoaderWidth} />;
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
}

export default observer(ClipDetailContainer);

const useStyles = makeStyles(() => ({
  container: {
    margin: "2rem auto",
    borderRadius: "0px",
  },
  iframe: {
    // video aspect ratio is 16:9
    width: "80vw",
    height: "45vw",
    maxHeight: "70vh",
  },
  linLoaderWidth: {
    width: "100%",
  },
}));
