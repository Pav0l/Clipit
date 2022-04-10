/**
 * The SDK provides a set of methods to manipulate the chat widget displayed on the app
 *
 * @docs https://developer.tawk.to/jsapi/
 */
export interface TawkSdk {
  /**
   * Maximizes the chat widget
   */
  maximize: () => void;

  /**
   * Returns a boolean indicating whether the chat widget is minimized
   */
  isChatMinimized: () => boolean;

  /**
   * Shows the chat widget
   */
  showWidget: () => void;

  /**
   * Hides the chat widget
   */
  hideWidget: () => void;

  /**
   * Returns a boolean value indicating whether the chat widget is hidden
   */
  isChatHidden: () => boolean;

  // TODO: setAttributes(), Secure Mode
}
