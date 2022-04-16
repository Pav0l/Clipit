import { makeAutoObservable } from "mobx";

interface DemoData {
  collector: string;
  clipTitle: string;
  clipAuthor: string;
  clipThumbnail: string;
  embedUrl: string;
  authorLink: string;
  streamedDate: string;
  mintedDate: string;
}

export const demoStore: { [cid: string]: DemoData } = {
  // fallback
  "HungryTemperedMeerkatDoggo-UdQIrs87iEiQolN-": {
    collector: "demolith.eth",
    clipTitle: "The stream will be starting soon!(TM)",
    clipAuthor: "kl3on_tv",
    authorLink: "https://www.twitch.tv/",
    streamedDate: "April 17, 2022",
    mintedDate: "April 19, 2022",
    clipThumbnail: "https://clips-media-assets2.twitch.tv/44944309404-offset-56-preview-480x272.jpg",
    embedUrl: "https://clips.twitch.tv/embed?clip=HungryTemperedMeerkatDoggo-UdQIrs87iEiQolN-",
  },
};

export class DemoModel {
  // fallback clip
  slug = "HungryTemperedMeerkatDoggo-UdQIrs87iEiQolN-";

  constructor() {
    makeAutoObservable(this);
  }

  setSlug = (value: string) => {
    this.slug = value;
  };
}
