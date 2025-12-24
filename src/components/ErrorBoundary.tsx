/*
 * ============================================================================
 * ERROR BOUNDARY - Catches React errors and shows fallback UI
 * ============================================================================
 *
 * PURPOSE:
 * Prevents the entire app from crashing when a component throws an error.
 * Instead, it catches the error and shows a friendly error message to the user.
 *
 * WHY THIS MATTERS:
 * Without an Error Boundary:
 * - Any error in any component crashes the ENTIRE app
 * - User sees a blank white screen (terrible experience!)
 * - No way to recover without refreshing the page
 *
 * With an Error Boundary:
 * - Errors are caught gracefully
 * - User sees a friendly error message
 * - App can continue working (other parts still function)
 * - Error is logged for debugging
 *
 * REAL-WORLD ANALOGY:
 * Think of it like airbags in a car:
 * - WITHOUT: Small collision = total disaster
 * - WITH: Small collision = airbag deploys, you're safe
 *
 * USAGE:
 * Wrap any component that might fail:
 * <ErrorBoundary>
 *   <GameComponent />
 * </ErrorBoundary>
 *
 * If GameComponent crashes, users see an error message instead of a blank screen.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props that the ErrorBoundary component accepts
 */
interface ErrorBoundaryProps {
  children: ReactNode; // The components to protect
  fallback?: ReactNode; // Optional custom error message
}

/**
 * State that the ErrorBoundary maintains
 */
interface ErrorBoundaryState {
  hasError: boolean; // Whether an error has been caught
  error: Error | null; // The actual error that was thrown
  errorInfo: ErrorInfo | null; // Additional React error information
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

/**
 * Error Boundary Component
 *
 * This is a class component (not a function component) because React requires
 * Error Boundaries to be class components. Only class components can use the
 * special lifecycle methods: componentDidCatch() and getDerivedStateFromError()
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /*
   * CONSTRUCTOR - Initialize the component state
   *
   * Start with no error (everything is fine initially)
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false, // No error yet
      error: null, // No error object yet
      errorInfo: null, // No error details yet
    };
  }

  /*
   * GET DERIVED STATE FROM ERROR - Update state when error occurs
   *
   * This is a static method that React calls when an error is thrown.
   * It returns new state to indicate an error has occurred.
   *
   * Parameters:
   * - error: The error that was thrown
   *
   * Returns: Updated state with hasError set to true
   *
   * Note: This is called during the "render" phase, so we can't do side effects here
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to show error UI on next render
    return {
      hasError: true,
      error: error,
    };
  }

  /*
   * COMPONENT DID CATCH - Handle the error after it's caught
   *
   * This is called during the "commit" phase, so we can do side effects here
   * like logging the error to an error reporting service.
   *
   * Parameters:
   * - error: The error that was thrown
   * - errorInfo: Additional React-specific error information (component stack trace)
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // LOG THE ERROR
    // In production, you would send this to an error tracking service like:
    // - Sentry (https://sentry.io)
    // - Rollbar (https://rollbar.com)
    // - LogRocket (https://logrocket.com)
    console.error("Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);

    // UPDATE STATE with error details
    // This allows us to show error information in the UI
    this.setState({
      errorInfo: errorInfo,
    });

    // TODO: Send error to error tracking service
    // Example with Sentry:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  /*
   * RESET ERROR - Allow user to try again
   *
   * This method resets the error state, allowing the user to try again.
   * It's called when the user clicks the "Try Again" button.
   */
  private resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /*
   * RENDER - Display either children or error UI
   *
   * If there's an error, show the error UI.
   * If no error, render the children normally.
   */
  render(): ReactNode {
    // CHECK: Has an error occurred?
    if (this.state.hasError) {
      // YES - Show error UI

      // If a custom fallback was provided, use that
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, show the default error UI
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
            margin: "1rem",
          }}
        >
          {/* ERROR ICON */}
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            ⚠️
          </div>

          {/* ERROR TITLE */}
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#991b1b",
              marginBottom: "0.5rem",
            }}
          >
            Oops! Something went wrong
          </h2>

          {/* ERROR MESSAGE */}
          <p
            style={{
              color: "#7f1d1d",
              marginBottom: "1rem",
            }}
          >
            We're sorry, but something unexpected happened.
            <br />
            Please try again or refresh the page.
          </p>

          {/* ERROR DETAILS (only shown in development) */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#fff",
                border: "1px solid #fecaca",
                borderRadius: "0.25rem",
                textAlign: "left",
                maxWidth: "600px",
                margin: "1rem auto",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#991b1b",
                }}
              >
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.875rem",
                  overflow: "auto",
                  color: "#7f1d1d",
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          {/* TRY AGAIN BUTTON */}
          <button
            onClick={this.resetError}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#b91c1c")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
          >
            Try Again
          </button>

          {/* REFRESH BUTTON */}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              marginLeft: "0.5rem",
              padding: "0.5rem 1.5rem",
              backgroundColor: "#fff",
              color: "#dc2626",
              border: "1px solid #dc2626",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#fef2f2")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // NO ERROR - Render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
