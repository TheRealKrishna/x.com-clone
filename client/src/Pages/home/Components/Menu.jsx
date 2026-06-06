import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ClickAwayListener from "react-click-away-listener";

import Styles from "../../../css/Home/Components/Menu.module.css";
import logo from "../../../Images/logo.svg";
import { notificationApi } from "../../../api";
import { Avatar } from "../../../ui";

// Single source of truth for the nav. Every item routes to a real screen.
const NAV = [
  { to: "/home", icon: "fa-house", label: "Home", end: true },
  { to: "/explore", icon: "fa-magnifying-glass", label: "Explore" },
  { to: "/notifications", icon: "fa-bell", label: "Notifications", key: "notifications" },
  { to: "/messages", icon: "fa-envelope", label: "Messages" },
  { to: "/bookmarks", icon: "fa-bookmark", label: "Bookmarks" },
  { to: "/lists", icon: "fa-list", label: "Lists" },
  { to: "/communities", icon: "fa-user-group", label: "Communities" },
  { to: "/premium", icon: "fa-x", label: "Premium" },
  { to: "/profile", icon: "fa-user", label: "Profile", profile: true },
  { to: "/more", icon: "fa-ellipsis", label: "More" },
];

export default function Menu({ user, realtime, onCompose }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi.unreadCount().then((j) => j.success && setUnread(j.unreadCount));
  }, []);

  useEffect(() => {
    if (!realtime) return undefined;
    return realtime.on("notification", () => setUnread((n) => n + 1));
  }, [realtime]);

  return (
    <nav className={Styles.menuContainer}>
      <Link to="/home" className={Styles.logoLink} aria-label="Home">
        <img src={logo} className={Styles.logo} alt="X" />
      </Link>

      <ul className={Styles.nav}>
        {NAV.map((item) => {
          const to = item.profile ? `/${user.username}` : item.to;
          const showBadge = item.key === "notifications" && unread > 0;
          return (
            <li key={item.label}>
              <NavLink
                to={to}
                end={item.end}
                className={Styles.navLink}
                onClick={() => item.key === "notifications" && setUnread(0)}
              >
                {({ isActive }) => (
                  <div className={`${Styles.navItem} ${isActive ? Styles.navActive : ""}`}>
                    <span className={Styles.iconWrap}>
                      <i className={`fa-solid ${item.icon} ${Styles.faIcon}`} />
                      {showBadge && <span className={Styles.badge}>{unread > 99 ? "99+" : unread}</span>}
                    </span>
                    <span className={Styles.label}>{item.label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          );
        })}

        <button className={Styles.postButton} onClick={onCompose}>
          Post
        </button>
        <button className={Styles.postButtonIcon} onClick={onCompose} aria-label="Post">
          <i className="fa-solid fa-feather" />
        </button>
      </ul>

      <div style={{ position: "relative" }}>
        {menuOpen && (
          <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
            <div className={Styles.popover}>
              <li className={Styles.popoverItem} onClick={() => navigate("/logout")}>
                Log out @{user.username}
              </li>
            </div>
          </ClickAwayListener>
        )}
        <div className={Styles.profileChip} onClick={() => setMenuOpen((v) => !v)}>
          <Avatar src={user.profile} size="md" />
          <div className={Styles.profileNames}>
            <p className={Styles.profileName}>{user.name}</p>
            <p className={Styles.profileUsername}>@{user.username}</p>
          </div>
          <i className={`fa-solid fa-ellipsis ${Styles.menuChevron}`} />
        </div>
      </div>
    </nav>
  );
}
