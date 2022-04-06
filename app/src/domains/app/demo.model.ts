import { makeAutoObservable } from "mobx";
import { pinataGatewayUri } from "../../lib/constants";

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
