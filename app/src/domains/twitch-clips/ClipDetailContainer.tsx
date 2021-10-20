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
import { TwitchClipsErrors } from "./twitch-clips.errors";
import { NftErrors } from "../nfts/nft.errors";
import { ClipModel } from "./clip.model";
import { UserModel } from "../twitch-user/user.model";
import { GameModel } from "../twitch-games/game.model";
import { NftModel } from "../nfts/nft.model";
import { IAppController } from "../app/app.controller";
import FullPageLoader from "../../components/loader/FullPageLoader";
import LinearLoader from "../../components/loader/LinearLoader";

interface Props {
  model: {
    clip: ClipModel;
    user: UserModel;
    game: GameModel;
    nft: NftModel;
  };
  operations: IAppController;
  snackbar: SnackbarClient;
}

function ClipDetailContainer({ model, operations, snackbar }: Props) {
  const { clipId } = useParams<{ clipId: string }>();
  const [isDisabled, setDisabled] = useState(false);

  const clip = model.clip.getClip(clipId);

  const history = useHistory();
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

  const initMint = async () => {
    setDisabled(true);
    // we need to verify that current user is owner of broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (
      clip != null &&
      // TODO hardcoded user Id
      (model.user.id === "30094526" || clip.broadcasterId === model.user.id)
    ) {
      try {
        try {
          const { ethereum, contract } =
            await operations.initializeWeb3Clients();

          if (!operations.nft && ethereum && contract) {
            operations.createNftCtrl(ethereum, contract);
          }
        } catch (error) {
          snackbar.sendError((error as Error).message);
          return;
        }

        if (!operations.nft) {
          throw new Error("Failed to initialize nft controller");
        }

        await operations.nft.prepareMetadataAndMintClip(clip.id);
        // TODO the tokenId here is from previous mint!
        console.log("tokenId from mint -> redirecting", model.nft.tokenId);
        if (model.nft.tokenId) {
          history.push(`/nfts/${model.nft.tokenId}`);
        }
      } catch (error) {
        // TODO SENTRY MONITOR
        model.nft.meta.setError(NftErrors.SOMETHING_WENT_WRONG);
      }
    } else {
      // TODO SENTRY MONITOR
      snackbar.sendError(TwitchClipsErrors.CLIP_DOES_NOT_BELONG_TO_USER);
    }

    setDisabled(false);
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

  console.log(
    "storeClip state",
    model.nft.storeClipLoad,
    model.nft.storeClipStatus,
    model.nft.storeClipLoad && model.nft.storeClipStatus !== undefined
  );

  console.log(
    "mint state",
    model.nft.mintLoad,
    model.nft.mintStatus,
    model.nft.mintLoad && model.nft.mintStatus !== undefined
  );

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
          onClick={initMint}
        >
          {/* Mint */}
          Create NFT
        </Button>
      </CardContent>
    </Card>
  );
}

export default observer(ClipDetailContainer);

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

/**

 
  const createTokenSale = async (event: React.MouseEvent) => {
    event.preventDefault();

    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
    console.log("creating order for token", tokenId);
    const listing = await seaport.createSellOrder({
      asset: {
        tokenAddress: contractAddress,
        tokenId: tokenId
      },
      accountAddress: await signer.getAddress(),
      startAmount: 1,
      expirationTime
    });

    console.log("order created", listing);
  };

    if (model.clip.meta.isLoading) {
    return (
      <Box className="container">
        <Typography variant="h6" align="center" className="typography">
          Generating your NFT. This may take a moment...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  
  if (clipCid && model.nftd) {
    return (
      <Box className="container">
        <Typography variant="h4" align="center" className="typography">
          Congrats! Your clip is now an NFT 🎉🎉🎉
        </Typography>
        <Typography variant="h6" align="center">
          Your clip is now stored on IPFS under {clipCid}
        </Typography>
        <Typography variant="h6" align="center">
          And then minted into unique NFT, which you can trade with your fans.
        </Typography>

        <ClipCard cid={clipCid}></ClipCard>

        <Button
          variant="contained"
          color="primary"
          className="button"
          disabled={isBtnDisabled}
          onClick={(ev) => createTokenSale(ev)}
        >
          Put up for sale
        </Button>
        <Link to="/clips">
          <Button variant="contained" color="primary" className="button">
            Your NFT clips
          </Button>
        </Link>
      </Box>
    );
  }

 */
