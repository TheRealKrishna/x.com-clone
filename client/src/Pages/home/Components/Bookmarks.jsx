import React, { useEffect, useState } from "react";

import { Header, Spinner, EmptyState } from "../../../ui";
import PostCard from "./PostCard";
import { postApi } from "../../../api";

export default function Bookmarks({ user }) {
  const [posts, setPosts] = useState(null);

  const load = async () => {
    const j = await postApi.getBookmarks();
    setPosts(j.success ? j.posts : []);
  };

  useEffect(() => {
    document.title = "Bookmarks / X";
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", borderRight: "1px solid var(--border)" }}>
      <Header title="Bookmarks" subtitle={`@${user.username}`} />
      {posts === null ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="fa-solid fa-bookmark"
          title="Save posts for later"
          subtitle="Bookmark posts to easily find them again in the future."
        />
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} currentUser={user} onChange={load} />)
      )}
    </div>
  );
}
