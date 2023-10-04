import React, { useState } from 'react'
import Styles from "../../../css/Home/Components/Home.module.css"

export default function Home(props) {
    const [currentMenu, setCurrentMenu] = useState("For You")
    return (
        <div className={Styles.container}>
            <div className={Styles.header}>
                <h5 className={Styles.title}>Home</h5>
                <div className={Styles.menuSelectorContainer}>
                    <div onClick={() => setCurrentMenu("For You")} className={`${Styles.menuSelectorItem} ${currentMenu === "For You" ? Styles.forYouSelected : ""}`}>For&nbsp;you</div>
                    <div onClick={() => setCurrentMenu("Following")} className={`${Styles.menuSelectorItem} ${currentMenu === "Following" ? Styles.followingItemSelected : ""}`}>Following</div>
                </div>
            </div>
            <div className={Styles.makePostContainer}>
                <div className={Styles.inputContainer}>
                    <div className={Styles.profileImageContainer}>
                        <img src={props.user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}
