import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Header, Spinner, EmptyState } from "../../../ui";
import PostCard from "./PostCard";
import Composer from "./Composer";
import { postApi } from "../../../api";

/**
 * Single post thread: ancestors (parent chain) → focused post → replies,
 * with an inline reply composer.
 */
export default function PostDetail({ user }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const load = async () => {
    const j = await postApi.getPost(postId);
    if (j.success) setData(j);
    else navigate("/home");
  };

  useEffect(() => {
    setData(null);
    load();
    document.title = "Post / X";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <div style={{ minHeight: "100vh", borderRight: "1px solid var(--border)" }}>
      <Header title="Post" showBack />

      {!data ? (
        <Spinner />
      ) : (
        <>
          {data.ancestors?.map((a) => (
            <PostCard key={a._id} post={a} currentUser={user} onChange={load} />
          ))}

          <PostCard post={data.post} currentUser={user} focused onChange={load} />

          <div style={{ borderBottom: "1px solid var(--border)" }}>
            <Composer user={user} replyTo={data.post} compact onPosted={load} />
          </div>

          {data.replies?.length === 0 ? (
            <EmptyState title="No replies yet" subtitle="Be the first to reply." />
          ) : (
            data.replies.map((r) => <PostCard key={r._id} post={r} currentUser={user} onChange={load} />)
          )}
        </>
      )}
    </div>
  );
}
