import React, { useEffect, useState } from "react";

import Spinner from "../../../Components/Spinner";
import PostCard from "../../../Components/PostCard";
import { postApi } from "../../../api";
import Styles from "../../../css/Home/Components/Feature.module.css";

export default function Bookmarks({ user }) {
  const [posts, setPosts] = useState(null);

  const load = async () => {
    const json = await postApi.getBookmarks();
    if (json.success) setPosts(json.posts);
    else setPosts([]);
  };

  useEffect(() => {
    document.title = "Bookmarks / X";
    load();
  }, []);

  if (posts === null) return <Spinner />;

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <div>
          <h2 className={Styles.sectionTitle} style={{ padding: 0 }}>Bookmarks</h2>
          <p className={Styles.muted}>@{user.username}</p>
        </div>
      </div>
      {posts.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgb(113,118,123)" }}>
          <h3 style={{ color: "white" }}>Save posts for later</h3>
          <p>Bookmark posts to easily find them again in the future.</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} currentUser={user} onChange={load} />)
      )}
    </div>
  );
}
