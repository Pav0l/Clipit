import React, { ErrorInfo } from "react";
import ErrorWithRetry from "./Error";

export default class ErrorBoundary extends React.Component<Record<string, unknown>, { hasError: boolean }> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ hasError: true });
    // SENTRY
    console.log("[LOG]:error boundry error:", error);
    console.log("[LOG]:error boundry error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorWithRetry text="Something went wrong." />;
    }

    return this.props.children;
  }
}
