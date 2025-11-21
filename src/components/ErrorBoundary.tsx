// src/components/ErrorBoundary.tsx
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback UI */
  fallback?: React.ReactNode;
  /** Optional error hook for logging, Sentry, etc. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  // React will call this when a child throws
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Optional hook for external logging
    if (this.props.onError) {
      this.props.onError(error, info);
    }

    // Still log to console for local debugging
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div
          style={{
            padding: "1rem 1.25rem",
            margin: "1rem",
            borderRadius: 6,
            border: "1px solid rgba(220,38,38,0.6)",
            background: "rgba(220,38,38,0.08)",
            color: "#fecaca",
            fontSize: "0.9rem",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            Something went wrong.
          </div>
          <div style={{ fontSize: "0.8rem", color: "#fca5a5" }}>
            Try refreshing the page. If this keeps happening, bother whoever
            wrote this.
          </div>
        </div>
      );
    }

    return children;
  }
}

