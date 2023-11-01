import React, { useEffect, useState } from 'react'
import Styles from "../../../css/Home/Components/Messages.module.css"
import MessagesPlus from "../../../Images/Home/Messages/MessagePlus.svg"
import Search from "../../../Images/Home/Messages/Search.svg"
import Settings from "../../../Images/Home/Messages/Settings.svg"
import { useNavigate, useParams } from "react-router-dom"

export default function Messages(props) {
    const [contacts, setContacts] = useState([])
    const [contact, setContact] = useState({})
    const [searchQuery, setSearchQuery] = useState([])
    const { _id } = useParams();
    const navigate = useNavigate();

    const fetchContacts = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/getcontacts`, {
            method: "POST",
            headers: {
                "authtoken": localStorage.getItem("auth-token")
            }
        })
        const json = await response.json()
        if (json.success) {
            // setContacts(json.contacts)
            return json.contacts
        }
    }

    const fetchContactInfo = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/getuserinfowithid`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ _id: _id })
        })
        const json = await response.json();
        if (json.success) {
            setContact(json.user);
            if (!contacts.some(item => item._id === json.user._id)) {
                setContacts(prev => [...prev, json.user]);
                console.log(contacts)
            }
            return json.user
        }
        else {
            navigate("/messages")
        }
    }

    useEffect(() => {
        if (_id) {
            fetchContactInfo();
        }
        fetchContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location.pathname, _id])

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
                <div className={Styles.contacts}>
                    {
                        contacts && contacts.map((contact) => {
                            return <p>{contact.name}</p>
                        })
                    }
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
