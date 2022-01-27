import React from "react";
import ErrorWithRetry from "./Error";

export default class ErrorBoundary extends React.Component<
  {},
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, errorInfo: any) {
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
