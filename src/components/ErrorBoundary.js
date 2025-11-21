import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ErrorBoundary.tsx
import React from "react";
export class ErrorBoundary extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
        };
    }
    // React will call this when a child throws
    static getDerivedStateFromError(_) {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
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
                return _jsx(_Fragment, { children: fallback });
            }
            return (_jsxs("div", { style: {
                    padding: "1rem 1.25rem",
                    margin: "1rem",
                    borderRadius: 6,
                    border: "1px solid rgba(220,38,38,0.6)",
                    background: "rgba(220,38,38,0.08)",
                    color: "#fecaca",
                    fontSize: "0.9rem",
                }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: "0.25rem" }, children: "Something went wrong." }), _jsx("div", { style: { fontSize: "0.8rem", color: "#fca5a5" }, children: "Try refreshing the page. If this keeps happening, bother whoever wrote this." })] }));
        }
        return children;
    }
}
