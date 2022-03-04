import { Web3Controller } from "../../../domains/web3/web3.controller";
import { UserModel } from "../../../domains/twitch-user/user.model";
import { Web3Model } from "../../../domains/web3/web3.model";
import { ConfigUiModel } from "./config-ui.model";

export class ConfigUiController {
  constructor(
    private model: { web3: Web3Model; configUi: ConfigUiModel; user: UserModel },
    private web3: Web3Controller
  ) {}

  initialize() {
    if (!this.model.web3.isMetaMaskInstalled() || !this.model.web3.isProviderConnected()) {
      this.model.configUi.goToMissingProvider();
      return;
    }

    this.model.configUi.goToChangeProvider();
  }

  connectMetamask = async () => {
    await this.web3.requestConnect();

    const address = this.model.web3.getAccount();
    if (!address) {
      return;
    }

    // TODO map the userId - address mapping!
    console.log(`connecting ${this.model.user.id} with ${this.model.web3.getAccount()}`);

    // TODO register onAccountChange handler

    // provider connected -> show "connected page" with option to change provider
    this.model.configUi.goToChangeProvider();
  };

  goBackToProvider = () => {
    this.model.configUi.goToMissingProvider();
  };
}
