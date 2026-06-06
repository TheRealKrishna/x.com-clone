import React, { useState } from "react";
import ClickAwayListener from "react-click-away-listener";

import Styles from "../../../css/Home/Components/Home.module.css";
import { postApi } from "../../../api";
import { notify } from "../../../utils/toast";
import { formatPostAge } from "../../../utils/format";

const MAX_CHARS = 280;

/**
 * Modal composer for replying to a post. Renders the parent post for context,
 * then a textarea + Reply button.
 */
export default function ReplyModal({ post, user, onClose, onReplied }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sender = post.sender || {};

  const submit = async () => {
    if (message.trim().length === 0 || submitting) return;
    setSubmitting(true);
    const res = await postApi.reply(post._id, { message: message.trim(), images: [] });
    setSubmitting(false);
    if (res.success) onReplied?.(res.post);
    else notify(res.error || "Could not reply.");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(91,112,131,0.4)",
        zIndex: 1050,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "5vh",
      }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <div
          style={{
            background: "black",
            width: "min(600px, 95vw)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgb(47,51,54)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <i className="fa-solid fa-xmark" onClick={onClose} style={{ cursor: "pointer", color: "white", fontSize: 20 }} />
          </div>

          {/* Parent post context */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <img src={sender.profile} alt="" referrerPolicy="no-referrer" style={{ width: 44, height: 44, borderRadius: "50%" }} />
            <div style={{ color: "white" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <b>{sender.name}</b>
                <span style={{ color: "rgb(113,118,123)" }}>@{sender.username} · {formatPostAge(post.createdAt)}</span>
              </div>
              <div style={{ marginTop: 2 }}>{post.message}</div>
              <div style={{ color: "rgb(113,118,123)", marginTop: 12, fontSize: 15 }}>
                Replying to <span style={{ color: "rgb(29,155,240)" }}>@{sender.username}</span>
              </div>
            </div>
          </div>

          {/* Composer */}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <img src={user.profile} alt="" referrerPolicy="no-referrer" style={{ width: 44, height: 44, borderRadius: "50%" }} />
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Post your reply"
              rows={3}
              maxLength={MAX_CHARS}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: 20,
                resize: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              className={`btn btn-primary rounded-pill ${Styles.postButton}`}
              disabled={message.trim().length === 0 || submitting}
              onClick={submit}
            >
              Reply
            </button>
          </div>
        </div>
      </ClickAwayListener>
    </div>
  );
}
