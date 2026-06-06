import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Styles from "../../../css/Home/Components/Profile.module.css";
import BackButton from "../../../Images/backButtonIcon.svg";
import Calender from "../../../Images/Home/Calender.svg";
import ThreeDotsButton from "../../../Images/Home/ThreeDotsButton.svg";
import MessagesIcon from "../../../Images/Home/Messages.svg";
import Notify from "../../../Images/Home/Notify.svg";
import Spinner from "../../../Components/Spinner";
import PostCard from "../../../Components/PostCard";
import ProfileEditModal from "../../../Layout/ProfileEditModal";
import ReplyModal from "./ReplyModal";
import { authApi, followApi, postApi } from "../../../api";
import { formatJoinedDate } from "../../../utils/format";

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "replies", label: "Replies" },
  { key: "media", label: "Media" },
  { key: "likes", label: "Likes" },
];

/**
 * User profile. Handles both /:username and /settings/profile (own profile,
 * which also mounts the edit modal). Decided by comparing to the current user
 * rather than sniffing the path.
 */
export default function Profile({ user, fetchUser, setUser }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const isSettings = !username; // /settings/profile route has no :username param
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [following, setFollowing] = useState(false);

  const targetUsername = isSettings ? user.username : username;
  const isOwn = profile && profile._id === user._id;

  const loadProfile = async () => {
    const json = await authApi.getByUsername(targetUsername);
    if (json.success) {
      setProfile(json.user);
      setFollowing(
        (json.user.followers || []).includes(user._id) || (user.following || []).includes(json.user._id)
      );
      return json.user;
    }
    navigate("/home");
    return null;
  };

  const loadPosts = async (profileId, currentTab) => {
    setPosts(null);
    const json = await postApi.getUserPosts(profileId, currentTab);
    if (json.success) setPosts(json.posts);
    else setPosts([]);
  };

  useEffect(() => {
    setProfile(null);
    setTab("posts");
    loadProfile().then((p) => {
      if (p) {
        document.title = `${p.name} (@${p.username}) / X`;
        loadPosts(p._id, "posts");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUsername]);

  const switchTab = (key) => {
    setTab(key);
    if (profile) loadPosts(profile._id, key);
  };

  const toggleFollow = async () => {
    if (!profile) return;
    if (following) {
      setFollowing(false);
      await followApi.remove(profile._id);
    } else {
      setFollowing(true);
      await followApi.add(profile._id);
    }
    await fetchUser();
    loadProfile();
  };

  if (!profile) return <Spinner />;

  return (
    <div className={Styles.container}>
      <div className={Styles.topNameConatiner}>
        <img onClick={() => navigate("/home")} className={Styles.backButton} src={BackButton} alt="back" />
        <div>
          <h5 className={Styles.topName}>{profile.name}</h5>
          <p className={Styles.topSubName}>@{profile.username}</p>
        </div>
      </div>

      <div className={Styles.profileContainer}>
        <div className={Styles.bannerContainer}>
          {profile.banner?.length > 0 && <img className={Styles.profileBanner} src={profile.banner} alt="banner" />}
        </div>
        <div className={Styles.profilePhotoContainer}>
          <img className={Styles.profilePhoto} src={profile.profile} referrerPolicy="no-referrer" alt="profile" />
        </div>

        {isOwn ? (
          <button onClick={() => navigate("/settings/profile")} className={`${Styles.editProfileButton} btn rounded-pill`}>
            Edit&nbsp;Profile
          </button>
        ) : (
          <div className={Styles.followContainer}>
            <img className={Styles.circleButton} src={ThreeDotsButton} alt="more" />
            <img onClick={() => navigate(`/messages/${profile._id}`)} className={Styles.circleButton} src={MessagesIcon} alt="message" />
            <img className={Styles.circleButton} src={Notify} alt="notify" />
            {following ? (
              <button
                type="button"
                onClick={toggleFollow}
                onMouseEnter={(e) => (e.currentTarget.innerText = "Unfollow")}
                onMouseLeave={(e) => (e.currentTarget.innerText = "Following")}
                className={`${Styles.followingButton} btn rounded-pill`}
              >
                Following
              </button>
            ) : (
              <button type="button" onClick={toggleFollow} className={`${Styles.followButton} btn btn-light rounded-pill`}>
                Follow
              </button>
            )}
          </div>
        )}

        <div className={Styles.profileInfoContainer}>
          <h5 className={Styles.profileInfoName}>
            {profile.name}
            {profile.verified && <i className="fa-solid fa-circle-check" style={{ color: "rgb(29,155,240)", marginLeft: 6, fontSize: 18 }} />}
          </h5>
          <p className={Styles.profileInfoUsername}>@{profile.username}</p>
          {profile.bio?.length > 0 && <p className={Styles.profileInfoBio}>{profile.bio}</p>}
          {profile.location?.length > 0 && (
            <p className={Styles.joinedText} style={{ display: "inline-block", marginRight: 16 }}>
              <i className="fa-solid fa-location-dot" /> {profile.location}
            </p>
          )}
          {profile.website?.length > 0 && (
            <a href={profile.website} target="_blank" rel="noreferrer" className={Styles.followingText} style={{ marginRight: 16 }}>
              <i className="fa-solid fa-link" /> {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <div className={Styles.joinedContainer}>
            <img src={Calender} alt="calendar" className={Styles.calenderIcon} />
            <p className={Styles.joinedText}>Joined {formatJoinedDate(profile.createdAt || profile.joined)}</p>
          </div>
          <div className={Styles.followersContainer}>
            <Link to={`/${profile.username}/following`}>
              <p className={Styles.followingText}>
                <b>{profile.following?.length || 0}</b> Following
              </p>
            </Link>
            <Link to={`/${profile.username}/followers`}>
              <p className={Styles.followersText}>
                <b>{profile.followers?.length || 0}</b> Followers
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Post tabs */}
      <div className={Styles.header}>
        <div className={Styles.menuSelectorContainer}>
          {TABS.map((t) => (
            <div
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`${Styles.menuSelectorItem} ${tab === t.key ? Styles.followingItemSelected : ""}`}
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {posts === null ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgb(113,118,123)" }}>
          {isOwn ? "You haven't" : `@${profile.username} hasn't`} posted in this tab yet.
        </div>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} currentUser={user} onReply={setReplyTarget} onChange={() => switchTab(tab)} />)
      )}

      {isSettings && <ProfileEditModal user={user} fetchUser={fetchUser} setUser={setUser} />}

      {replyTarget && (
        <ReplyModal
          post={replyTarget}
          user={user}
          onClose={() => setReplyTarget(null)}
          onReplied={() => {
            setReplyTarget(null);
            switchTab(tab);
          }}
        />
      )}
    </div>
  );
}
