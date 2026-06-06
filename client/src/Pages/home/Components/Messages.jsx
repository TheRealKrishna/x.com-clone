import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Styles from "../../../css/Home/Components/Messages.module.css";
import { Avatar, IconButton, Spinner, EmptyState } from "../../../ui";
import NewMessageModal from "./NewMessageModal";
import { authApi, chatApi } from "../../../api";
import { formatPostAge, formatJoinedDate } from "../../../utils/format";

/**
 * Real-time direct messages. Left pane lists conversations (with unread badges,
 * last-message preview, and timestamps); right pane is the active thread with
 * read receipts and a typing indicator.
 */
export default function Messages({ user, realtime }) {
  const { _id } = useParams();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [typing, setTyping] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const scrollRef = useRef();
  const inputRef = useRef();
  const typingTimer = useRef();

  const fetchContacts = async () => {
    const j = await chatApi.getContacts();
    if (j.success) setContacts(j.contacts);
    return j.contacts || [];
  };

  const fetchMessages = async () => {
    if (!_id) return;
    const j = await chatApi.getMessages(_id);
    if (j.success) setMessages(j.messages);
    fetchContacts();
  };

  const fetchContact = async () => {
    const j = await authApi.getById(_id);
    if (j.success) setContact(j.user);
    else navigate("/messages");
  };

  useEffect(() => {
    setLoadingList(true);
    fetchContacts().finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!_id) {
      setContact(null);
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    Promise.all([fetchContact(), fetchMessages()]).finally(() => setLoadingThread(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  // Realtime: incoming messages, read receipts, typing.
  useEffect(() => {
    if (!realtime) return undefined;
    const offNew = realtime.on("newMessage", ({ from, message }) => {
      if (String(from) === String(_id)) {
        setMessages((prev) => [...prev, message]);
        chatApi.getMessages(_id);
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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const onType = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    realtime?.emit("typing", { to: _id, from: user._id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => realtime?.emit("typing", { to: _id, from: user._id, isTyping: false }), 1500);
  };

  const send = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    realtime?.emit("typing", { to: _id, from: user._id, isTyping: false });
    const j = await chatApi.sendMessage(_id, body);
    if (j.success) {
      setMessages(j.messages);
      fetchContacts();
    }
  };

  const filtered = search.trim()
    ? contacts.filter((c) => {
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.username?.toLowerCase().includes(q);
      })
    : contacts;

  return (
    <div className={Styles.layout}>
      {/* Conversation list */}
      <div className={`${Styles.list} ${_id ? Styles.listHidden : ""}`}>
        <div className={Styles.listHeader}>
          <h1 className={Styles.listTitle}>Messages</h1>
          <IconButton icon="fa-regular fa-pen-to-square" title="New message" onClick={() => setNewOpen(true)} />
        </div>
        <div className={Styles.searchWrap}>
          <div className={Styles.searchBox}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--text-secondary)" }} />
            <input
              className={Styles.searchInput}
              placeholder="Search Direct Messages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className={Styles.contacts}>
          {loadingList ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyState title="Welcome to your inbox!" subtitle="Start a conversation to fill your inbox with messages." />
          ) : (
            filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/messages/${c._id}`)}
                className={`${Styles.contact} ${_id === c._id ? Styles.contactActive : ""}`}
              >
                <Avatar src={c.profile} size="lg" />
                <div className={Styles.contactBody}>
                  <div className={Styles.contactTop}>
                    <span className={Styles.contactName}>{c.name}</span>
                    {c.verified && <i className="fa-solid fa-circle-check" style={{ color: "var(--x-blue)", fontSize: 13 }} />}
                    <span className={Styles.contactHandle}>@{c.username}</span>
                    {c.lastMessageAt && <span className={Styles.contactTime}>{formatPostAge(c.lastMessageAt)}</span>}
                  </div>
                  <p className={Styles.contactPreview} style={{ fontWeight: c.unreadCount ? 700 : 400, color: c.unreadCount ? "var(--text-primary)" : undefined }}>
                    {c.lastMessage || "Tap to start a conversation"}
                  </p>
                </div>
                {c.unreadCount > 0 && <span className={Styles.unreadDot} />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      {!_id ? (
        <div className={Styles.thread}>
          <div className={Styles.empty}>
            <EmptyState
              title="Select a message"
              subtitle="Choose from your existing conversations, start a new one, or just keep swimming."
            />
            <button className="btn" onClick={() => setNewOpen(true)} style={{ background: "var(--x-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-pill)", padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
              New message
            </button>
          </div>
        </div>
      ) : (
        <div className={`${Styles.thread} ${Styles.threadFull}`}>
          <div className={Styles.threadHeader}>
            <IconButton icon="fa-solid fa-arrow-left" title="Back" onClick={() => navigate("/messages")} />
            {contact && (
              <>
                <Avatar src={contact.profile} size="sm" username={contact.username} />
                <p className={Styles.threadName}>
                  {contact.name}
                  {contact.verified && <i className="fa-solid fa-circle-check" style={{ color: "var(--x-blue)", fontSize: 13 }} />}
                </p>
              </>
            )}
          </div>

          {loadingThread || !contact ? (
            <Spinner />
          ) : (
            <>
              <div className={Styles.messages} ref={scrollRef}>
                <Link to={`/${contact.username}`} className={Styles.intro}>
                  <Avatar src={contact.profile} size="xl" />
                  <p className={Styles.introName}>{contact.name}</p>
                  <p className={Styles.introMeta}>@{contact.username}</p>
                  <p className={Styles.introMeta}>
                    {contact.bio ? `${contact.bio} · ` : ""}Joined {formatJoinedDate(contact.createdAt || contact.joined)}
                  </p>
                </Link>

                {messages.map((m, i) => {
                  const mine = String(m.sender) === String(user._id);
                  const lastMine = mine && i === messages.length - 1;
                  return (
                    <React.Fragment key={m._id || i}>
                      <div className={`${Styles.bubble} ${mine ? Styles.sent : Styles.received}`} title={m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}>
                        {m.message}
                      </div>
                      {lastMine && <span className={Styles.receipt}>{m.read ? "Seen" : "Sent"}</span>}
                    </React.Fragment>
                  );
                })}
                {typing && <div className={Styles.typing}>typing…</div>}
              </div>

              <form className={Styles.send} onSubmit={send}>
                <div className={Styles.sendInputWrap}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    className={Styles.sendInput}
                    placeholder="Start a new message"
                    value={text}
                    onChange={onType}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(e);
                      }
                    }}
                  />
                </div>
                <button type="submit" className={Styles.sendBtn} disabled={!text.trim()} aria-label="Send">
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <NewMessageModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
