import React from "react";
import { useNavigate } from "react-router-dom";

import { ConfirmDialog } from "../ui";
import { clearToken } from "../api/config";

/**
 * Log-out confirmation. Rendered as a route so /logout is shareable; cancelling
 * returns to home.
 */
export default function Logout() {
  const navigate = useNavigate();

  const confirm = () => {
    clearToken();
    navigate("/");
  };

  return (
    <ConfirmDialog
      open
      title="Log out of X?"
      message="You can always log back in at any time."
      confirmLabel="Log out"
      danger={false}
      onConfirm={confirm}
      onClose={() => navigate(-1)}
    />
  );
}
