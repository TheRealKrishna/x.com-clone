import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ClickAwayListener from "react-click-away-listener";

import Styles from "../../../css/Home/Components/Menu.module.css";
import logo from "../../../Images/logo.svg";
import Home from "../../../Images/Home/Home.svg";
import HomeSolid from "../../../Images/Home/HomeSolid.svg";
import Explore from "../../../Images/Home/Explore.svg";
import Notifications from "../../../Images/Home/Notifications.svg";
import MessagesIcon from "../../../Images/Home/Messages.svg";
import MessagesSolid from "../../../Images/Home/MessagesSolid.svg";
import More from "../../../Images/Home/More.svg";
import Premium from "../../../Images/Home/Premium.svg";
import ProfileIcon from "../../../Images/Home/Profile.svg";
import ProfileSolid from "../../../Images/Home/ProfileSolid.svg";
import Communities from "../../../Images/Home/Communities.svg";
import Lists from "../../../Images/Home/Lists.svg";
import Bookmark from "../../../Images/Home/Posts/Bookmark.svg";
import dropDownArrow from "../../../Images/Home/DropDownArrow.svg";
import { notificationApi } from "../../../api";
import { clearToken } from "../../../api/config";

// One nav row. Uses NavLink so the active route styles itself — no pathname sniffing.
function NavItem({ to, icon, activeIcon, label, badge, end }) {
  return (
    <NavLink to={to} end={end} className={Styles.menuListLink}>
      {({ isActive }) => (
        <li className={Styles.menuList}>
          <div className={Styles.menuListItem}>
            <div style={{ position: "relative" }}>
              <img src={isActive && activeIcon ? activeIcon : icon} className={Styles.icon} alt={label} />
              {badge > 0 && <span className={Styles.badge}>{badge > 99 ? "99+" : badge}</span>}
            </div>
            <p style={{ fontWeight: isActive ? "bold" : "" }} className={Styles.menuListItemText}>
              {label}
            </p>
          </div>
        </li>
      )}
    </NavLink>
  );
}

export default function Menu({ user, realtime }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationApi.unreadCount().then((json) => json.success && setUnread(json.unreadCount));
  }, []);

  // Bump the badge live when notifications arrive.
  useEffect(() => {
    if (!realtime) return undefined;
    return realtime.on("notification", () => setUnread((n) => n + 1));
  }, [realtime]);

  const handleLogout = () => navigate("/logout");

  const focusComposer = () => {
    if (window.location.pathname === "/home") {
      document.getElementById("postTextInput")?.focus();
    } else {
      navigate("/home");
    }
  };

  return (
    <div className={Styles.menuContainer}>
      <ul className={Styles.menu}>
        <Link to="/home">
          <img src={logo} className={Styles.logo} alt="x.com Logo" />
        </Link>
        <NavItem to="/home" icon={Home} activeIcon={HomeSolid} label="Home" end />
        <NavItem to="/explore" icon={Explore} label="Explore" />
        <NavItem to="/notifications" icon={Notifications} label="Notifications" badge={unread} />
        <NavItem to="/messages" icon={MessagesIcon} activeIcon={MessagesSolid} label="Messages" />
        <NavItem to="/bookmarks" icon={Bookmark} label="Bookmarks" />
        <NavItem to="/home" icon={Lists} label="Lists" />
        <NavItem to="/home" icon={Communities} label="Communities" />
        <NavItem to="/home" icon={Premium} label="Premium" />
        <NavItem to={`/${user.username}`} icon={ProfileIcon} activeIcon={ProfileSolid} label="Profile" />
        <NavItem to="/home" icon={More} label="More" />

        <Link to="/home" className={Styles.menuPostButtonWithIcon}>
          <button onClick={focusComposer} className={`${Styles.postButton} btn btn-primary rounded-pill`}>
            +
          </button>
        </Link>
        <Link to="/home" className={Styles.menuPostButtonWithText}>
          <button onClick={focusComposer} className={`${Styles.postButton} btn btn-primary rounded-pill`}>
            Post
          </button>
        </Link>
      </ul>

      {menuOpen && (
        <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
          <div className={Styles.profileBoxContainer} style={{ display: "block" }}>
            <div className={Styles.profileBox}>
              <li className={Styles.profileBoxOption} onClick={handleLogout}>
                Log out @{user.username}
              </li>
            </div>
            <div className={Styles.profileMenuArrowContainer}>
              <img src={dropDownArrow} className={Styles.profileMenuArrow} alt="" />
            </div>
          </div>
        </ClickAwayListener>
      )}

      <div onClick={() => setMenuOpen((v) => !v)} className={Styles.profileContainer}>
        <div className={Styles.profileImageContainer}>
          <img src={user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
        </div>
        <div className={Styles.profileNamesContainer}>
          <p className={Styles.profileName}>{user.name}</p>
          <p className={Styles.profileUsername}>@{user.username}</p>
        </div>
        <div className={Styles.threeDotsContainer}>
          <i className={`fa-solid fa-ellipsis ${Styles.threeDots}`} />
        </div>
      </div>
    </div>
  );
}
