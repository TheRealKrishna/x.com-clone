import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Spinner from "../../../Components/Spinner";
import PostCard from "../../../Components/PostCard";
import { exploreApi } from "../../../api";
import Styles from "../../../css/Home/Components/Feature.module.css";

/**
 * Explore page: search box (users + posts + #hashtags) and trending hashtags.
 * Debounces the query; reads/writes ?q= so the URL is shareable.
 */
export default function Explore({ user }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState(null);
  const [trends, setTrends] = useState([]);
  const debounceRef = useRef();

  useEffect(() => {
    document.title = "Explore / X";
    exploreApi.trends().then((json) => json.success && setTrends(json.trends));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length === 0) {
      setResults(null);
      setParams({}, { replace: true });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setParams({ q: query }, { replace: true });
      const json = await exploreApi.search(query.trim(), "all");
      if (json.success) setResults(json);
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <div className={Styles.searchBox}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: "rgb(113,118,123)" }} />
          <input
            className={Styles.searchInput}
            placeholder="Search"
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <i className="fa-solid fa-circle-xmark" style={{ color: "rgb(29,155,240)", cursor: "pointer" }} onClick={() => setQuery("")} />}
        </div>
      </div>

      {results === null ? (
        <div className={Styles.section}>
          <h2 className={Styles.sectionTitle}>Trends for you</h2>
          {trends.length === 0 ? (
            <p className={Styles.muted}>No trends yet. Start posting with #hashtags!</p>
          ) : (
            trends.map((t) => (
              <div key={t.tag} className={Styles.trendItem} onClick={() => setQuery(`#${t.tag}`)}>
                <p className={Styles.muted}>Trending</p>
                <p className={Styles.trendTag}>#{t.tag}</p>
                <p className={Styles.muted}>{t.count} {t.count === 1 ? "post" : "posts"}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {results.users?.length > 0 && (
            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>People</h2>
              {results.users.map((u) => (
                <div key={u._id} className={Styles.userRow} onClick={() => navigate(`/${u.username}`)}>
                  <img src={u.profile} alt="" referrerPolicy="no-referrer" className={Styles.avatar} />
                  <div>
                    <p className={Styles.userName}>{u.name}</p>
                    <p className={Styles.muted}>@{u.username}</p>
                    {u.bio && <p className={Styles.bio}>{u.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {results.posts?.length > 0 && (
            <div>
              <h2 className={Styles.sectionTitle} style={{ padding: "12px 16px" }}>Posts</h2>
              {results.posts.map((p) => (
                <PostCard key={p._id} post={p} currentUser={user} />
              ))}
            </div>
          )}
          {results.users?.length === 0 && results.posts?.length === 0 && (
            <p className={Styles.muted} style={{ padding: 20 }}>
              No results for &quot;{query}&quot;.
            </p>
          )}
        </>
      )}
    </div>
  );
}
