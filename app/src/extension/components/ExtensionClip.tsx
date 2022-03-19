import { observer } from "mobx-react-lite";
import { Card, CardMedia, Link } from "@material-ui/core";

import { GameModel } from "../../domains/twitch-games/game.model";
import { ClipModel, TwitchClip } from "../../domains/twitch-clips/clip.model";
import ClipCardContent from "../../domains/twitch-clips/components/ClipCardContent";
import { StreamerUiController } from "../domains/streamer/streamer-ui.controller";
import { Web3Model } from "../../domains/web3/web3.model";
import ErrorWithRetry from "../../components/error/Error";
import FullPageLoader from "../../components/loader/FullPageLoader";
import LinearLoader from "../../components/loader/LinearLoader";
import { useInputData } from "../../lib/hooks/useInputData";
import { ExtensionClipError } from "./ExtensionClipError";
import { StreamerUiModel } from "../domains/streamer/streamer-ui.model";
import { NftModel } from "../../domains/nfts/nft.model";
import { makeAppStyles } from "../../domains/theme/theme.constants";
import { MintModel, MintStatus } from "../../domains/mint/mint.model";

interface Props {
  clip: TwitchClip;
  model: {
    clip: ClipModel;
    game: GameModel;
    web3: Web3Model;
    nft: NftModel;
    streamerUi: StreamerUiModel;
    mint: MintModel;
  };
  operations: {
    streamerUi: StreamerUiController;
  };
}

export const ExtensionClip = observer(function ExtensionClip({ model, operations, clip }: Props) {
  const classes = useStyles();

  const [titleInput, setTitleInput, clearTitleInput] = useInputData(clip.title);
  const [descriptionInput, setDescInput, clearDescInput] = useInputData(
    model.clip.createDefaultClipDescription(clip.broadcasterName, model.game.getGame(clip.gameId))
  );
  const [creatorShare, setShareInput, clearShareInput] = useInputData("10");

  const mint = async () => {
    await operations.streamerUi.mint(clip, creatorShare, titleInput, descriptionInput);
  };

  if (model.web3.meta.error) {
    return (
      <ExtensionClipError
        error={model.web3.meta.error}
        mintHandler={async () => {
          model.web3.meta.resetError();
          await mint();
        }}
        fetchClipFromSubgraphHandler={async () => {
          model.web3.meta.resetError();
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await operations.streamerUi.getTokenMetadataAndGoToNft(model.streamerUi.tokenId!);
        }}
      />
    );
  }

  if (model.clip.meta.isLoading || model.web3.meta.isLoading || model.nft.meta.isLoading) {
    return <FullPageLoader />;
  }

  if (model.mint.storeClipStatus) {
    return <LinearLoader text={model.mint.storeClipStatus} classNames={classes.linearLoaderWidth} />;
  }

  if (model.mint.mintStatus) {
    switch (model.mint.mintStatus) {
      case MintStatus.CONFIRM_MINT:
        return (
          <ErrorWithRetry text={model.mint.mintStatus} withRetry={false} classNames={classes.error}></ErrorWithRetry>
        );
      case MintStatus.WAIT_FOR_MINT_TX:
        return <LinearLoader text={model.mint.mintStatus} classNames={classes.linearLoaderWidth} />;
    }
  }

  return (
    <Card className={classes.container}>
      <Link
        href={`https://www.twitch.tv/${clip.broadcasterName}/clip/${clip.id}`}
        underline="none"
        target="_blank"
        rel="noreferrer"
      >
        <CardMedia
          component="img"
          height="100%"
          width="100%"
          src={clip.thumbnailUrl}
          title={"Click on the image to view the Clip"}
        />
      </Link>

      <ClipCardContent
        validateCreatorShare={operations.streamerUi.validateCreatorShare}
        mint={mint}
        onCancel={operations.streamerUi.backToInput}
        titleInputHook={[titleInput, setTitleInput, clearTitleInput]}
        descInputHook={[descriptionInput, setDescInput, clearDescInput]}
        shareInputHook={[creatorShare, setShareInput, clearShareInput]}
      />
    </Card>
  );
});

const useStyles = makeAppStyles(() => ({
  container: {
    margin: "2rem auto",
    borderRadius: "0px",
  },
  error: {
    margin: "0",
  },
  errorBtn: {
    margin: "1rem 0",
  },
  linearLoaderWidth: {
    maxWidth: "100%",
    width: "inherit",
  },
}));
