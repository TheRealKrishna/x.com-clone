import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Styles from "../css/Home/Components/Posts.module.css";
import Replies from "../Images/Home/Posts/Replies.svg";
import Repost from "../Images/Home/Posts/Repost.svg";
import Like from "../Images/Home/Posts/Like.svg";
import LikeSelected from "../Images/Home/Posts/LikeSelected.svg";
import Views from "../Images/Home/Posts/Views.svg";
import Bookmark from "../Images/Home/Posts/Bookmark.svg";
import Share from "../Images/Home/Posts/Share.svg";
import { postApi } from "../api";
import { formatPostAge } from "../utils/format";
import { notify, notifySuccess } from "../utils/toast";

/**
 * Renders a single post with working engagement actions. Engagement state is
 * tracked locally for instant feedback and synced to the server in the
 * background. `onReply` opens a reply composer; `onChange` lets the parent
 * refresh after a delete.
 */
export default function PostCard({ post, currentUser, onReply, onChange, clickable = true }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(Boolean(post.liked));
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [reposted, setReposted] = useState(Boolean(post.reposted));
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0);
  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked));

  const sender = post.sender || {};
  const isOwner = currentUser?._id === sender._id;

  const stop = (e) => e.stopPropagation();

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
    }
  };

  const toggleBookmark = async (e) => {
    stop(e);
    const next = !bookmarked;
    setBookmarked(next);
    const res = await postApi.toggleBookmark(post._id);
    if (res.success) {
      notify(next ? "Added to your Bookmarks" : "Removed from your Bookmarks");
    } else {
      setBookmarked(!next);
    }
  };

  const share = async (e) => {
    stop(e);
    const url = `${window.location.origin}/status/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied to clipboard");
    } catch {
      notify(url);
    }
  };

  const handleReply = (e) => {
    stop(e);
    if (onReply) onReply(post);
    else navigate(`/status/${post._id}`);
  };

  const remove = async (e) => {
    stop(e);
    const res = await postApi.remove(post._id);
    if (res.success) {
      notifySuccess("Post deleted");
      onChange?.();
    } else {
      notify(res.error || "Could not delete post");
    }
  };

  const openPost = () => {
    if (clickable) navigate(`/status/${post._id}`);
  };

  const images = Array.isArray(post.images) ? post.images : [];

  return (
    <div
      className={Styles.postBox}
      onClick={openPost}
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <div className={Styles.profileContainer}>
        <Link to={`/${sender.username}`} onClick={stop}>
          <img src={sender.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
        </Link>
      </div>
      <div className={Styles.body}>
        <div className={Styles.nameContainer}>
          <Link to={`/${sender.username}`} onClick={stop}>
            <h6 className={Styles.name}>
              {sender.name}
              {sender.verified && <i className="fa-solid fa-circle-check" style={{ color: "rgb(29,155,240)", marginLeft: 4, fontSize: 14 }} />}
            </h6>
          </Link>
          <Link to={`/${sender.username}`} onClick={stop}>
            <p className={Styles.username}>@{sender.username}</p>
          </Link>
          <p className={Styles.dot}>•</p>
          <p className={Styles.timestamp}>{formatPostAge(post.createdAt)}</p>
          {isOwner && (
            <i
              className="fa-solid fa-trash"
              onClick={remove}
              title="Delete post"
              style={{ marginLeft: "auto", color: "rgb(113,118,123)", fontSize: 13 }}
            />
          )}
        </div>
        <div className={Styles.postContainer}>
          {post.message && <div className={Styles.postMessage}>{post.message}</div>}
          {images.length > 0 && (
            <div className={`${Styles.postImages} row row-cols-${images.length > 1 ? 2 : 1}`}>
              {images.map((image, index) => (
                <div
                  key={image + index}
                  className={`col p-1 ${images.length === 3 && index === 0 ? "col-md-12" : ""} d-flex justify-content-center`}
                  style={{ position: "relative" }}
                >
                  <img className={Styles.image} src={image} alt="post" />
                </div>
              ))}
            </div>
          )}
          <div className={Styles.postButtonsContainer}>
            <div className={Styles.repliesContainer} onClick={handleReply}>
              <img src={Replies} alt="" className={`${Styles.postButton}`} />
              <p className={`${Styles.postButtonText}`}>{post.replyCount || 0}</p>
            </div>
            <div
              className={Styles.repostContainer}
              onClick={toggleRepost}
              style={{ color: reposted ? "rgb(0,186,124)" : undefined }}
            >
              <img
                src={Repost}
                alt=""
                className={Styles.postButton}
                style={{ filter: reposted ? "invert(54%) sepia(92%) saturate(1352%) hue-rotate(118deg)" : undefined }}
              />
              <p className={Styles.postButtonText} style={{ color: reposted ? "rgb(0,186,124)" : undefined }}>
                {repostCount}
              </p>
            </div>
            <div className={Styles.likeContainer} onClick={toggleLike}>
              <img src={liked ? LikeSelected : Like} alt="" className={Styles.postButton} />
              <p className={`${Styles.postButtonText} ${liked ? Styles.likeTextSelected : ""}`}>{likeCount}</p>
            </div>
            <div className={Styles.viewsContainer}>
              <img src={Views} alt="" className={Styles.postButton} />
              <p className={Styles.postButtonText}>{post.viewCount || 0}</p>
            </div>
            <div className={Styles.bookmarkAndShareContainer}>
              <img
                src={Bookmark}
                alt=""
                onClick={toggleBookmark}
                className={Styles.postButton}
                style={{ filter: bookmarked ? "invert(54%) sepia(92%) saturate(1352%) hue-rotate(176deg)" : undefined }}
              />
              <img src={Share} alt="" className={Styles.postButton} onClick={share} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
