import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Modal, Avatar, Spinner } from "../../../ui";
import { exploreApi } from "../../../api";

/**
 * "New message" modal: search people and open a conversation with them.
 */
export default function NewMessageModal({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setUsers([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const j = await exploreApi.search(query.trim(), "users");
      setUsers(j.success ? j.users : []);
      setLoading(false);
    }, 300);
  }, [query]);

  return (
    <Modal open={open} onClose={onClose} title="New message" maxWidth={600}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--text-secondary)" }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 15, padding: "8px 0" }}
          />
        </div>
      </div>
      <div style={{ minHeight: 200 }}>
        {loading ? (
          <Spinner />
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                onClose?.();
                navigate(`/messages/${u._id}`);
              }}
              style={{ display: "flex", gap: 12, padding: "12px 16px", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Avatar src={u.profile} size="md" />
              <div>
                <p style={{ fontWeight: 700, margin: 0 }}>{u.name}</p>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>@{u.username}</p>
              </div>
            </div>
          ))
        )}
        {!loading && query.trim() && users.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: 24 }}>No people found.</p>
        )}
      </div>
    </Modal>
  );
}
