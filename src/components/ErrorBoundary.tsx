import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Optionally log error
  }

  render() {
    if (this.state.hasError) {
      return <div style={{padding: 32, textAlign: 'center', color: 'red'}}>
        <h2>Something went wrong.</h2>
        <p>Your browser extensions may be interfering with this app. Try disabling them for a better experience.</p>
      </div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 