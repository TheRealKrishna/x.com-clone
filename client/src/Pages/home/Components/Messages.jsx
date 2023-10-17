import React, { useState } from 'react'
import Styles from "../../../css/Home/Components/Messages.module.css"
import MessagesPlus from "../../../Images/Home/Messages/MessagePlus.svg"
import Search from "../../../Images/Home/Messages/Search.svg"
import Settings from "../../../Images/Home/Messages/Settings.svg"

export default function Messages(props) {
    const [contacts, setContacts] = useState([])
    const fetchContacts = async()=>{

    }
    
    return (
        <div className={Styles.container}>
            <div className={Styles.mainPanelSmall}>
                <div className={Styles.topBlackConatiner}>
                    <h5 className={Styles.heading}>Messages</h5>
                    <div>
                        <img src={Settings} alt="settings" className={Styles.topContainerIcon} />
                        <img src={MessagesPlus} alt="messageplus" className={Styles.topContainerIcon} />
                    </div>
                </div>
                <div className={Styles.searchInputBox}>
                    <img src={Search} alt="search" className={Styles.searchIcon} />
                    <input type="text" placeholder='Search Direct Messages' className={Styles.searchInput} />
                </div>
            </div>
            <div className={Styles.rightPanelLarge}>
                {
                    props.contactId === "/messages" ?
                    <div className={Styles.selectMessageContainer}>
                        <h2 className={Styles.selectMessageText}>Select a message</h2>
                        <p className={Styles.selectMessageTextSmaller}>Choose from your existing conversations, start a new one, or just keep swimming.</p>
                        <button className={`btn btn-primary rounded-pill ${Styles.newMessageButton}`}>New Message</button>
                    </div>
                    :
                    <div></div>
                }
            </div>
        </div>
    )
}
