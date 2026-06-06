import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClickAwayListener from "react-click-away-listener";

import Styles from "../../../css/Home/Components/PostCard.module.css";
import { Avatar } from "../../../ui";
import RichText from "./RichText";
import { postApi } from "../../../api";
import { formatPostAge } from "../../../utils/format";
import { notify, notifySuccess } from "../../../utils/toast";

const fmt = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n || "";
};

/**
 * A single post. Used by feeds, profile, search, bookmarks, and thread views.
 * Engagement is optimistic; the three-dots menu offers copy-link and (for the
 * author) delete. Clicking the card opens the thread, except when `focused`.
 */
export default function PostCard({ post, currentUser, onReply, onChange, focused = false }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(!!post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [reposted, setReposted] = useState(!!post.reposted);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [bookmarked, setBookmarked] = useState(!!post.bookmarked);
  const [menuOpen, setMenuOpen] = useState(false);

  const sender = post.sender || {};
  const isOwner = currentUser?._id === sender._id;
  const images = Array.isArray(post.images) ? post.images : [];
  const stop = (e) => e.stopPropagation();

  const openThread = () => !focused && navigate(`/status/${post._id}`);

  const toggleLike = async (e) => {
    stop(e);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    const res = next ? await postApi.like(post._id) : await postApi.unlike(post._id);
    if (!res.success) {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  };

  const toggleRepost = async (e) => {
    stop(e);
    const next = !reposted;
    setReposted(next);
    setRepostCount((c) => c + (next ? 1 : -1));
    const res = await postApi.toggleRepost(post._id);
    if (!res.success) {
      setReposted(!next);
      setRepostCount((c) => c + (next ? -1 : 1));
    } else {
      notify(next ? "Reposted" : "Removed repost");
    }
  };

  const toggleBookmark = async (e) => {
    stop(e);
    const next = !bookmarked;
    setBookmarked(next);
    const res = await postApi.toggleBookmark(post._id);
    if (res.success) notify(next ? "Added to your Bookmarks" : "Removed from your Bookmarks");
    else setBookmarked(!next);
  };

  const share = async (e) => {
    stop(e);
    const url = `${window.location.origin}/status/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Copied link to post");
    } catch {
      notify(url);
    }
  };

  const reply = (e) => {
    stop(e);
    if (onReply) onReply(post);
    else navigate(`/status/${post._id}`);
  };

  const remove = async (e) => {
    stop(e);
    setMenuOpen(false);
    const res = await postApi.remove(post._id);
    if (res.success) {
      notifySuccess("Your post was deleted");
      onChange?.();
    } else notify(res.error || "Could not delete");
  };

  return (
    <article className={Styles.post} onClick={openThread}>
      <Avatar src={sender.profile} size="md" username={sender.username} />
      <div className={Styles.body}>
        <div className={Styles.head}>
          <Link to={`/${sender.username}`} onClick={stop} className={Styles.name}>
            {sender.name}
          </Link>
          {sender.verified && <i className={`fa-solid fa-circle-check ${Styles.verified}`} />}
          <span className={Styles.handle}>@{sender.username}</span>
          <span className={Styles.dot}>·</span>
          <span className={Styles.time} title={new Date(post.createdAt).toLocaleString()}>
            {formatPostAge(post.createdAt)}
          </span>

          <div className={Styles.menuBtn} style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                stop(e);
                setMenuOpen((v) => !v);
              }}
              aria-label="More"
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4, borderRadius: "50%" }}
            >
              <i className="fa-solid fa-ellipsis" />
            </button>
            {menuOpen && (
              <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                <div className={Styles.menu} onClick={stop}>
                  {isOwner ? (
                    <div className={`${Styles.menuItem} ${Styles.menuItemDanger}`} onClick={remove}>
                      <i className="fa-solid fa-trash" /> Delete
                    </div>
                  ) : (
                    <div className={Styles.menuItem} onClick={() => { setMenuOpen(false); notify(`You won't see posts like this from @${sender.username}`); }}>
                      <i className="fa-solid fa-face-frown" /> Not interested
                    </div>
                  )}
                  <div className={Styles.menuItem} onClick={(e) => { share(e); setMenuOpen(false); }}>
                    <i className="fa-solid fa-link" /> Copy link
                  </div>
                </div>
              </ClickAwayListener>
            )}
          </div>
        </div>

        {post.message && <RichText text={post.message} className={Styles.text} />}

        {images.length > 0 && (
          <div className={`${Styles.images} ${Styles[`images${images.length}`]}`}>
            {images.map((src, i) => (
              <div key={i} className={Styles.imageWrap}>
                <img src={src} alt="" className={Styles.image} />
              </div>
            ))}
          </div>
        )}

        <div className={Styles.actions} onClick={stop}>
          <div className={`${Styles.action} ${Styles.actionReply}`}>
            <button onClick={reply} aria-label="Reply"><i className="fa-regular fa-comment" /></button>
            <span>{fmt(post.replyCount)}</span>
          </div>
          <div className={`${Styles.action} ${Styles.actionRepost} ${reposted ? Styles.on : ""}`}>
            <button onClick={toggleRepost} aria-label="Repost"><i className="fa-solid fa-retweet" /></button>
            <span>{fmt(repostCount)}</span>
          </div>
          <div className={`${Styles.action} ${Styles.actionLike} ${liked ? Styles.on : ""}`}>
            <button onClick={toggleLike} aria-label="Like"><i className={`${liked ? "fa-solid" : "fa-regular"} fa-heart`} /></button>
            <span>{fmt(likeCount)}</span>
          </div>
          <div className={`${Styles.action}`}>
            <button aria-label="Views" onClick={stop}><i className="fa-solid fa-chart-simple" /></button>
            <span>{fmt(post.viewCount)}</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <div className={`${Styles.action} ${Styles.actionBookmark} ${bookmarked ? Styles.on : ""}`}>
              <button onClick={toggleBookmark} aria-label="Bookmark"><i className={`${bookmarked ? "fa-solid" : "fa-regular"} fa-bookmark`} /></button>
            </div>
            <div className={`${Styles.action} ${Styles.actionShare}`}>
              <button onClick={share} aria-label="Share"><i className="fa-solid fa-arrow-up-from-bracket" /></button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
