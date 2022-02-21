import { ClipController } from "../../../domains/twitch-clips/clip.controller";
import { TwitchClipsErrors } from "../../../domains/twitch-clips/clip.errors";
import { Web3Controller } from "../../../domains/web3/web3.controller";
import { IExtensionModel } from "../extension/extension.model";

export class StreamerUiController {
  constructor(private model: IExtensionModel, private clip: ClipController, private web3: Web3Controller) {}

  initialize() {
    if (!this.model.web3.isMetaMaskInstalled() || !this.model.web3.isProviderConnected()) {
      this.model.streamerUi.setPage("MISSING_PROVIDER");
      return;
    }

    this.model.streamerUi.setPage("INPUT");
  }

  async prepareNft(url: string) {
    const clipId = this.clip.validateClipUrl(url);
    if (!clipId) {
      return;
    }

    await this.clip.getClip(clipId);

    const clip = this.model.clip.getClip(clipId);

    if (!clip) {
      this.model.streamerUi.meta.setError(TwitchClipsErrors.CLIP_DOES_NOT_EXIST);
      return;
    }

    // we've got the clip -> display it
    this.model.streamerUi.setPage("CLIP");
  }

  connectMetamask = async () => {
    await this.web3.requestConnect();

    if (!this.model.web3.isProviderConnected()) {
      return;
    }

    // provider connected -> get clip input
    this.model.streamerUi.setPage("INPUT");
  };
}
