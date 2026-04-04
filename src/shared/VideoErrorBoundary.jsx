import { Component } from 'react';
import PropTypes from 'prop-types';

// Sentry integration for error tracking (lazy loaded, optional)
let SentryModule = null;

const initSentry = async () => {
    if (typeof window === 'undefined' || !import.meta.env.VITE_SENTRY_DSN) {
        return;
    }
    try {
        SentryModule = await import('@sentry/react');
        SentryModule.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.VITE_ENV || 'development',
            release: import.meta.env.VITE_APP_VERSION,
        });
    } catch {
        // Sentry not available, continue without it
        SentryModule = null;
    }
};

// Initialize Sentry on first import (non-blocking)
initSentry();

/**
 * Error Boundary for VideoPlayer and other media components.
 * Catches JavaScript errors in children and displays fallback UI.
 * Integrates with Sentry for error reporting when available.
 */
class VideoErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('VideoPlayer Error Boundary caught an error:', error, errorInfo);

        // Report to Sentry if available
        if (SentryModule) {
            SentryModule.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
                tags: {
                    component: 'VideoPlayer',
                },
            });
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="playerBox relative w-full aspect-video bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center text-white">
                    <p>Видео ойнотууда ката кетти.</p>
                    <p className="text-sm text-gray-400 mt-2">{this.state.error?.message}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
                        onClick={this.handleReset}
                    >
                        Кайра аракет кылуу
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

VideoErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default VideoErrorBoundary;
