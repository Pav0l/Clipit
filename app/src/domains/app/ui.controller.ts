import { AuctionController } from "../auction/auction.controller";
import { MintController } from "../mint/mint.controller";
import { NftController } from "../nfts/nft.controller";
import { SnackbarController } from "../snackbar/snackbar.controller";
import { TwitchClipsErrors } from "../twitch-clips/clip.errors";
import { TwitchClip } from "../twitch-clips/clip.model";
import { Web3Controller } from "../web3/web3.controller";
import { AppModel } from "./app.model";

export class UiController {
  constructor(
    private model: AppModel,
    private web3: Web3Controller,
    private auction: AuctionController,
    private mintCtrl: MintController,
    private nft: NftController,

    private snackbar: SnackbarController
  ) {}

  async mint(clip: TwitchClip, creatorShare: string, clipTitle: string, clipDescription?: string) {
    // we need to verify that current user is broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (clip.broadcasterId !== this.model.user.id) {
      this.snackbar.sendError(TwitchClipsErrors.CLIP_DOES_NOT_BELONG_TO_USER);
      return;
    }
    await this.web3.requestConnect();
    const address = this.model.web3.getAccount();
    if (!address) {
      // requestAccounts failed (rejected/already opened, etc...) and notification to user was sent
      // just stop here
      return;
    }

    await this.mintCtrl.prepareMetadataAndMintClip(clip.id, {
      address,
      creatorShare,
      clipTitle,
      clipDescription,
    });

    const txHash = this.model.mint.mintTxHash;
    if (!txHash) {
      // mint failed
      return;
    }

    const clipNft = await this.nft.getClipIdForTxHash(txHash);
    if (!clipNft) {
      // fetch failed, nft.error is set tho
      return;
    }

    // TODO ideally we do not want to reload the app here and just update state
    location.assign(location.origin + `/nfts/${clipNft.id}`);
  }
}
