import React from "react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Confirmation dialog for destructive actions (e.g. delete post, log out).
 */
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", danger = true }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={320}>
      <div style={{ padding: "32px 32px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>{title}</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.4, margin: "0 0 24px" }}>{message}</p>
        <Button
          variant={danger ? "primary" : "secondary"}
          size="lg"
          onClick={onConfirm}
          style={danger ? { backgroundColor: "var(--danger)" } : undefined}
        >
          {confirmLabel}
        </Button>
        <div style={{ height: 12 }} />
        <Button variant="outline" size="lg" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
