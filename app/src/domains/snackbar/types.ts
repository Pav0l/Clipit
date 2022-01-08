export type SnackSeverity = "error" | "success" | "info";

export interface ISnack {
  text: string;
  severity: SnackSeverity;
  /**
   * Duration in ms after which the snackbar is hidden
   */
  duration: number;
}
