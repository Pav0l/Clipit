import { BigNumberish } from "ethers";
import { AuctionController } from "../domains/auction/auction.controller";
import { MintController } from "../domains/mint/mint.controller";
import { NavigatorController } from "../domains/navigation/navigation.controller";
import { NftController } from "../domains/nfts/nft.controller";
import { SnackbarController } from "../domains/snackbar/snackbar.controller";
import { TwitchClipsErrors } from "../domains/twitch-clips/clip.errors";
import { TwitchClip } from "../domains/twitch-clips/clip.model";
import { Web3Controller } from "../domains/web3/web3.controller";
import { AppModel } from "./app.model";

export class UiController {
  constructor(
    private model: AppModel,
    private web3: Web3Controller,
    private auction: AuctionController,
    private mintCtrl: MintController,
    private nft: NftController,
    private navigator: NavigatorController,
    private snackbar: SnackbarController
  ) {}

  async mint(clip: TwitchClip, creatorShare: string, clipTitle: string, clipDescription?: string) {
    // we need to verify that current user is broadcaster of clip,
    // so we do not allow other people minting streamers clips
    if (clip.broadcasterId !== this.model.user.id) {
      this.snackbar.sendError(TwitchClipsErrors.CLIP_DOES_NOT_BELONG_TO_USER);
      return;
    }

    await this.web3.requestConnectIfProviderExist();
    const address = this.model.web3.getAccount();
    if (!address) {
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

    this.navigator.goToNft(clipNft.id);
  }

  async createAuction(tokenId: string, duration: BigNumberish, minPrice: BigNumberish) {
    await this.web3.requestConnectIfProviderExist();
    const address = this.model.web3.getAccount();
    if (!address) {
      return;
    }

    await this.auction.approveTokenForAuction(tokenId);

    await this.auction.createAuction(tokenId, duration, minPrice);

    await this.nft.getAuctionForToken(tokenId, { clearCache: true });
  }

  async createAuctionBid(auctionId: string, amount: string, tokenId: string) {
    await this.web3.requestConnectIfProviderExist();
    const address = this.model.web3.getAccount();
    if (!address) {
      return;
    }

    await this.auction.bidOnAuction(auctionId, amount);

    await this.nft.getAuctionForToken(tokenId, {
      clearCache: true,
    });
  }

  async endAuction(auctionId: string, tokenId: string) {
    await this.web3.requestConnectIfProviderExist();
    const address = this.model.web3.getAccount();
    if (!address) {
      return;
    }

    await this.auction.endAuction(auctionId);
    await this.nft.getAuctionForToken(tokenId, { clearCache: true });
  }

  async cancelAuction(auctionId: string, tokenId: string) {
    await this.web3.requestConnectIfProviderExist();
    const address = this.model.web3.getAccount();
    if (!address) {
      return;
    }

    await this.auction.cancelAuction(auctionId);
    await this.nft.getAuctionForToken(tokenId, { clearCache: true });
  }
}
