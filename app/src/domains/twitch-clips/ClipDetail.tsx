import "./ClipDetail.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { useStore } from "../../store/StoreProvider";
import { TwitchUserService } from "../../domains/twitch-user/twitch-user.service";
import { TwitchClipsService } from "../../domains/twitch-clips/twitch-clips.service";
import { TwitchGameService } from "../../domains/twitch-games/twitch-games.service";
import { NftService } from "../../domains/nfts/nft.service";
import { snackbarClient } from "../../modules/snackbar/snackbar.client";
import ErrorWithRetry from "../../modules/error/Error";
import { TwitchClipsErrors } from "../../domains/twitch-clips/twitch-clips.errors";

function ClipDetail() {
  const { clipId } = useParams<{ clipId: string }>();
  const { clipsStore, userStore, gameStore, nftStore } = useStore();
  const [isDisabled, setDisabled] = useState(false);

  const userService = new TwitchUserService(userStore);
  const clipsService = new TwitchClipsService(clipsStore);
  const gamesService = new TwitchGameService(gameStore);
  const nftService = new NftService(nftStore);

  const clip = clipsStore.getClip(clipId);

  useEffect(() => {
    if (!userStore.id) {
      userService.getUser();
    }

    if (!clip || clip.id !== clipId) {
      clipsService.getClip(clipId);
    }
  }, []);

  useEffect(() => {
    if (clip && !gameStore.getGame(clip.gameId)) {
      gamesService.getGames(clip.gameId);
    }
  }, [clipsStore.clips.length]);

  const initMint = async () => {
    setDisabled(true);
    // we need to verify that current user is owner of broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (
      clip != null &&
      // TODO hardcoded user Id
      (userStore.id === "30094526" || clip.broadcasterId === userStore.id)
    ) {
      await nftService.prepareMetadataAndMintClip(clip.id);
    } else {
      // TODO SENTRY MONITOR
      snackbarClient.sendError(TwitchClipsErrors.CLIP_DOES_NOT_BELONG_TO_USER);
    }

    setDisabled(false);
  };

  if (userStore.meta.hasError) {
    return <ErrorWithRetry text={userStore.meta.error}></ErrorWithRetry>;
  }

  if (clipsStore.meta.hasError) {
    return <ErrorWithRetry text={clipsStore.meta.error}></ErrorWithRetry>;
  }

  if (nftStore.meta.hasError) {
    return <ErrorWithRetry text={nftStore.meta.error}></ErrorWithRetry>;
  }

  if (nftStore.waitingForBlockConfirmations) {
    return (
      <div>
        Waiting for block confirmations. Progress:{" "}
        {nftStore.confirmationProgress.toString()}% done
      </div>
    );
  }

  if (
    clipsStore.meta.isLoading ||
    userStore.meta.isLoading ||
    nftStore.meta.isLoading
  ) {
    return <div>Loading...</div>;
  }

  if (!clip) {
    return (
      <div>
        It seems we can't find the clip you are looking for. It's possible the
        clip does not belong to you, or it doesn't exist.
      </div>
    );
  }

  if (
    // TODO hardcoded user id
    userStore.id !== "30094526" &&
    clip.broadcasterId !== userStore.id
  ) {
    return <div>You can only create clip NFTs of your own clips</div>;
  }

  console.log(
    "tx mint wait",
    nftStore.waitingForMintTx,
    nftStore.progressMessage
  );
  if (nftStore.waitingForMintTx) {
    return <div>{nftStore.progressMessage}</div>;
  }

  if (nftStore.confirmedClipId === clip.id && nftStore.metadata) {
    return (
      <div>
        <div>Ready for minting</div>
        <CardMedia component="iframe" src={clip.embedUrl} title={clip.title} />

        <div>Title: {nftStore.metadata.name}</div>
        <div>Descripton: {nftStore.metadata.description}</div>
        <div>
          Attributes:
          <ul>
            {nftStore.metadata.attributes?.map((attr, idx) => {
              return (
                <li key={idx}>
                  {attr.traitType}: {attr.value}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Card className="clip-detail">
      <CardActionArea>
        <CardMedia component="iframe" src={clip.embedUrl} title={clip.title} />
        <CardContent className="clip-detail-text">
          <Typography variant="subtitle1" component="h6" className="clip-title">
            {clip.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {clip.broadcasterName} playing{" "}
            {gameStore.getGame(clip.gameId) ?? "game"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Button
        size="small"
        color="primary"
        disabled={isDisabled}
        onClick={initMint}
      >
        Mint
      </Button>
    </Card>
  );
}

export default observer(ClipDetail);

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

    if (clipsStore.meta.isLoading) {
    return (
      <Box className="container">
        <Typography variant="h6" align="center" className="typography">
          Generating your NFT. This may take a moment...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  
  if (clipCid && nftStored) {
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
