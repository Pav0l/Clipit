import { TawkClient } from "../../lib/tawk/tawk.client";

export class SupportWidgetService {
  constructor(private tawk: TawkClient) {}

  open = () => {
    if (this.tawk.isChatMinimized()) {
      this.tawk.maximize();
    }
  };

  hide = () => {
    this.tawk.hideWidget();
  };

  show = () => {
    if (this.tawk.isChatHidden()) {
      this.tawk.showWidget();
    }
  };
}
