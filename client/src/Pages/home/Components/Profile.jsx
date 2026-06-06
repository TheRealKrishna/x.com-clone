import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClickAwayListener from "react-click-away-listener";

import Styles from "../../../css/Home/Components/Profile.module.css";
import { Avatar, Button, IconButton, Header, Tabs, Spinner, EmptyState } from "../../../ui";
import PostCard from "./PostCard";
import ProfileEditModal from "../../../Layout/ProfileEditModal";
import { authApi, followApi, postApi } from "../../../api";
import { formatJoinedDate } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "replies", label: "Replies" },
  { key: "media", label: "Media" },
  { key: "likes", label: "Likes" },
];

export default function Profile({ user, fetchUser, setUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const isSettings = !username; // /settings/profile has no :username
  const targetUsername = isSettings ? user.username : username;

  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState(null);
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(isSettings);

  const isOwn = profile && profile._id === user._id;

  const loadProfile = async () => {
    const j = await authApi.getByUsername(targetUsername);
    if (!j.success) {
      navigate("/home");
      return null;
    }
    setProfile(j.user);
    setFollowing((j.user.followers || []).includes(user._id) || (user.following || []).includes(j.user._id));
    document.title = `${j.user.name} (@${j.user.username}) / X`;
    return j.user;
  };

  const loadPosts = async (id, t) => {
    setPosts(null);
    const j = await postApi.getUserPosts(id, t);
    setPosts(j.success ? j.posts : []);
  };

  useEffect(() => {
    setProfile(null);
    setTab("posts");
    setEditOpen(isSettings);
    loadProfile().then((p) => p && loadPosts(p._id, "posts"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUsername, isSettings]);

  const switchTab = (key) => {
    setTab(key);
    if (profile) loadPosts(profile._id, key);
  };

  const toggleFollow = async () => {
    const next = !following;
    setFollowing(next);
    if (next) await followApi.add(profile._id);
    else await followApi.remove(profile._id);
    await fetchUser();
    loadProfile();
  };

  if (!profile) return <Spinner />;

  return (
    <div className={Styles.container}>
      <div className={Styles.headerStick}>
        <Header title={profile.name} showBack />
      </div>

      <div className={Styles.banner}>{profile.banner && <img src={profile.banner} alt="" />}</div>

      <div className={Styles.topRow}>
        <div className={Styles.avatarWrap}>
          <Avatar src={profile.profile} size="xxl" />
        </div>
        <div className={Styles.actions}>
          {isOwn ? (
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(true);
                navigate("/settings/profile");
              }}
            >
              Edit profile
            </Button>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <IconButton
                  icon="fa-solid fa-ellipsis"
                  title="More"
                  onClick={() => setMenuOpen((v) => !v)}
                  style={{ border: "1px solid var(--border-strong)" }}
                />
                {menuOpen && (
                  <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 40,
                        background: "var(--bg)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "0 0 14px rgba(255,255,255,0.18)",
                        minWidth: 220,
                        zIndex: 40,
                        padding: "6px 0",
                      }}
                    >
                      {[
                        { icon: "fa-ban", label: `Block @${profile.username}` },
                        { icon: "fa-volume-xmark", label: `Mute @${profile.username}` },
                        { icon: "fa-flag", label: "Report" },
                      ].map((o) => (
                        <div
                          key={o.label}
                          onClick={() => {
                            setMenuOpen(false);
                            notify(`${o.label} — coming soon`);
                          }}
                          style={{ display: "flex", gap: 12, padding: "12px 16px", fontWeight: 700, cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <i className={`fa-solid ${o.icon}`} /> {o.label}
                        </div>
                      ))}
                    </div>
                  </ClickAwayListener>
                )}
              </div>
              <IconButton
                icon="fa-regular fa-envelope"
                title="Message"
                onClick={() => navigate(`/messages/${profile._id}`)}
                style={{ border: "1px solid var(--border-strong)" }}
              />
              {following ? (
                <Button variant="following" hoverLabel="Unfollow" onClick={toggleFollow}>
                  Following
                </Button>
              ) : (
                <Button variant="secondary" onClick={toggleFollow}>
                  Follow
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className={Styles.info}>
        <h2 className={Styles.name}>
          {profile.name}
          {profile.verified && <i className={`fa-solid fa-circle-check ${Styles.verified}`} />}
        </h2>
        <p className={Styles.handle}>@{profile.username}</p>
        {profile.bio && <p className={Styles.bio}>{profile.bio}</p>}
        <div className={Styles.meta}>
          {profile.location && (
            <span className={Styles.metaItem}>
              <i className="fa-solid fa-location-dot" /> {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              className={Styles.metaItem}
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-solid fa-link" /> {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span className={Styles.metaItem}>
            <i className="fa-regular fa-calendar" /> Joined {formatJoinedDate(profile.createdAt || profile.joined)}
          </span>
        </div>
        <div className={Styles.counts}>
          <Link to={`/${profile.username}/following`}>
            <b>{profile.following?.length || 0}</b> Following
          </Link>
          <Link to={`/${profile.username}/followers`}>
            <b>{profile.followers?.length || 0}</b> Followers
          </Link>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={switchTab} />

      {posts === null ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState
          title={isOwn ? "You haven’t posted here yet" : `@${profile.username} hasn’t posted here`}
          subtitle={tab === "likes" ? "Liked posts will show up here." : "When there are posts, they’ll show up here."}
        />
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} currentUser={user} onChange={() => switchTab(tab)} />)
      )}

      {isSettings && (
        <ProfileEditModal
          open={editOpen}
          user={user}
          fetchUser={fetchUser}
          setUser={setUser}
          onClose={() => {
            setEditOpen(false);
            navigate(`/${user.username}`);
          }}
        />
      )}
    </div>
  );
}
