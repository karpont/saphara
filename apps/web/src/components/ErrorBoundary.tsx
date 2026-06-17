"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="eb-wrap">
        <div className="eb-icon">⚠️</div>
        <h2 className="eb-title">Something went wrong</h2>
        <p className="eb-msg">{this.state.message}</p>
        <button className="eb-btn" onClick={this.reset}>Try again</button>

        <style>{`
          .eb-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            text-align: center;
            gap: 12px;
          }
          .eb-icon { font-size: 40px; }
          .eb-title { font-size: 20px; font-weight: 700; }
          .eb-msg { font-size: 14px; color: var(--muted); max-width: 360px; line-height: 1.6; }
          .eb-btn {
            margin-top: 8px;
            padding: 10px 24px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: var(--surface-2);
            color: var(--text);
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.15s;
          }
          .eb-btn:hover { background: var(--surface); }
        `}</style>
      </div>
    );
  }
}
