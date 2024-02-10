import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../../css/Home/Components/Messages.module.css"
import MessagesPlus from "../../../Images/Home/Messages/MessagePlus.svg"
import Search from "../../../Images/Home/Messages/Search.svg"
import Settings from "../../../Images/Home/Messages/Settings.svg"
import Info from "../../../Images/Home/Messages/Info.svg"
import Send from "../../../Images/Home/Messages/Send.svg"
import Emoji from "../../../Images/Home/Messages/Emoji.svg"
import Gallery from "../../../Images/Home/Messages/Gallery.svg"
import Gif from "../../../Images/Home/Messages/Gif.svg"
import BackButton from "../../../Images/backButtonIcon.svg"
import { Link, useNavigate, useParams } from "react-router-dom"
import Spinner from "../../../Components/Spinner"
import io from 'socket.io-client';


export default function Messages(props) {
    const [contacts, setContacts] = useState([])
    const [searchedContacts, setSearchedContacts] = useState([])
    const [contact, setContact] = useState(false)
    const [searchQuery, setSearchQuery] = useState([])
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const chat = useRef()
    const messageInput = useRef()
    const messageSendButton = useRef()
    const messageInputBox = useRef()
    const contactSearchInput = useRef()
    const [leftLoading, setLeftLoading] = useState(true);
    const [RightLoading, setRightLoading] = useState(true);
    const { _id } = useParams();
    const socket = useRef();
    const navigate = useNavigate();

    const onSearchQueryChange = async (e) => {
        setSearchQuery(e.target.value);
    }

    const fetchContacts = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/getcontacts`, {
            method: "POST",
            headers: {
                "authtoken": localStorage.getItem("auth-token")
            }
        })
        const json = await response.json()
        if (json.success) {
            setContacts(json.contacts)
            return json.contacts
        }
    }


    const fetchContactInfo = async (contacts) => {
        setRightLoading(true)
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
            setContact(json.user)
            const doesContactAlreadyExist = contacts.some((contact) => contact._id === json.user._id)
            if (!doesContactAlreadyExist) {
                addToContacts(json.user)
            }
            return json.user
        }
        else {
            setContact(false)
            navigate("/messages")
        }
        setRightLoading(false)
    }

    const addToContacts = async (contact) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/addcontact`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ _id: contact._id })
        })
        const json = await response.json();
        if (json.success) {
            fetchContacts();
            return json.user
        }
    }

    const fixMessageSendInputBox = async () => {
        messageInput.current.style.height = 'auto';
        const computedStyle = window.getComputedStyle(messageInput.current);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const padding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        const scrollHeight = messageInput.current.scrollHeight - padding;
        messageInput.current.style.height = (scrollHeight < lineHeight ? lineHeight : scrollHeight) + 'px';
    }

    function calculateJoinedDate(postDate) {
        const postDateTime = new Date(postDate);
        const options = {
            month: "long",
            year: 'numeric'
        }
        return postDateTime.toLocaleDateString(undefined, options);
    }

    const fetchMessages = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/getmessages`, {
            method: "POST",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ _id: _id })
        })
        const json = await response.json()
        if (json.success) {
            setMessages(json.messages)
            return json.messages
        }
    }

    const onMessageChange = async (e) => {
        setMessage(e.target.value);
        fixMessageSendInputBox();
    }

    const onMessageSend = async (e) => {
        e.preventDefault()
        if (message.trim().length > 0) {
            const text = message;
            setMessage(prev => "");
            fixMessageSendInputBox();
            if (messages.length === 0) {
                createChat(text);
            }
            else {
                addMessage(text);
            }
        }
    }

    const addMessage = async (text) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/addmessage`, {
            method: "POST",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ _id: _id, message: message })
        })
        const json = await response.json()
        if (json.success) {
            socket.current?.emit('sendMessage', _id);
            setMessages(json.messages)
            return json.messages
        }
    }

    const createChat = async (text) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/createchat`, {
            method: "POST",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ _id: _id, message: message })
        })
        const json = await response.json()
        if (json.success) {
            socket.current?.emit('sendMessage', _id);
            setMessages(json.messages)
            return json.messages
        }
    }

    useEffect(() => {
        if (_id) {
            setContact(true);
        }
        else {
            setContact(false);
        }
        setRightLoading(true)
        fetchContacts().then((contacts) => {
            setLeftLoading(false)
            if (_id) {
                fetchContactInfo(contacts).then(() => fetchMessages()).then(() => setRightLoading(false))

            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location.pathname, _id])

    useEffect(() => {
        if (messageInput.current) {
            fixMessageSendInputBox();
        }
    }, [message])

    useEffect(() => {
        socket.current = io(process.env.REACT_APP_API_URL);
        socket.current.on('newMessage', () => {
            console.log("new messages")
            fetchMessages()
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (chat.current) {
            chat.current.scrollTop = chat.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        socket.current.emit('join', props.user._id)
    }, [props.user._id])

    useEffect(() => {
        if (searchQuery.length > 0) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const matchingContacts = contacts.filter(contact =>
                contact.name.toLowerCase().includes(lowerCaseQuery) ||
                contact.username.toLowerCase().includes(lowerCaseQuery) ||
                contact.bio.toLowerCase().includes(lowerCaseQuery)
            );
            setSearchedContacts(matchingContacts)
        }
        else {
            setSearchedContacts([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery])

    if (!contact) {
        return (
            <div className={Styles.container}>
                <div className={Styles.mainPanelSmall}>
                    {
                        leftLoading ?
                            <Spinner />
                            :
                            <>
                                <div className={Styles.topBlackConatiner}>
                                    <h5 className={Styles.heading}>Messages</h5>
                                    <div>
                                        <img src={Settings} alt="settings" className={Styles.topContainerIcon} />
                                        <img src={MessagesPlus} alt="messageplus" className={Styles.topContainerIcon} />
                                    </div>
                                </div>
                                {contacts.length > 0 ?
                                    <div className={Styles.searchInputBox} onClick={() => contactSearchInput.current.focus()}>
                                        <img src={Search} alt="search" className={Styles.searchIcon} />
                                        <input type="text" value={searchQuery} onChange={onSearchQueryChange} ref={contactSearchInput} placeholder='Search Direct Messages' className={Styles.searchInput} />
                                    </div>
                                    :
                                    null
                                }
                                <div className={Styles.contacts}>
                                    {
                                        searchedContacts.length > 0 ?
                                            searchedContacts.map((contact) => {
                                                return (
                                                    <div key={contact._id} onClick={() => navigate(`/messages/${contact._id}`)} className={`${Styles.contactContainer} ${_id === contact._id ? Styles.contactContainerSelected : ""}`}>
                                                        <div className={Styles.contactProfileContainer}>
                                                            <img src={contact.profile} alt="contactProfile" className={Styles.contactProfile} />
                                                        </div>
                                                        <div className={Styles.contactInfoContainer}>
                                                            <div className={Styles.contactNameContainer}>
                                                                <h6 className={Styles.name}>{contact.name}</h6>
                                                                <p className={Styles.username}>@{contact.username}</p>
                                                                <p className={Styles.dot}>•</p>
                                                                {/* <p className={Styles.timestamp}>{calculatePostAge(post.timestamp)}</p> */}
                                                                <p className={Styles.timestamp}>33m</p>
                                                            </div>
                                                            <div className={Styles.lastMessage}>
                                                                Last Message
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                            :
                                            contacts.length > 0 ? contacts.map((contact) => {
                                                return (
                                                    <div key={contact._id} onClick={() => navigate(`/messages/${contact._id}`)} className={`${Styles.contactContainer} ${_id === contact._id ? Styles.contactContainerSelected : ""}`}>
                                                        <div className={Styles.contactProfileContainer}>
                                                            <img src={contact.profile} alt="contactProfile" className={Styles.contactProfile} />
                                                        </div>
                                                        <div className={Styles.contactInfoContainer}>
                                                            <div className={Styles.contactNameContainer}>
                                                                <h6 className={Styles.name}>{contact.name}</h6>
                                                                <p className={Styles.username}>@{contact.username}</p>
                                                                <p className={Styles.dot}>•</p>
                                                                {/* <p className={Styles.timestamp}>{calculatePostAge(post.timestamp)}</p> */}
                                                                <p className={Styles.timestamp}>33m</p>
                                                            </div>
                                                            <div className={Styles.lastMessage}>
                                                                Last Message
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                                :
                                                <div className={Styles.welcomeInboxContainer}>
                                                    <h2 className={Styles.welcomeMessageText}>Welcome to your inbox!</h2>
                                                    <p className={Styles.welcomeMessageTextSmaller}>Drop a line, share posts and more with private conversations between you and others on X. </p>
                                                    <button className={`btn btn-primary rounded-pill ${Styles.writeMessageButton}`}>Write a message</button>
                                                </div>
                                    }
                                </div>
                            </>
                    }
                </div>
            </div>
        )
    }
    else {
        return (
            <div className={Styles.mainPanelSmall}>
                {
                    contact ?
                        RightLoading ?
                            <Spinner />
                            :
                            <div className={Styles.chatArea}>
                                <div className={Styles.chatAreaTopBlackConatiner}>
                                    <img onClick={() => { navigate(`/messages`) }} className={Styles.backButton} src={BackButton} alt='backButton' />
                                    <h5 className={Styles.heading}>{contact.name}</h5>
                                    <img src={Info} alt="Info" className={Styles.chatAreaInfoIcon} />
                                </div>
                                <div className={Styles.chat} ref={chat}>
                                    <div className={Styles.chatMessages}>
                                        <Link to={`/${contact.username}`}>
                                            <div className={Styles.chatContactInfoContainer}>
                                                <div className={Styles.chatContactProfileContainer}>
                                                    <img src={contact.profile} alt="contactProfile" className={Styles.chatContactProfile} />
                                                </div>
                                                <p className={Styles.chatContactName}>{contact.name}</p>
                                                <p className={Styles.chatContactUsername}>@{contact.username}</p>
                                                <p className={Styles.chatContactBio}>{contact.bio}</p>
                                                <div className='d-flex justify-content-center'>
                                                    <p className={Styles.chatContactJoinedText}>Joined {calculateJoinedDate(contact.joined)}</p>
                                                    <p className={Styles.chatContactDot}>•</p>
                                                    <p className={Styles.chatContactFollowers}>{contact.followers?.length} Followers</p>
                                                </div>
                                            </div>
                                        </Link>
                                        {
                                            messages && messages.map((message) => {
                                                return (
                                                    <div key={message._id} className={message.sender === props.user._id ? Styles.sentMessage : Styles.receivedMessage}>{message.message}</div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                    <form onSubmit={onMessageSend}>
                                        <div className={Styles.sendBox}>
                                            <div className={Styles.messageInputBox} ref={messageInputBox}>
                                                <div className={Styles.messageInputIcons}>
                                                    <img src={Gallery} className={Styles.messageInputIcon} alt="" />
                                                    <img src={Gif} className={Styles.messageInputIcon} alt="" />
                                                    <img src={Emoji} className={Styles.messageInputIcon} alt="" />
                                                </div>
                                                <textarea rows="1" type="text" value={message} onChange={onMessageChange} ref={messageInput} className={Styles.messageInput} placeholder='Start a new message' />
                                                <div className={Styles.messageSendButton}>
                                                    <button type='submit' ref={messageSendButton} disabled={message.trim()?.length <= 0} className={Styles.messageSendButton}>
                                                        <img src={Send} className={Styles.messageInputIcon} alt="" style={{ opacity: message.trim()?.length <= 0 ? .5 : 1 }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                            </div>
                        :
                        <div className={Styles.selectMessageContainer}>
                            <h2 className={Styles.selectMessageText}>Select a message</h2>
                            <p className={Styles.selectMessageTextSmaller}>Choose from your existing conversations, start a new one, or just keep swimming.</p>
                            <button className={`btn btn-primary rounded-pill ${Styles.newMessageButton}`}>New message</button>
                        </div>
                }
            </div>
        )
    }
}
