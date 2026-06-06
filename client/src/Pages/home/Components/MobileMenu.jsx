import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ClickAwayListener from "react-click-away-listener";

import Styles from "../../../css/Home/Components/MobileMenu.module.css";
import Home from "../../../Images/Home/Home.svg";
import HomeSolid from "../../../Images/Home/HomeSolid.svg";
import ProfileIcon from "../../../Images/Home/Profile.svg";
import ProfileSolid from "../../../Images/Home/ProfileSolid.svg";
import dropDownArrow from "../../../Images/Home/DropDownArrow.svg";
import MessagesIcon from "../../../Images/Home/Messages.svg";
import MessagesSolid from "../../../Images/Home/MessagesSolid.svg";
import Explore from "../../../Images/Home/Explore.svg";
import Notifications from "../../../Images/Home/Notifications.svg";

function MobileNavItem({ to, icon, activeIcon, end }) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <li className={Styles.menuList}>
          <div className={Styles.menuListItem}>
            <img src={isActive && activeIcon ? activeIcon : icon} className={Styles.icon} alt="" />
          </div>
        </li>
      )}
    </NavLink>
  );
}

export default function MobileMenu({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={Styles.mobileMenuContainer}>
        <MobileNavItem to="/home" icon={Home} activeIcon={HomeSolid} end />
        <MobileNavItem to="/explore" icon={Explore} />
        <MobileNavItem to="/notifications" icon={Notifications} />
        <MobileNavItem to="/messages" icon={MessagesIcon} activeIcon={MessagesSolid} />
        <MobileNavItem to={`/${user.username}`} icon={ProfileIcon} activeIcon={ProfileSolid} />
        <div>
          <div onClick={() => setMenuOpen((v) => !v)} className={Styles.profileContainer}>
            <div className={Styles.profileImageContainer}>
              <img src={user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
          <div className={Styles.profileBoxContainer} style={{ display: "block" }}>
            <div className={Styles.profileBox}>
              <li className={Styles.profileBoxOption} onClick={() => navigate("/logout")}>
                Log out @{user.username}
              </li>
            </div>
            <div className={Styles.profileMenuArrowContainer}>
              <img src={dropDownArrow} className={Styles.profileMenuArrow} alt="" />
            </div>
          </div>
        </ClickAwayListener>
      )}
    </>
  );
}
