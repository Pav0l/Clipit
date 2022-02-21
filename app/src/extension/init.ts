import { Logger } from "../lib/logger/logger";
import { ExtensionMode } from "./domains/extension/extension.interfaces";
import { ExtensionModel } from "./domains/extension/extension.model";
import { ALLOWED_PATHS } from "./domains/extension/extension.routes";

export function initExtSynchronous(path: string, twitchHelper: typeof Twitch.ext) {
  let mode: ExtensionMode = "UNKNOWN";

  if (path.includes(ALLOWED_PATHS.PANEL)) {
    mode = "PANEL";
  } else if (path.includes(ALLOWED_PATHS.CONFIG)) {
    mode = "CONFIG";
  } else if (path.includes(ALLOWED_PATHS.STREAMER)) {
    mode = "STREAMER";
  }

  const logger = new Logger(twitchHelper.rig);
  const model = new ExtensionModel(mode);

  return {
    model,
    logger,
  };
}
