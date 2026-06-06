import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { Header, Tabs, Avatar, Button, Spinner, EmptyState } from "../../../ui";
import { authApi, followApi } from "../../../api";

/**
 * Followers / Verified Followers / Following lists for a user.
 * Active sub-tab is derived from the URL.
 */
export default function Connections({ user, fetchUser }) {
  const { username } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);

  const sub = pathname.endsWith("/following")
    ? "following"
    : pathname.endsWith("/verified_followers")
    ? "verified"
    : "followers";

  const load = async () => {
    const p = await authApi.getByUsername(username);
    if (!p.success) {
      navigate("/home");
      return;
    }
    setProfile(p.user);
    document.title = `People following @${p.user.username} / X`;
    const [f1, f2] = await Promise.all([followApi.getFollowers(p.user._id), followApi.getFollowing(p.user._id)]);
    if (f1.success) setFollowers(f1.followers);
    if (f2.success) setFollowing(f2.following);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const followsMe = (u) => (u.followers || []).includes(user._id) || (user.following || []).includes(u._id);

  const toggle = async (u) => {
    if (followsMe(u)) await followApi.remove(u._id);
    else await followApi.add(u._id);
    await fetchUser();
    load();
  };

  if (!profile) return <Spinner />;

  const list = sub === "following" ? following : sub === "verified" ? [] : followers;

  return (
    <div style={{ minHeight: "100vh", borderRight: "1px solid var(--border)" }}>
      <Header
        title={profile.name}
        subtitle={`@${profile.username}`}
        showBack
        onBack={() => navigate(`/${profile.username}`)}
      />
      <Tabs
        tabs={[
          { key: "verified", label: "Verified Followers" },
          { key: "followers", label: "Followers" },
          { key: "following", label: "Following" },
        ]}
        active={sub}
        onChange={(k) => navigate(`/${profile.username}/${k === "verified" ? "verified_followers" : k}`)}
      />

      {sub === "verified" ? (
        <EmptyState
          title={`@${profile.username} doesn’t have any verified followers`}
          subtitle="When someone with a verified account follows them, they’ll show up here."
        />
      ) : list === null ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState
          title={sub === "following" ? "Not following anyone yet" : "Looking for followers?"}
          subtitle={
            sub === "following"
              ? "Once they follow someone, it’ll show up here."
              : "When someone follows them, they’ll show up here."
          }
        />
      ) : (
        list.map((u) => (
          <div
            key={u._id}
            onClick={() => navigate(`/${u.username}`)}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              cursor: "pointer",
              borderBottom: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Avatar src={u.profile} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    {u.name}
                    {u.verified && (
                      <i className="fa-solid fa-circle-check" style={{ color: "var(--x-blue)", fontSize: 14 }} />
                    )}
                  </p>
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>@{u.username}</p>
                </div>
                {u._id !== user._id &&
                  (followsMe(u) ? (
                    <Button
                      variant="following"
                      hoverLabel="Unfollow"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(u);
                      }}
                    >
                      Following
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(u);
                      }}
                    >
                      Follow
                    </Button>
                  ))}
              </div>
              {u.bio && <p style={{ margin: "4px 0 0", color: "var(--text-primary)" }}>{u.bio}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
