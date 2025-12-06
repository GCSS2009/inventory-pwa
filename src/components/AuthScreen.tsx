// src/components/AuthScreen.tsx
import React from "react";

interface AuthScreenProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gcss-bg, #020617)",
        color: "var(--gcss-text, #111827)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "1.75rem 1.9rem",
          borderRadius: 12,
          border: "1px solid var(--gcss-border, #e5e7eb)",
          background:
            "radial-gradient(circle at top, rgba(37,99,235,0.28), transparent 60%), var(--gcss-surface, #ffffff)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.4)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "0.75rem",
            fontSize: "1.35rem",
            fontWeight: 700,
          }}
        >
          GCSS Operations
        </h1>
        <p
          style={{
            margin: 0,
            marginBottom: "1.25rem",
            fontSize: "0.85rem",
            color: "var(--gcss-muted, #6b7280)",
          }}
        >
          Sign in with your GCSS credentials to continue.
        </p>

        {error && (
          <div
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.8rem",
              padding: "0.5rem 0.6rem",
              borderRadius: 6,
              background: "rgba(239,68,68,0.12)",
              color: "#fecaca",
              border: "1px solid rgba(239,68,68,0.6)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.8rem",
                marginBottom: "0.25rem",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.45rem 0.55rem",
                borderRadius: 6,
                border: "1px solid var(--gcss-border, #d1d5db)",
                background: "var(--gcss-surface, #ffffff)",
                color: "var(--gcss-text, #111827)",
                fontSize: "0.85rem",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.8rem",
                marginBottom: "0.25rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.45rem 0.55rem",
                borderRadius: 6,
                border: "1px solid var(--gcss-border, #d1d5db)",
                background: "var(--gcss-surface, #ffffff)",
                color: "var(--gcss-text, #111827)",
                fontSize: "0.85rem",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: 999,
              border: "none",
              background: loading
                ? "rgba(37,99,235,0.6)"
                : "var(--gcss-blue, #2563eb)",
              color: "#f9fafb",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: loading ? "default" : "pointer",
              transition: "background 0.15s ease, transform 0.1s ease",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
