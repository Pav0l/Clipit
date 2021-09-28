import { localStorage } from "../../lib/local-storage"

interface Data {
  metadataCid: string;
  address: string;
}

const CLIP_TO_METADATA_KEY = "clip_metadataCid_";


export const storeClipToMetadataPair = (clipId: string, value: Data) => {
  if (!isClipData(value)) {
    // SENTRY MONITOR
    return;
  }
  localStorage.setItem(`${CLIP_TO_METADATA_KEY}${clipId}`, JSON.stringify(value));
}

export const clearClipToMetadataPair = (clipId: string) => {
  localStorage.removeItem(`${CLIP_TO_METADATA_KEY}${clipId}`);
}

// TODO create getter that is used in case a clips metadata was already created,
// but minting did not go through for some reasom
export const isClipMetadataCreated = (clipId: string) => {
  const data = localStorage.getItem(`${CLIP_TO_METADATA_KEY}${clipId}`);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as Data;
}

const isClipData = (data: Data | unknown): data is Data => {
  return (data as Data).address !== undefined &&
    (data as Data).address !== "" &&
    (data as Data).metadataCid !== undefined &&
    (data as Data).metadataCid !== "";
}
