import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Spinner from "../../../Components/Spinner";
import { notificationApi } from "../../../api";
import { formatPostAge } from "../../../utils/format";
import Styles from "../../../css/Home/Components/Feature.module.css";

const ICON = {
  like: { className: "fa-solid fa-heart", color: "rgb(249,24,128)" },
  follow: { className: "fa-solid fa-user", color: "rgb(29,155,240)" },
  reply: { className: "fa-solid fa-comment", color: "rgb(29,155,240)" },
  repost: { className: "fa-solid fa-retweet", color: "rgb(0,186,124)" },
  mention: { className: "fa-solid fa-at", color: "rgb(29,155,240)" },
};

const verb = {
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
    const json = await notificationApi.get();
    if (json.success) setItems(json.notifications);
    else setItems([]);
  };

  useEffect(() => {
    document.title = "Notifications / X";
    load();
    notificationApi.markAllRead();
  }, []);

  // Live-prepend incoming notifications.
  useEffect(() => {
    if (!realtime) return undefined;
    return realtime.on("notification", (notif) => {
      setItems((prev) => [notif, ...(prev || [])]);
    });
  }, [realtime]);

  if (items === null) return <Spinner />;

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <h2 className={Styles.sectionTitle} style={{ padding: 0 }}>Notifications</h2>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgb(113,118,123)" }}>
          Nothing to see here — yet. When someone interacts with you, it’ll show up here.
        </div>
      ) : (
        items.map((n) => {
          const icon = ICON[n.type] || ICON.like;
          const actor = n.actor || {};
          const go = () => (n.post ? navigate(`/status/${n.post._id || n.post}`) : navigate(`/${actor.username}`));
          return (
            <div key={n._id} className={Styles.notifRow} onClick={go} style={{ background: n.read ? undefined : "rgba(29,155,240,0.08)" }}>
              <i className={icon.className} style={{ color: icon.color, fontSize: 22, width: 30 }} />
              <div style={{ flex: 1 }}>
                <img src={actor.profile} alt="" referrerPolicy="no-referrer" className={Styles.avatarSmall} />
                <p className={Styles.notifText}>
                  <Link to={`/${actor.username}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 700, color: "white" }}>
                    {actor.name}
                  </Link>{" "}
                  {verb[n.type]} · <span className={Styles.muted}>{formatPostAge(n.createdAt)}</span>
                </p>
                {n.post?.message && <p className={Styles.muted}>{n.post.message}</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
