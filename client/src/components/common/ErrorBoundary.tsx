import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-6">
          <div className="glass-card max-w-lg w-full p-8 text-center border-red-200 dark:border-red-900/50 bg-white/80 dark:bg-dark-800/80 shadow-2xl shadow-red-500/10">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Application Error
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Something went wrong while rendering this page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-dark-700 rounded-lg text-left overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-300">
                <p className="font-bold text-red-600 dark:text-red-400 mb-2">{this.state.error.toString()}</p>
                <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-primary flex items-center justify-center gap-2 py-2.5"
              >
                <RefreshCw size={18} /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-secondary flex items-center justify-center gap-2 py-2.5"
              >
                <Home size={18} /> Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
