import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../../css/Home/Components/Home.module.css"
import Globe from "../../../Images/Home/Globe.svg"
import Gallery from "../../../Images/Home/Gallery.svg"
import Gif from "../../../Images/Home/Gif.svg"
import Poll from "../../../Images/Home/Poll.svg"
import Emoji from "../../../Images/Home/Emoji.svg"
import Schedule from "../../../Images/Home/Schedule.svg"
import Location from "../../../Images/Home/Location.svg"


export default function Home(props) {
    const [currentMenu, setCurrentMenu] = useState("For You")
    const [post, setPost] = useState({ text: '', audience: "Everyone", whoCanReply: "Everyone can reply" });
    const postTextInput = useRef();
    const audienceSelector = useRef();
    const whoCanReplySelector = useRef();

    useEffect(() => {
        postTextInput.current.addEventListener('focus', () => {
            setTimeout(() => {
                whoCanReplySelector.current.style.display = "block"
            }, 300);
            setTimeout(() => {
                audienceSelector.current.style.display = "block"
            }, 500)
        })
    }, [])

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
                <div className={Styles.profileImageContainer}>
                    <img src={props.user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
                </div>
                <div className={Styles.postBox}>
                    <button ref={audienceSelector} style={{ display: "none" }} className={Styles.audienceSelectorButton}>{post.audience} <i class="fa-solid fa-angle-down"></i></button>
                    <div className={Styles.postTextBox}>
                        <input ref={postTextInput} type="text" value={post.text} className={Styles.postTextInput} placeholder='What is happening?!' />
                    </div>
                    <p ref={whoCanReplySelector} style={{ display: "none" }} className={Styles.whoCanReplySelector}><img className={Styles.whoCanReplySelectorGlobeIcon} src={Globe} alt='globe' />{post.whoCanReply}</p>
                    <div className={Styles.postIconsAndSubmitContainer}>
                        <div className={Styles.postIconsContainer}>
                            <img src={Gallery} className={Styles.postIcon} alt="Gallery" />
                            <img src={Gif} className={Styles.postIcon} alt="Gif" />
                            <img src={Poll} className={Styles.postIcon} alt="Poll" />
                            <img src={Emoji} className={Styles.postIcon} alt="Emoji" />
                            <img src={Schedule} className={Styles.postIcon} alt="Schedule" />
                            <img src={Location} className={`${Styles.postIcon} ${Styles.postIconDisabled}`} alt="Location" />
                        </div>
                        <button className={`${Styles.postButton} btn btn-primary rounded-pill`} disabled>Post</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
