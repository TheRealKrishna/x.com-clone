import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

import Styles from "../../../css/Home/Components/Profile.module.css";
import BackButton from "../../../Images/backButtonIcon.svg";
import Spinner from "../../../Components/Spinner";
import { authApi, followApi } from "../../../api";

/**
 * Followers / Following / Verified Followers lists for a user.
 * Active sub-tab is derived from the URL suffix.
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

  const isFollowedByMe = (u) => (u.followers || []).includes(user._id) || (user.following || []).includes(u._id);

  const toggle = async (u) => {
    if (isFollowedByMe(u)) await followApi.remove(u._id);
    else await followApi.add(u._id);
    await fetchUser();
    load();
  };

  const renderList = (list) => {
    if (list === null) return <Spinner />;
    if (list.length === 0) {
      return (
        <div className={Styles.verifiedFollowersPageContainer}>
          <h2 className={Styles.verifiedFollowersText}>Nothing to see here yet</h2>
          <p className={Styles.verifiedFollowersFadedText}>When there’s someone to show, they’ll appear here.</p>
        </div>
      );
    }
    return list.map((u) => (
      <div key={u._id} className={Styles.followersItem}>
        <Link to={`/${u.username}`}>
          <div className={Styles.followItemContainer}>
            <div className={Styles.profileImageContainer}>
              <img src={u.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
            </div>
            <div className={Styles.followerInfo}>
              <div className={Styles.followerButtonFlex}>
                <div>
                  <p className={Styles.followerName}>{u.name}</p>
                  <p className={Styles.followerUsername}>@{u.username}</p>
                </div>
              </div>
              <p className={Styles.followerBio}>{u.bio}</p>
            </div>
          </div>
        </Link>
        {u._id !== user._id &&
          (isFollowedByMe(u) ? (
            <button
              type="button"
              onClick={() => toggle(u)}
              onMouseEnter={(e) => (e.currentTarget.innerText = "Unfollow")}
              onMouseLeave={(e) => (e.currentTarget.innerText = "Following")}
              className={`${Styles.followingButton} btn rounded-pill`}
            >
              Following
            </button>
          ) : (
            <button type="button" onClick={() => toggle(u)} className={`${Styles.followButton} btn btn-light rounded-pill`}>
              Follow
            </button>
          ))}
      </div>
    ));
  };

  if (!profile) return <Spinner />;

  return (
    <div className={Styles.nonFullContainer}>
      <div className={Styles.topNameConatiner}>
        <img onClick={() => navigate(`/${profile.username}`)} className={Styles.backButton} src={BackButton} alt="back" />
        <div>
          <h5 className={Styles.topName}>{profile.name}</h5>
          <p className={Styles.topSubName}>@{profile.username}</p>
        </div>
      </div>
      <div className={Styles.header}>
        <div className={Styles.menuSelectorContainer}>
          <div
            onClick={() => navigate(`/${profile.username}/verified_followers`)}
            className={`${Styles.menuSelectorItem} ${sub === "verified" ? Styles.verifiedFollowersItemSelected : ""}`}
          >
            Verified Followers
          </div>
          <div
            onClick={() => navigate(`/${profile.username}/followers`)}
            className={`${Styles.menuSelectorItem} ${sub === "followers" ? Styles.followersItemSelected : ""}`}
          >
            Followers
          </div>
          <div
            onClick={() => navigate(`/${profile.username}/following`)}
            className={`${Styles.menuSelectorItem} ${sub === "following" ? Styles.followingItemSelected : ""}`}
          >
            Following
          </div>
        </div>
      </div>
      <div className={Styles.mainBody}>
        {sub === "verified" ? (
          <div className={Styles.verifiedFollowersPageContainer}>
            <h2 className={Styles.verifiedFollowersText}>@{profile.username} doesn’t have any verified followers.</h2>
            <p className={Styles.verifiedFollowersFadedText}>When someone verified follows this account, they’ll show up here.</p>
          </div>
        ) : sub === "following" ? (
          renderList(following)
        ) : (
          renderList(followers)
        )}
      </div>
    </div>
  );
}
