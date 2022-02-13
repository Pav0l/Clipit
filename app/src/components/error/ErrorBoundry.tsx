import React, { ErrorInfo } from "react";
import { SentryClient } from "../../lib/sentry/sentry.client";
import ErrorWithRetry from "./Error";

interface Params {
  sentry: SentryClient;
}

export default class ErrorBoundary extends React.Component<Params, { hasError: boolean }> {
  constructor(props: Params) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ hasError: true });
    console.log("[LOG]:error boundry error:", error);
    console.log("[LOG]:error boundry error info:", errorInfo);
    this.props.sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorWithRetry text="Something went wrong." />;
    }

    return this.props.children;
  }
}
