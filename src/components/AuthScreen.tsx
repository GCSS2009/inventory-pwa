// src/components/AuthScreen.tsx
import React from "react";

interface AuthScreenProps {
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  authError: string | null;
  authLoading: boolean;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  handleLogin,
  authError,
  authLoading,
}) => {
  const cardStyle: React.CSSProperties = {
    background: "var(--gcss-surface)",
    padding: "1.75rem 2.25rem",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
    minWidth: 320,
    maxWidth: 380,
    border: "1px solid var(--gcss-border, #1f2933)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    marginBottom: "0.2rem",
    fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.6rem",
    borderRadius: 4,
    border: "1px solid var(--gcss-border, #4b5563)",
    background: "var(--gcss-bg)",
    color: "var(--gcss-text)",
    fontSize: "0.9rem",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--gcss-bg)",
        color: "var(--gcss-text)",
        fontFamily:
          '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
      }}
    >
      <form onSubmit={handleLogin} style={cardStyle}>
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 650,
              letterSpacing: "0.02em",
            }}
          >
            GCSS Technician
          </h2>
          <div
            style={{
              marginTop: "0.25rem",
              fontSize: "0.8rem",
              color: "#9ca3af",
            }}
          >
            Sign in with your company credentials.
          </div>
        </div>

        {authError && (
          <div
            style={{
              marginBottom: "0.9rem",
              padding: "0.5rem 0.6rem",
              borderRadius: 4,
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.6)",
              color: "#fecaca",
              fontSize: "0.8rem",
            }}
          >
            {authError}
          </div>
        )}

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={labelStyle} htmlFor="gcss-email">
            Email
          </label>
          <input
            id="gcss-email"
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle} htmlFor="gcss-password">
            Password
          </label>
          <input
            id="gcss-password"
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={authLoading}
          style={{
            width: "100%",
            padding: "0.55rem 0.75rem",
            borderRadius: 4,
            border: "none",
            background: authLoading ? "#4b5563" : "#0062ff",
            color: "white",
            cursor: authLoading ? "default" : "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
            transition: "background 0.15s ease, transform 0.05s ease",
          }}
        >
          {authLoading ? "Logging in…" : "Login"}
        </button>

        <div
          style={{
            marginTop: "0.6rem",
            fontSize: "0.7rem",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Access restricted to Gulf Coast Special Systems personnel.
        </div>
      </form>
    </div>
  );
};

export default AuthScreen;
