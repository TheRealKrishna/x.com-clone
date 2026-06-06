import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Styles from "../../../css/Home/Components/Feature.module.css";
import { Avatar, Spinner, Tabs, EmptyState } from "../../../ui";
import PostCard from "./PostCard";
import { exploreApi } from "../../../api";

/**
 * Explore: a search box (users, posts, #hashtags) plus trending hashtags when
 * idle. Debounced; reads/writes ?q= so results are shareable.
 */
export default function Explore({ user }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get("q") || "");
  const [tab, setTab] = useState("top");
  const [results, setResults] = useState(null);
  const [trends, setTrends] = useState([]);
  const debounce = useRef();

  useEffect(() => {
    document.title = "Explore / X";
    exploreApi.trends().then((j) => j.success && setTrends(j.trends));
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const q = query.trim();
    if (!q) {
      setResults(null);
      setParams({}, { replace: true });
      return;
    }
    debounce.current = setTimeout(async () => {
      setParams({ q }, { replace: true });
      const j = await exploreApi.search(q, "all");
      if (j.success) setResults(j);
    }, 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const showUsers = tab === "top" || tab === "people";
  const showPosts = tab === "top" || tab === "latest";

  return (
    <div className={Styles.container}>
      <div className={Styles.searchHeader}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 18, cursor: "pointer" }}
        >
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div className={Styles.searchBox}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--text-secondary)" }} />
          <input
            autoFocus
            className={Styles.searchInput}
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={Styles.clear} onClick={() => setQuery("")} aria-label="Clear">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {results === null ? (
        <>
          <h2 className={Styles.sectionTitle}>Trends for you</h2>
          {trends.length === 0 ? (
            <EmptyState title="No trends yet" subtitle="Post something with a #hashtag to get trends going." />
          ) : (
            trends.map((t, i) => (
              <div key={t.tag} className={Styles.trend} onClick={() => setQuery(`#${t.tag}`)}>
                <p className={Styles.muted}>{i + 1} · Trending</p>
                <p className={Styles.trendTag}>#{t.tag}</p>
                <p className={Styles.muted}>{t.count} {t.count === 1 ? "post" : "posts"}</p>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <Tabs
            tabs={[
              { key: "top", label: "Top" },
              { key: "latest", label: "Latest" },
              { key: "people", label: "People" },
            ]}
            active={tab}
            onChange={setTab}
          />

          {showUsers && results.users?.length > 0 && (
            <>
              {tab === "top" && <h2 className={Styles.sectionTitle}>People</h2>}
              {results.users.map((u) => (
                <div key={u._id} className={Styles.userRow} onClick={() => navigate(`/${u.username}`)}>
                  <Avatar src={u.profile} size="lg" />
                  <div>
                    <p className={Styles.userName}>
                      {u.name}
                      {u.verified && <i className="fa-solid fa-circle-check" style={{ color: "var(--x-blue)", fontSize: 14 }} />}
                    </p>
                    <p className={Styles.muted}>@{u.username}</p>
                    {u.bio && <p className={Styles.bio}>{u.bio}</p>}
                  </div>
                </div>
              ))}
            </>
          )}

          {showPosts && results.posts?.length > 0 && (
            <>
              {tab === "top" && <h2 className={Styles.sectionTitle}>Posts</h2>}
              {results.posts.map((p) => (
                <PostCard key={p._id} post={p} currentUser={user} />
              ))}
            </>
          )}

          {((showUsers ? results.users?.length || 0 : 0) + (showPosts ? results.posts?.length || 0 : 0)) === 0 && (
            <EmptyState title={`No results for "${query}"`} subtitle="Try searching for something else." />
          )}
        </>
      )}
    </div>
  );
}
