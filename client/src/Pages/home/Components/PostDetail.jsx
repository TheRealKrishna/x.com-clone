import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Styles from "../../../css/Home/Components/Profile.module.css";
import BackButton from "../../../Images/backButtonIcon.svg";
import Spinner from "../../../Components/Spinner";
import PostCard from "../../../Components/PostCard";
import ReplyModal from "./ReplyModal";
import { postApi } from "../../../api";

/**
 * Single post thread view: ancestors (parent chain) → the focused post →
 * its replies. Opening any post navigates here via /status/:postId.
 */
export default function PostDetail({ user }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);

  const load = async () => {
    const json = await postApi.getPost(postId);
    if (json.success) setData(json);
    else navigate("/home");
  };

  useEffect(() => {
    setData(null);
    load();
    document.title = "Post / X";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (!data) return <Spinner />;

  return (
    <div className={Styles.container}>
      <div className={Styles.topNameConatiner}>
        <img onClick={() => navigate(-1)} className={Styles.backButton} src={BackButton} alt="back" />
        <h5 className={Styles.topName}>Post</h5>
      </div>

      {data.ancestors?.map((a) => (
        <PostCard key={a._id} post={a} currentUser={user} onChange={load} />
      ))}

      {/* Focused post (not clickable to itself) */}
      <PostCard post={data.post} currentUser={user} clickable={false} onReply={() => setReplyOpen(true)} onChange={load} />

      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgb(47,51,54)", color: "rgb(113,118,123)" }}>
        <button className="btn btn-primary rounded-pill" onClick={() => setReplyOpen(true)}>
          Post your reply
        </button>
      </div>

      {data.replies?.length === 0 ? (
        <div style={{ padding: "30px 16px", textAlign: "center", color: "rgb(113,118,123)" }}>
          No replies yet. Be the first.
        </div>
      ) : (
        data.replies.map((r) => <PostCard key={r._id} post={r} currentUser={user} onChange={load} />)
      )}

      {replyOpen && (
        <ReplyModal
          post={data.post}
          user={user}
          onClose={() => setReplyOpen(false)}
          onReplied={() => {
            setReplyOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
