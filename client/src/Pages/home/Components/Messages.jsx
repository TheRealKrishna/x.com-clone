import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Styles from "../../../css/Home/Components/Messages.module.css";
import MessagesPlus from "../../../Images/Home/Messages/MessagePlus.svg";
import Search from "../../../Images/Home/Messages/Search.svg";
import Settings from "../../../Images/Home/Messages/Settings.svg";
import Info from "../../../Images/Home/Messages/Info.svg";
import Send from "../../../Images/Home/Messages/Send.svg";
import Emoji from "../../../Images/Home/Messages/Emoji.svg";
import Gallery from "../../../Images/Home/Messages/Gallery.svg";
import Gif from "../../../Images/Home/Messages/Gif.svg";
import BackButton from "../../../Images/backButtonIcon.svg";
import Spinner from "../../../Components/Spinner";
import { authApi, chatApi } from "../../../api";
import { formatJoinedDate, formatPostAge, formatTime } from "../../../utils/format";

export default function Messages({ user, setUser, realtime }) {
  const { _id } = useParams();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leftLoading, setLeftLoading] = useState(true);
  const [rightLoading, setRightLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  const chatRef = useRef();
  const inputRef = useRef();
  const typingTimeout = useRef();

  /* --------------------------------- Loaders -------------------------------- */
  const fetchContacts = async () => {
    const json = await chatApi.getContacts();
    if (json.success) {
      setContacts(json.contacts);
      return json.contacts;
    }
    return [];
  };

  const fetchMessages = async () => {
    if (!_id) return;
    const json = await chatApi.getMessages(_id);
    if (json.success) setMessages(json.messages);
    // Reading clears unread; refresh contact list counts + the user's badge.
    fetchContacts();
  };

  const fetchContactInfo = async () => {
    const json = await authApi.getById(_id);
    if (json.success) {
      setContact(json.user);
    } else {
      navigate("/messages");
    }
  };

  /* ------------------------------- Lifecycle -------------------------------- */
  useEffect(() => {
    setLeftLoading(true);
    fetchContacts().finally(() => setLeftLoading(false));
  }, []);

  useEffect(() => {
    if (!_id) {
      setContact(null);
      setMessages([]);
      return;
    }
    setRightLoading(true);
    Promise.all([fetchContactInfo(), fetchMessages()]).finally(() => setRightLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  // Realtime: new messages, read receipts, typing indicator.
  useEffect(() => {
    if (!realtime) return undefined;
    const offNew = realtime.on("newMessage", ({ from, message: msg }) => {
      if (String(from) === String(_id)) {
        setMessages((prev) => [...prev, msg]);
        chatApi.getMessages(_id); // mark read immediately since the chat is open
      }
      fetchContacts();
    });
    const offRead = realtime.on("messagesRead", ({ by }) => {
      if (String(by) === String(_id)) {
        setMessages((prev) => prev.map((m) => (String(m.sender) === String(user._id) ? { ...m, read: true } : m)));
      }
    });
    const offTyping = realtime.on("typing", ({ from, isTyping }) => {
      if (String(from) === String(_id)) setTyping(isTyping);
    });
    return () => {
      offNew();
      offRead();
      offTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtime, _id, user._id]);

  // Auto-scroll to newest message.
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  /* --------------------------------- Sending -------------------------------- */
  const onMessageChange = (e) => {
    setMessage(e.target.value);
    realtime?.emit("typing", { to: _id, from: user._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      realtime?.emit("typing", { to: _id, from: user._id, isTyping: false });
    }, 1500);
  };

  const onSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessage("");
    realtime?.emit("typing", { to: _id, from: user._id, isTyping: false });
    const json = await chatApi.sendMessage(_id, text);
    if (json.success) {
      setMessages(json.messages);
      fetchContacts();
    }
  };

  const filteredContacts = searchQuery.trim()
    ? contacts.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.bio?.toLowerCase().includes(q)
        );
      })
    : contacts;

  /* ------------------------------- Left column ------------------------------ */
  const ContactList = (
    <div className={Styles.mainPanelSmall}>
      {leftLoading ? (
        <Spinner />
      ) : (
        <>
          <div className={Styles.topBlackConatiner}>
            <h5 className={Styles.heading}>Messages</h5>
            <div>
              <img src={Settings} alt="settings" className={Styles.topContainerIcon} />
              <img src={MessagesPlus} alt="new message" className={Styles.topContainerIcon} />
            </div>
          </div>
          {contacts.length > 0 && (
            <div className={Styles.searchInputBox}>
              <img src={Search} alt="search" className={Styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Direct Messages"
                className={Styles.searchInput}
              />
            </div>
          )}
          <div className={Styles.contacts}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/messages/${c._id}`)}
                  className={`${Styles.contactContainer} ${_id === c._id ? Styles.contactContainerSelected : ""}`}
                >
                  <div className={Styles.contactProfileContainer}>
                    <img src={c.profile} referrerPolicy="no-referrer" alt="" className={Styles.contactProfile} />
                  </div>
                  <div className={Styles.contactInfoContainer}>
                    <div className={Styles.contactNameContainer}>
                      <h6 className={Styles.name}>{c.name}</h6>
                      <p className={Styles.username}>@{c.username}</p>
                      {c.lastMessageAt && (
                        <>
                          <p className={Styles.dot}>•</p>
                          <p className={Styles.timestamp}>{formatPostAge(c.lastMessageAt)}</p>
                        </>
                      )}
                      {c.unreadCount > 0 && (
                        <span
                          style={{
                            marginLeft: "auto",
                            background: "rgb(29,155,240)",
                            color: "white",
                            borderRadius: 9999,
                            minWidth: 18,
                            height: 18,
                            fontSize: 11,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 5px",
                          }}
                        >
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className={Styles.lastMessage} style={{ fontWeight: c.unreadCount > 0 ? 700 : 400 }}>
                      {c.lastMessage || "Start a conversation"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={Styles.welcomeInboxContainer}>
                <h2 className={Styles.welcomeMessageText}>Welcome to your inbox!</h2>
                <p className={Styles.welcomeMessageTextSmaller}>
                  Drop a line, share posts and more with private conversations between you and others on X.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // No conversation selected → show only the contact list.
  if (!_id) return <div className={Styles.container}>{ContactList}</div>;

  /* ------------------------------ Right column ------------------------------ */
  return (
    <div className={Styles.mainPanelSmall}>
      {rightLoading || !contact ? (
        <Spinner />
      ) : (
        <div className={Styles.chatArea}>
          <div className={Styles.chatAreaTopBlackConatiner}>
            <img onClick={() => navigate("/messages")} className={Styles.backButton} src={BackButton} alt="back" />
            <h5 className={Styles.heading}>{contact.name}</h5>
            <img src={Info} alt="info" className={Styles.chatAreaInfoIcon} />
          </div>

          <div className={Styles.chat} ref={chatRef}>
            <div className={Styles.chatMessages}>
              <Link to={`/${contact.username}`}>
                <div className={Styles.chatContactInfoContainer}>
                  <div className={Styles.chatContactProfileContainer}>
                    <img src={contact.profile} referrerPolicy="no-referrer" alt="" className={Styles.chatContactProfile} />
                  </div>
                  <p className={Styles.chatContactName}>{contact.name}</p>
                  <p className={Styles.chatContactUsername}>@{contact.username}</p>
                  <p className={Styles.chatContactBio}>{contact.bio}</p>
                  <div className="d-flex justify-content-center">
                    <p className={Styles.chatContactJoinedText}>
                      Joined {formatJoinedDate(contact.createdAt || contact.joined)}
                    </p>
                    <p className={Styles.chatContactDot}>•</p>
                    <p className={Styles.chatContactFollowers}>{contact.followers?.length || 0} Followers</p>
                  </div>
                </div>
              </Link>

              {messages.map((m, i) => {
                const mine = String(m.sender) === String(user._id);
                const isLastMine = mine && i === messages.length - 1;
                return (
                  <div key={m._id || i} className={mine ? Styles.sentMessage : Styles.receivedMessage} title={m.createdAt ? formatTime(m.createdAt) : ""}>
                    {m.message}
                    {isLastMine && (
                      <span style={{ display: "block", fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                        {m.read ? "Seen" : "Sent"}
                      </span>
                    )}
                  </div>
                );
              })}

              {typing && (
                <div className={Styles.receivedMessage} style={{ opacity: 0.7 }}>
                  <i>typing…</i>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={onSend}>
            <div className={Styles.sendBox}>
              <div className={Styles.messageInputBox}>
                <div className={Styles.messageInputIcons}>
                  <img src={Gallery} className={Styles.messageInputIcon} alt="" />
                  <img src={Gif} className={Styles.messageInputIcon} alt="" />
                  <img src={Emoji} className={Styles.messageInputIcon} alt="" />
                </div>
                <textarea
                  rows="1"
                  value={message}
                  onChange={onMessageChange}
                  ref={inputRef}
                  className={Styles.messageInput}
                  placeholder="Start a new message"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend(e);
                    }
                  }}
                />
                <button type="submit" disabled={message.trim().length === 0} className={Styles.messageSendButton}>
                  <img src={Send} className={Styles.messageInputIcon} alt="send" style={{ opacity: message.trim().length === 0 ? 0.5 : 1 }} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
