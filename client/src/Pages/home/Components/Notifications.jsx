import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Header, Avatar, Spinner, EmptyState } from "../../../ui";
import { notificationApi } from "../../../api";
import { formatPostAge } from "../../../utils/format";

const ICON = {
  like: { className: "fa-solid fa-heart", color: "var(--like)" },
  follow: { className: "fa-solid fa-user", color: "var(--x-blue)" },
  reply: { className: "fa-solid fa-comment", color: "var(--x-blue)" },
  repost: { className: "fa-solid fa-retweet", color: "var(--repost)" },
  mention: { className: "fa-solid fa-at", color: "var(--x-blue)" },
};
const VERB = {
  like: "liked your post",
  follow: "followed you",
  reply: "replied to your post",
  repost: "reposted your post",
  mention: "mentioned you",
};

export default function Notifications({ realtime }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  const load = async () => {
    const j = await notificationApi.get();
    setItems(j.success ? j.notifications : []);
  };

  useEffect(() => {
    document.title = "Notifications / X";
    load();
    notificationApi.markAllRead();
  }, []);

  useEffect(() => {
    if (!realtime) return undefined;
    return realtime.on("notification", (n) => setItems((prev) => [n, ...(prev || [])]));
  }, [realtime]);

  return (
    <div style={{ minHeight: "100vh", borderRight: "1px solid var(--border)" }}>
      <Header title="Notifications" />
      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing to see here — yet"
          subtitle="From likes to reposts and a whole lot more, this is where all the action happens."
        />
      ) : (
        items.map((n) => {
          const icon = ICON[n.type] || ICON.like;
          const actor = n.actor || {};
          const go = () => (n.post ? navigate(`/status/${n.post._id || n.post}`) : navigate(`/${actor.username}`));
          return (
            <div
              key={n._id}
              onClick={go}
              style={{
                display: "flex",
                gap: 16,
                padding: "16px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: n.read ? "transparent" : "rgba(29,155,240,0.06)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(29,155,240,0.06)")}
            >
              <i className={icon.className} style={{ color: icon.color, fontSize: 24, width: 28, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Avatar src={actor.profile} size="sm" username={actor.username} />
                <p style={{ margin: "6px 0 0", fontSize: 15 }}>
                  <Link to={`/${actor.username}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 700 }}>
                    {actor.name}
                  </Link>{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    {VERB[n.type]} · {formatPostAge(n.createdAt)}
                  </span>
                </p>
                {n.post?.message && <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>{n.post.message}</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
