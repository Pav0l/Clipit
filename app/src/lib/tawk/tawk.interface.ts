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
   * Returns a boolean indicating whether the chat widget is minimized.
   */
  isChatMinimized: () => boolean;

  // TODO: setAttributes(), Secure Mode
}
