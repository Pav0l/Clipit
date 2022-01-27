export const clipCid = `clip-cid-${Math.random()}`;
export const metadataCid = `metadata-cid-${Math.random()}`;

export const metadata = {
  attributes: [
    { trait_type: "Game", value: "What a game" },
    { trait_type: "Streamer", value: "HappySumber" },
  ],
  clipCid: clipCid,
  description: "Not sure what to put into this description",
  external_url: `http://localhost:3000/${clipCid}`,
  clipUri: `ipfs://${clipCid}`,
  name: "clip title",
  clipId: "clip slug",
  thumbnailUri: "https://example.com/thumbnail.jpg",
};
