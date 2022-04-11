import { TawkClient } from "../../lib/tawk/tawk.client";

export class SupportWidgetService {
  loaded = false;
  id?: number;

  constructor(private tawk: TawkClient) {
    this.tawk.onLoad(() => {
      this.loaded = true;
    });
  }

  open = () => {
    if (this.tawk.isChatMinimized()) {
      this.tawk.maximize();
    }
  };

  hide = () => {
    // this method is called on mount of Home component, but TawkClient may not have loaded yet
    // if that's the case, try again
    if (!this.loaded) {
      this.id = window.setInterval(() => {
        this.hide();
      }, 50);
      return;
    }

    window.clearInterval(this.id);
    if (!this.tawk.isChatHidden()) {
      this.tawk.hideWidget();
    }
  };

  show = () => {
    if (this.tawk.isChatHidden()) {
      this.tawk.showWidget();
    }
  };
}
