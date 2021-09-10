import { localStorage } from "../../lib/local-storage"

const CLIP_TO_METADATA_KEY = "clip_metadataCid_";
export const storeClipToMetadataPair = (clipId: string, metadataCid: string) => {
  localStorage.setItem(`${CLIP_TO_METADATA_KEY}${clipId}`, metadataCid);
}

export const clearClipToMetadataPair = (clipId: string) => {
  localStorage.removeItem(`${CLIP_TO_METADATA_KEY}${clipId}`);
}
