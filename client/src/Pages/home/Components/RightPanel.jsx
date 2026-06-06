import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { exploreApi, followApi } from "../../../api";
import Styles from "../../../css/Home/Components/RightPanel.module.css";

/**
 * Right column: search shortcut, "Who to follow" suggestions, and trends.
 */
export default function RightPanel({ user }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [trends, setTrends] = useState([]);

  const loadSuggestions = async () => {
    const json = await followApi.getSuggestions(3);
    if (json.success) setSuggestions(json.suggestions);
  };

  useEffect(() => {
    loadSuggestions();
    exploreApi.trends().then((json) => json.success && setTrends(json.trends.slice(0, 5)));
  }, []);

  const follow = async (id) => {
    await followApi.add(id);
    setSuggestions((prev) => prev.filter((s) => s._id !== id));
    loadSuggestions();
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={Styles.panel}>
      <form onSubmit={onSearch} className={Styles.searchBox}>
        <i className="fa-solid fa-magnifying-glass" style={{ color: "rgb(113,118,123)" }} />
        <input
          className={Styles.searchInput}
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {suggestions.length > 0 && (
        <div className={Styles.card}>
          <h3 className={Styles.cardTitle}>Who to follow</h3>
          {suggestions.map((s) => (
            <div key={s._id} className={Styles.userRow}>
              <div className={Styles.userInfo} onClick={() => navigate(`/${s.username}`)}>
                <img src={s.profile} alt="" referrerPolicy="no-referrer" className={Styles.avatar} />
                <div>
                  <p className={Styles.name}>{s.name}</p>
                  <p className={Styles.muted}>@{s.username}</p>
                </div>
              </div>
              <button className={`btn btn-light rounded-pill ${Styles.followBtn}`} onClick={() => follow(s._id)}>
                Follow
              </button>
            </div>
          ))}
        </div>
      )}

      {trends.length > 0 && (
        <div className={Styles.card}>
          <h3 className={Styles.cardTitle}>Trends for you</h3>
          {trends.map((t) => (
            <div key={t.tag} className={Styles.trendItem} onClick={() => navigate(`/explore?q=${encodeURIComponent("#" + t.tag)}`)}>
              <p className={Styles.muted}>Trending</p>
              <p className={Styles.trendTag}>#{t.tag}</p>
              <p className={Styles.muted}>{t.count} {t.count === 1 ? "post" : "posts"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
