import { localStorage } from "../../lib/local-storage"

const CLIP_TO_METADATA_KEY = "clip_metadataCid_";
export const storeClipToMetadataPair = (clipId: string, metadataCid: string) => {
  localStorage.setItem(`${CLIP_TO_METADATA_KEY}${clipId}`, metadataCid);
}
// TODO create getter that is used in case a clips metadata was already created,
// but minting did not go through for some reasom
export const clearClipToMetadataPair = (clipId: string) => {
  localStorage.removeItem(`${CLIP_TO_METADATA_KEY}${clipId}`);
}
