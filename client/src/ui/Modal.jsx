import React, { useEffect } from "react";
import ReactDOM from "react-dom";

/**
 * Accessible modal rendered in a portal. Closes on backdrop click and Escape.
 * `title` + optional header actions render a sticky X-style header.
 */
export default function Modal({ open, onClose, children, title, maxWidth = 600, headerRight }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-overlay)",
        zIndex: "var(--z-modal)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "5vh",
        overflowY: "auto",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: "var(--bg)",
          width: `min(${maxWidth}px, 95vw)`,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {(title || headerRight) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              position: "sticky",
              top: 0,
              background: "var(--header-bg)",
              backdropFilter: "var(--header-blur)",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                fontSize: 20,
                cursor: "pointer",
                width: 34,
                height: 34,
                borderRadius: "50%",
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, flex: 1 }}>{title}</h2>
            {headerRight}
          </div>
        )}
        <div style={{ overflowY: "auto" }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
