"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { Button } from './Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetOnPropsChange?: boolean;
    resetKeys?: Array<string | number>;
    componentName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
    resetCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private resetTimeoutId: number | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            resetCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Generate a unique error ID for tracking
        const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            hasError: true,
            error,
            errorId,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        
        // Log error details
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error Info:', errorInfo);
        
        // Store error information for potential bug reporting
        const errorData = {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            errorInfo: {
                componentStack: errorInfo.componentStack,
            },
            componentName: this.props.componentName,
            timestamp: new Date().toISOString(),
            errorId: this.state.errorId,
            userAgent: navigator.userAgent,
            url: window.location.href,
        };
        
        // Store in localStorage for potential bug reporting
        try {
            const existingErrors = JSON.parse(localStorage.getItem('shareplay_error_logs') || '[]');
            existingErrors.push(errorData);
            // Keep only last 10 errors
            localStorage.setItem('shareplay_error_logs', JSON.stringify(existingErrors.slice(-10)));
        } catch (e) {
            console.warn('Failed to store error log:', e);
        }
        
        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        const { resetKeys, resetOnPropsChange } = this.props;
        const { hasError } = this.state;
        
        // Auto-reset on prop changes if enabled
        if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
            this.resetErrorBoundary();
        }
        
        // Auto-reset on resetKeys change
        if (hasError && resetKeys && prevProps.resetKeys) {
            const hasResetKeyChanged = resetKeys.some((key, idx) => 
                prevProps.resetKeys?.[idx] !== key
            );
            if (hasResetKeyChanged) {
                this.resetErrorBoundary();
            }
        }
    }

    resetErrorBoundary = () => {
        if (this.resetTimeoutId) {
            window.clearTimeout(this.resetTimeoutId);
        }
        
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            resetCount: prevState.resetCount + 1,
        }));
    };

    handleRetry = () => {
        this.resetErrorBoundary();
    };

    handleReload = () => {
        window.location.reload();
    };

    handleReportBug = () => {
        // If bug reporter is available, trigger it with error context
        const event = new CustomEvent('shareplay:open-bug-reporter', {
            detail: {
                trigger: 'error',
                errorInfo: {
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                    componentName: this.props.componentName,
                    errorId: this.state.errorId,
                },
            },
        });
        window.dispatchEvent(event);
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className={styles.errorBoundary}>
                    <div className={styles.errorContent}>
                        <div className={styles.errorIcon}>
                            <AlertTriangle size={48} />
                        </div>
                        
                        <div className={styles.errorMessage}>
                            <h2>Something went wrong</h2>
                            <p>
                                {this.props.componentName 
                                    ? `An error occurred in the ${this.props.componentName} component.`
                                    : 'An unexpected error occurred.'
                                }
                            </p>
                            
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className={styles.errorDetails}>
                                    <summary>Error Details (Development)</summary>
                                    <div className={styles.errorStack}>
                                        <strong>{this.state.error.name}:</strong> {this.state.error.message}
                                        <br />
                                        <pre>{this.state.error.stack}</pre>
                                        {this.state.errorInfo && (
                                            <>
                                                <br />
                                                <strong>Component Stack:</strong>
                                                <pre>{this.state.errorInfo.componentStack}</pre>
                                            </>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                        
                        <div className={styles.errorActions}>
                            <Button 
                                onClick={this.handleRetry}
                                variant="primary"
                                className={styles.actionButton}
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </Button>
                            
                            <Button 
                                onClick={this.handleReload}
                                variant="outline"
                                className={styles.actionButton}
                            >
                                Reload Page
                            </Button>
                            
                            <Button 
                                onClick={this.handleReportBug}
                                variant="outline"
                                className={styles.actionButton}
                            >
                                <Bug size={16} />
                                Report Bug
                            </Button>
                        </div>
                        
                        <div className={styles.errorMeta}>
                            <small>Error ID: {this.state.errorId}</small>
                            {this.state.resetCount > 0 && (
                                <small>Retry attempts: {this.state.resetCount}</small>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary 
            {...errorBoundaryProps}
            componentName={errorBoundaryProps?.componentName || Component.displayName || Component.name}
        >
            <Component {...props} />
        </ErrorBoundary>
    );
    
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorHandler() {
    return (error: Error, errorInfo?: Partial<ErrorInfo>) => {
        // Manual error reporting
        const errorData = {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            errorInfo: errorInfo || {},
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            manual: true,
        };
        
        console.error('Manual error report:', error);
        
        try {
            const existingErrors = JSON.parse(localStorage.getItem('shareplay_error_logs') || '[]');
            existingErrors.push(errorData);
            localStorage.setItem('shareplay_error_logs', JSON.stringify(existingErrors.slice(-10)));
        } catch (e) {
            console.warn('Failed to store manual error log:', e);
        }
    };
}

export default ErrorBoundary;