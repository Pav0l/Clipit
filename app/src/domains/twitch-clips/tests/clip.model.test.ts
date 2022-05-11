import { TwitchClip } from "../clip.model";

describe("clip model", () => {
  it("works", () => {
    const clip = new TwitchClip({
      id: "id",
      embed_url: "http://localhost",
      broadcaster_id: "broadcaster_id",
      broadcaster_name: "broadcaster_name",
      game_id: "game_id",
      title: "title",
      thumbnail_url: "thumbnail_url",
    });
    expect(clip.id).toEqual("id");
    // embedUrl appends parent query string parameter
    expect(clip.embedUrl).toEqual("http://localhost/?parent=localhost&autoplay=true");
    expect(clip.broadcasterId).toEqual("broadcaster_id");
    expect(clip.broadcasterName).toEqual("broadcaster_name");
    expect(clip.gameId).toEqual("game_id");
    expect(clip.title).toEqual("title");
    expect(clip.thumbnailUrl).toEqual("thumbnail_url");
  });

  it("fills undefined values with defaults", () => {
    const clip = new TwitchClip({});
    expect(clip.id).toEqual("");
    expect(clip.broadcasterId).toEqual("");
    expect(clip.broadcasterName).toEqual("");
    expect(clip.gameId).toEqual("");
    expect(clip.title).toEqual("");
    expect(clip.thumbnailUrl).toEqual("");
    expect(clip.embedUrl).toEqual("");
  });
});
