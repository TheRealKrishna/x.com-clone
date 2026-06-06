import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import Styles from "../../../css/Home/Components/MobileMenu.module.css";
import { notificationApi } from "../../../api";

const ITEMS = [
  { to: "/home", icon: "fa-house", end: true },
  { to: "/explore", icon: "fa-magnifying-glass" },
  { to: "/notifications", icon: "fa-bell", key: "notifications" },
  { to: "/messages", icon: "fa-envelope" },
  { to: "/bookmarks", icon: "fa-bookmark" },
];

/**
 * Bottom tab bar + floating compose button for small screens.
 */
export default function MobileMenu({ onCompose }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi.unreadCount().then((j) => j.success && setUnread(j.unreadCount));
  }, []);

  return (
    <>
      <nav className={Styles.bar}>
        {ITEMS.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={Styles.item}>
            {({ isActive }) => (
              <>
                <i className={`fa-solid ${it.icon}`} style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }} />
                {it.key === "notifications" && unread > 0 && (
                  <span className={Styles.badge}>{unread > 99 ? "99+" : unread}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <button className={Styles.fab} onClick={onCompose} aria-label="Post">
        <i className="fa-solid fa-feather" />
      </button>
    </>
  );
}
