import React from "react";

/**
 * Centered loading spinner. `inline` renders without the full-height wrapper.
 */
export default function Spinner({ size = 30, inline = false }) {
  const ring = (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `${Math.max(2, size / 12)}px solid var(--border)`,
        borderTopColor: "var(--x-blue)",
        borderRadius: "50%",
        animation: "x-spin 0.8s linear infinite",
      }}
    />
  );
  if (inline) return ring;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "32px 0" }}>
      {ring}
    </div>
  );
}
