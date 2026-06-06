import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Sticky, blurred screen header — the bar at the top of feed/profile/etc.
 * Optional back button, title, subtitle, and right-aligned content.
 */
export default function Header({ title, subtitle, showBack = false, onBack, right, children }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: "var(--z-header)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 16px",
        minHeight: 53,
        background: "var(--header-bg)",
        backdropFilter: "var(--header-blur)",
        WebkitBackdropFilter: "var(--header-blur)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {showBack && (
        <button
          onClick={onBack || (() => navigate(-1))}
          aria-label="Back"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontSize: 20,
            cursor: "pointer",
            width: 34,
            height: 34,
            borderRadius: "50%",
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-arrow-left" />
        </button>
      )}
      {(title || subtitle) && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{title}</h1>}
          {subtitle && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{subtitle}</p>}
        </div>
      )}
      {children}
      {right}
    </div>
  );
}
