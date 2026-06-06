import React from "react";
import { Modal } from "../../../ui";
import Composer from "./Composer";

/**
 * Full-screen compose modal opened by the "Post" button anywhere in the app.
 */
export default function ComposeModal({ open, onClose, user, onPosted }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={600} title="">
      <div style={{ paddingTop: 8 }}>
        <Composer
          user={user}
          autoFocus
          onPosted={(post) => {
            onPosted?.(post);
            onClose?.();
          }}
        />
      </div>
    </Modal>
  );
}
