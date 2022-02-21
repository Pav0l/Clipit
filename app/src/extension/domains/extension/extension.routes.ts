export enum ALLOWED_PATHS {
  /**
   * Shown to broadcasters while they are configuring your extension, within the Extension Manager.
   * It should be used for infrequent, install-time configuration.
   */
  CONFIG = "/config",
  /**
   * Shown to streamers in the Live module of the Dashboard.
   * It is used for streamer actions taken while the extension is active
   */
  STREAMER = "/streamer",
  /**
   * Shown to viewers on the channel page when the extension is activated in a Panel slot
   */
  PANEL = "/panel",
}
