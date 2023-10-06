import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Styles from "../../../css/Home/Components/Menu.module.css"
import logo from "../../../Images/logo.svg"
import Home from "../../../Images/Home/Home.svg"
import Explore from "../../../Images/Home/Explore.svg"
import Notifications from "../../../Images/Home/Notifications.svg"
import Messages from "../../../Images/Home/Messages.svg"
import More from "../../../Images/Home/More.svg"
import Premium from "../../../Images/Home/Premium.svg"
import Profile from "../../../Images/Home/Profile.svg"
import Communities from "../../../Images/Home/Communities.svg"
import Lists from "../../../Images/Home/Lists.svg"
import dropDownArrow from "../../../Images/Home/DropDownArrow.svg"

export default function Menu(props) {
    const navigate = useNavigate();
    const profileBox = useRef()
    const profileMenu = useRef()
    const profileMenuArrow = useRef()

    useEffect(() => {
        
    }, [])

    const handleLogout = ()=>{
        navigate("/logout")
    }

    function toogleProfileMenu() {
        if(profileMenu.current.style.display === 'none'){
            const buttonRect = profileBox.current.getBoundingClientRect();
            profileMenu.current.style.left = buttonRect.left + 'px';
            profileMenu.current.style.top = buttonRect.top - 120 - 10 + 'px';
            profileMenu.current.style.display = 'block';
        }
        else{
            profileMenu.current.style.display = 'none';
        }
    }

    return (
        <>
            <div className={Styles.menuContainer}>
                <ul className={Styles.menu}>
                    <Link to={"/home"}><img src={logo} className={Styles.logo} alt="x.com Logo" /></Link>
                    <Link to={"/home"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Home} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Home</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/explore"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Explore} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Explore</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/notifications"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Notifications} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Notifications</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/messages"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Messages} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Messages</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={`/home`}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Lists} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Lists</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/home"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Communities} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Communities</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/home"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Premium} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Premium</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/home"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={Profile} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>Profile</p>
                            </div>
                        </li>
                    </Link>
                    <Link to={"/home"}>
                        <li className={Styles.menuList}>
                            <div className={Styles.menuListItem}>
                                <img src={More} className={Styles.icon} alt="x.com Logo" /><p className={Styles.menuListItemText}>More</p>
                            </div>
                        </li>
                    </Link>
                    <button className={`${Styles.postButton} btn btn-primary rounded-pill`}>Post</button>
                </ul>
                <div ref={profileMenu} style={{display:"none"}} className={Styles.profileBoxContainer}>
                    <div className={Styles.profileBox}>
                        <li className={Styles.profileBoxOption}>Add an existing account</li>
                        <li onClick={handleLogout} className={Styles.profileBoxOption}>Log out @{props.user.username}</li>
                    </div>
                    <div className={Styles.profileMenuArrowContainer}>
                        <img src={dropDownArrow} className={Styles.profileMenuArrow} alt="" />
                    </div>
                </div>
                <div ref={profileBox} onClick={toogleProfileMenu} className={Styles.profileContainer}>
                    <div className={Styles.profileImageContainer}>
                        <img src={props.user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
                    </div>
                    <div className={Styles.profileNamesContainer}>
                        <p className={Styles.profileName}>{props.user.name}</p>
                        <p className={Styles.profileUsername}>@{props.user.username}</p>
                    </div>
                    <div className={Styles.threeDotsContainer}>
                        <i className={`fa-solid fa-ellipsis ${Styles.threeDots}`}></i>
                    </div>
                </div>
            </div>
        </>
    )
}
