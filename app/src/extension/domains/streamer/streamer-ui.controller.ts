import { utils } from "ethers";
import { NftController } from "../../../domains/nfts/nft.controller";
import { SnackbarController } from "../../../domains/snackbar/snackbar.controller";
import { ClipController } from "../../../domains/twitch-clips/clip.controller";
import { TwitchClipsErrors } from "../../../domains/twitch-clips/clip.errors";
import { TwitchClip } from "../../../domains/twitch-clips/clip.model";
import { GameController } from "../../../domains/twitch-games/game.controller";
import { Web3Controller } from "../../../domains/web3/web3.controller";
import { Logger } from "../../../lib/logger/logger";
import { IExtensionModel } from "../extension/extension.model";

export class StreamerUiController {
  constructor(
    private model: IExtensionModel,
    private clip: ClipController,
    private game: GameController,
    private web3: Web3Controller,
    private nft: NftController,
    private snackbar: SnackbarController,
    private logger: Logger
  ) {}

  initialize() {
    if (!this.model.web3.isMetaMaskInstalled() || !this.model.web3.isProviderConnected()) {
      this.model.streamerUi.goToMissingProvider();
      return;
    }

    this.model.streamerUi.goToInput();
  }

  createAuction = async (tokenId: string, duration: string, reservePrice: string) => {
    await this.web3.requestConnectAndCreateAuction(
      tokenId,
      Number(duration) * 86400, // 1 day in seconds
      utils.parseEther(reservePrice)
    );
    const txHash = this.model.web3.createAuctionTxHash;
    if (!txHash) {
      // failed the tx
      return;
    }

    this.logger.log("auction created: ", txHash);

    await this.getAuctionDataAndGoToAuction(tokenId);
  };

  getAuctionDataAndGoToAuction = async (tokenId: string) => {
    await this.nft.getAuctionForToken(tokenId, { clearCache: true });

    const metadata = this.model.nft.getTokenMetadata(tokenId);
    if (!metadata || !metadata.auction) {
      return;
    }

    this.model.streamerUi.goToAuction(metadata.auction.id);
  };

  async mint(clip: TwitchClip, creatorShare: string, clipTitle: string, clipDescription?: string) {
    // we need to verify that current user is broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (clip.broadcasterId !== this.model.user.id) {
      this.snackbar.sendError(TwitchClipsErrors.CLIP_DOES_NOT_BELONG_TO_USER);
      return;
    }

    // if the subgraph request based on txHash fails, we never get tokenId back!
    await this.web3.requestConnectAndMint(clip.id, { creatorShare, clipTitle, clipDescription });

    const txHash = this.model.web3.mintTxHash;
    if (!txHash) {
      return;
    }

    this.logger.log("token minted. fetching data based on txHash", txHash);
    const data = await this.nft.getClipIdForTxHash(txHash);

    if (!data) {
      return;
    }
    const tokenId = data.id;
    this.logger.log("got token id:", tokenId);

    await this.getTokenMetadataAndGoToNft(tokenId);
  }

  getTokenMetadataAndGoToNft = async (tokenId: string) => {
    this.model.nft.meta.setLoading(true);
    await this.nft.getTokenMetadata(tokenId);

    if (!this.model.nft.getTokenMetadata(tokenId)) {
      return;
    }

    this.model.nft.meta.setLoading(false);
    this.model.streamerUi.goToNft(tokenId);
  };

  validateCreatorShare = (share: string) => {
    return this.clip.validateCreatorShare(share);
  };

  async prepareClip(url: string) {
    const clipId = this.clip.validateClipUrl(url);
    if (!clipId) {
      return;
    }

    this.model.streamerUi.setClipId(clipId);

    await this.getClipDataAndGoToClip(clipId);
  }

  getClipDataAndGoToClip = async (clipId: string) => {
    await this.clip.getClip(clipId);

    const clip = this.model.clip.getClip(clipId);

    if (!clip) {
      this.snackbar.sendError(TwitchClipsErrors.CLIP_DOES_NOT_EXIST);
      return;
    }

    await this.game.getGames(clip.gameId);

    // we've got the clip -> display it
    this.model.streamerUi.goToClip(clip.id);
  };

  connectMetamask = async () => {
    await this.web3.requestConnect();

    if (!this.model.web3.isProviderConnected()) {
      return;
    }

    // provider connected -> get clip input
    this.model.streamerUi.goToInput();
  };

  backToInput = () => {
    this.model.streamerUi.goToInput();
  };

  backToClip = (clipId: string) => {
    this.model.streamerUi.goToClip(clipId);
  };

  backToNft = (tokenId: string) => {
    this.model.streamerUi.goToNft(tokenId);
  };
}
