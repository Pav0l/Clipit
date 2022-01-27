import React from "react";
import ErrorWithRetry from "./Error";

export default class ErrorBoundary extends React.Component<Record<string, unknown>, { hasError: boolean }> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
    // SENTRY
  }

  render() {
    if (this.state.hasError) {
      return <ErrorWithRetry text="Something went wrong." />;
    }

    return this.props.children;
  }
}
