import { makeAutoObservable } from "mobx";
import { pinataGatewayUri } from "../../lib/constants";

interface DemoData {
  collector: string;
  clipTitle: string;
  clipAuthor: string;
  authorLink: string;
  streamedDate: string;
  mintedDate: string;
}

export const demoStore: { [cid: string]: DemoData } = {
  // fallback
  bafybeihrd4zsovhd27cdthlf3mn7euzba37yti6rzyjlbni7fxjd7rq7zi: {
    collector: "demolith.eth",
    clipTitle: "The stream will be starting soon!(TM)",
    clipAuthor: "kl3on_tv",
    authorLink: "https://www.twitch.tv/",
    streamedDate: "April 17, 2022",
    mintedDate: "April 19, 2022",
  },
};

export class DemoModel {
  // fallback clip if cid does not exist in URL
  cid = "bafybeihrd4zsovhd27cdthlf3mn7euzba37yti6rzyjlbni7fxjd7rq7zi";

  constructor() {
    makeAutoObservable(this);
  }

  setCid = (value: string) => {
    this.cid = value;
  };

  get ipfsUri() {
    return `${pinataGatewayUri}/${this.cid}`;
  }
}
