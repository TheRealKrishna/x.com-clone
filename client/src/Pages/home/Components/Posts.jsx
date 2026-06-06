import React, { useEffect, useRef, useState } from "react";

import spinner from "../../../Images/Spinner.svg";
import spinnerStyles from "../../../css/Spinner.module.css";
import PostCard from "../../../Components/PostCard";
import { postApi } from "../../../api";

/**
 * Renders the post feed. Pulls from postApi.getFeed(filter) unless an explicit
 * `posts` array is provided. Tracks views via IntersectionObserver: when a post
 * scrolls into view it's registered once (debounced, batched) — replacing the
 * old dead views logic that called `.then()` on a plain function.
 */
export default function Posts({ filter, reload, currentUser, onReply, posts: externalPosts }) {
  const [posts, setPosts] = useState(externalPosts || null);
  const viewedRef = useRef(new Set());
  const observerRef = useRef(null);

  const fetchPosts = async () => {
    const json = await postApi.getFeed(filter);
    if (json.success) setPosts(json.posts);
    else setPosts([]);
  };

  useEffect(() => {
    if (externalPosts) {
      setPosts(externalPosts);
      return;
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, reload, externalPosts]);

  // Register a view when a post becomes visible (once per post per session).
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-post-id");
            if (id && !viewedRef.current.has(id)) {
              viewedRef.current.add(id);
              postApi.addView(id);
            }
          }
        });
      },
      { threshold: 0.6 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  const attachObserver = (node) => {
    if (node && observerRef.current) observerRef.current.observe(node);
  };

  if (posts === null) {
    return (
      <div className={spinnerStyles.spinnerContainer}>
        <img className={spinnerStyles.spinner} src={spinner} alt="Loading" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "rgb(113,118,123)" }}>
        Nothing to see here yet.
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <div key={post._id} data-post-id={post._id} ref={attachObserver}>
          <PostCard post={post} currentUser={currentUser} onReply={onReply} onChange={fetchPosts} />
        </div>
      ))}
    </>
  );
}
