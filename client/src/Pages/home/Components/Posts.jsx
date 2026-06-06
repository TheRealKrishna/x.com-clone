import React, { useEffect, useRef, useState } from "react";

import { Spinner, EmptyState } from "../../../ui";
import PostCard from "./PostCard";
import { postApi } from "../../../api";

/**
 * Post list. Pulls from postApi.getFeed(filter) unless an explicit `posts`
 * array is provided. Registers a view (once each) when a post scrolls into
 * view via IntersectionObserver.
 */
export default function Posts({ filter, reload, currentUser, posts: externalPosts, emptyTitle, emptySubtitle }) {
  const [posts, setPosts] = useState(externalPosts || null);
  const viewed = useRef(new Set());
  const observer = useRef(null);

  const fetchPosts = async () => {
    const j = await postApi.getFeed(filter);
    setPosts(j.success ? j.posts : []);
  };

  useEffect(() => {
    if (externalPosts) {
      setPosts(externalPosts);
      return;
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, reload, externalPosts]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id && !viewed.current.has(id)) {
              viewed.current.add(id);
              postApi.addView(id);
            }
          }
        });
      },
      { threshold: 0.6 }
    );
    return () => observer.current?.disconnect();
  }, []);

  const attach = (node) => node && observer.current?.observe(node);

  if (posts === null) return <Spinner />;
  if (posts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || "Nothing to see here — yet"}
        subtitle={emptySubtitle || "When there are posts, they’ll show up here."}
      />
    );
  }

  return (
    <>
      {posts.map((post) => (
        <div key={post._id} data-id={post._id} ref={attach}>
          <PostCard post={post} currentUser={currentUser} onChange={fetchPosts} />
        </div>
      ))}
    </>
  );
}
