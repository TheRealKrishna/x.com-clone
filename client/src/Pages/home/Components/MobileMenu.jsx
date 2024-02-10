import React, { useEffect, useRef } from 'react'
import Styles from "../../../css/Home/Components/MobileMenu.module.css"
import Home from "../../../Images/Home/Home.svg"
import HomeSolid from "../../../Images/Home/HomeSolid.svg"
import Profile from "../../../Images/Home/Profile.svg"
import ProfileSolid from "../../../Images/Home/ProfileSolid.svg"
import dropDownArrow from "../../../Images/Home/DropDownArrow.svg"
import Messages from "../../../Images/Home/Messages.svg"
import MessagesSolid from "../../../Images/Home/MessagesSolid.svg"
import { Link, useNavigate } from 'react-router-dom'

export default function MobileMenu(props) {
  const navigate = useNavigate();
  const profileBox = useRef()
  const profileMenu = useRef()

  const handleLogout = () => {
    navigate("/logout")
  }

  useEffect(() => {
    function handleClick(event) {
      if (!profileMenu.current.style.display === 'none') {
        profileMenu.current.style.display = 'none';
      }
    }
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [])

  function toogleProfileMenu() {
    if (profileMenu.current.style.display === 'none') {
      const buttonRect = profileBox.current.getBoundingClientRect();
      profileMenu.current.style.left = buttonRect.left + 'px';
      profileMenu.current.style.top = buttonRect.top - 120 - 10 + 'px';
      profileMenu.current.style.display = 'block';
    }
    else {
      profileMenu.current.style.display = 'none';
    }
  }

  return (
    <React.Fragment style={{ overflow: "hidden" }}>
      <div className={Styles.mobileMenuContainer}>
        <Link to={"/home"}>
          <li className={Styles.menuList}>
            <div className={Styles.menuListItem}>
              <img src={window.location.pathname === "/home" ? HomeSolid : Home} className={Styles.icon} alt="Home" />
            </div>
          </li>
        </Link>
        <Link to={"/messages"}>
          <li className={Styles.menuList}>
            <div className={Styles.menuListItem}>
              <img src={window.location.pathname === "/messages" ? MessagesSolid : Messages} className={Styles.icon} alt="Home" />
            </div>
          </li>
        </Link>
        <Link to={`/${props.user.username}`}>
          <li className={Styles.menuList}>
            <div className={Styles.menuListItem}>
              <img src={window.location.pathname === `/${props.user.username}` ? ProfileSolid : Profile} className={Styles.icon} alt={props.user.username} />
            </div>
          </li>
        </Link>
        <div>
          <div ref={profileBox} onClick={toogleProfileMenu} className={Styles.profileContainer}>
            <div className={Styles.profileImageContainer}>
              <img src={props.user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
            </div>
          </div>
        </div>
      </div >
      <div ref={profileMenu} style={{ display: "none" }} className={Styles.profileBoxContainer}>
        <div className={Styles.profileBox}>
          <li className={Styles.profileBoxOption}>Add an existing account</li>
          <li onClick={handleLogout} className={Styles.profileBoxOption}>Log out @{props.user.username}</li>
        </div>
        <div className={Styles.profileMenuArrowContainer}>
          <img src={dropDownArrow} className={Styles.profileMenuArrow} alt="" />
        </div>
      </div>
    </React.Fragment>
  )
}
