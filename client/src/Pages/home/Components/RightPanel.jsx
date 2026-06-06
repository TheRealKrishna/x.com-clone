import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Styles from "../../../css/Home/Components/RightPanel.module.css";
import { exploreApi, followApi } from "../../../api";
import { Avatar, Button } from "../../../ui";

const FOOTER = ["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility", "Ads info", "More"];

/**
 * Right column: search shortcut, "Who to follow" suggestions, and trends.
 * Hidden under 1024px via the layout's rightPanelSmall flex rule.
 */
export default function RightPanel({ user }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [trends, setTrends] = useState([]);

  const loadSuggestions = async () => {
    const j = await followApi.getSuggestions(3);
    if (j.success) setSuggestions(j.suggestions);
  };

  useEffect(() => {
    loadSuggestions();
    exploreApi.trends().then((j) => j.success && setTrends(j.trends.slice(0, 5)));
  }, []);

  const follow = async (id) => {
    setSuggestions((prev) => prev.filter((s) => s._id !== id));
    await followApi.add(id);
    loadSuggestions();
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <aside className={Styles.panel}>
      <form onSubmit={onSearch} className={Styles.searchForm}>
        <div className={Styles.searchBox}>
          <i className={`fa-solid fa-magnifying-glass ${Styles.searchIcon}`} />
          <input
            className={Styles.searchInput}
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className={Styles.card}>
          <h2 className={Styles.cardTitle}>Who to follow</h2>
          {suggestions.map((s) => (
            <div key={s._id} className={Styles.row}>
              <div className={Styles.rowInfo} onClick={() => navigate(`/${s.username}`)}>
                <Avatar src={s.profile} size="md" />
                <div className={Styles.names}>
                  <p className={Styles.name}>
                    {s.name}
                    {s.verified && (
                      <i className="fa-solid fa-circle-check" style={{ color: "var(--x-blue)", fontSize: 14 }} />
                    )}
                  </p>
                  <p className={Styles.handle}>@{s.username}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => follow(s._id)}>
                Follow
              </Button>
            </div>
          ))}
          <span className={Styles.showMore} onClick={() => navigate("/explore")}>
            Show more
          </span>
        </div>
      )}

      {trends.length > 0 && (
        <div className={Styles.card}>
          <h2 className={Styles.cardTitle}>What&apos;s happening</h2>
          {trends.map((t, i) => (
            <div
              key={t.tag}
              className={Styles.trend}
              onClick={() => navigate(`/explore?q=${encodeURIComponent("#" + t.tag)}`)}
            >
              <p className={Styles.trendMeta}>Trending{i === 0 ? " · Trending now" : ""}</p>
              <p className={Styles.trendTag}>#{t.tag}</p>
              <p className={Styles.trendMeta}>
                {t.count} {t.count === 1 ? "post" : "posts"}
              </p>
            </div>
          ))}
          <span className={Styles.showMore} onClick={() => navigate("/explore")}>
            Show more
          </span>
        </div>
      )}

      <div className={Styles.footer}>
        {FOOTER.map((f) => (
          <span key={f}>{f}</span>
        ))}
        <span>© 2025 X Clone</span>
      </div>
    </aside>
  );
}
