import React from 'react';
import * as Sentry from '@sentry/react';
import PageNotFound from './pages/PageNotFound';

// eslint-disable-next-line import/prefer-default-export
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Provide a more descriptive Sentry breadcrumb
    Sentry.addBreadcrumb({
      category: 'ErrorBoundary',
      message: `Render crash detected: ${error?.message}`,
      level: 'error'
    });

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Send exception to sentry
    Sentry.withScope((scope) => {
      scope.setTag('Caught-at', 'Error Boundary');
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  componentDidUpdate(prevProps) {
    // Allow ErrorBoundary to recover when children change
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <PageNotFound />;
    }
    return this.props.children;
  }
}
