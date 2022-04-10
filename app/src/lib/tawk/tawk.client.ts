import { TawkSdk } from "./tawk.interface";

export class TawkClient implements TawkSdk {
  private get sdk() {
    return window.Tawk_API;
  }

  maximize = () => {
    this.sdk?.maximize();
  };

  isChatMinimized = () => {
    return !!this.sdk?.isChatMinimized();
  };

  showWidget = () => {
    this.sdk?.showWidget();
  };

  hideWidget = () => {
    this.sdk?.hideWidget();
  };

  isChatHidden = () => !!this.sdk?.isChatHidden();
}
