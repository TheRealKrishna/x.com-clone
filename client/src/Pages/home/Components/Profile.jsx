import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import Styles from "../../../css/Home/Components/Profile.module.css"
import BackButton from "../../../Images/backButtonIcon.svg"
import Calender from "../../../Images/Home/Calender.svg"
import ThreeDotsButton from "../../../Images/Home/ThreeDotsButton.svg"
import Messages from "../../../Images/Home/Messages.svg"
import Notify from "../../../Images/Home/Notify.svg"
import Spinner from "../../../Components/Spinner"

export default function Profile(props) {
    const [profile, setProfile] = useState({});
    const navigate = useNavigate()
    const { username } = useParams();
    const [followers, setFollowers] = useState(false)
    const [following, setFollowing] = useState(false)

    function calculateJoinedDate(postDate) {
        const postDateTime = new Date(postDate);
        const options = {
            month: "long",
            year: 'numeric'
        }
        return postDateTime.toLocaleDateString(undefined, options);
    }

    const fetchProfile = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/getuserinfowithusername`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: username })
        })
        const json = await response.json();
        if (json.success) {
            setProfile(json.user);
            return json.user
        }
        else {
            navigate("/home")
        }
    }

    const fetchFollowers = async (profile) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/follow/getfollowers`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ _id: profile?._id })
        })
        const json = await response.json();
        if (json.success) {
            setFollowers(json.followers)
        }
    }

    const fetchFollowing = async (profile) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/follow/getfollowing`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ _id: profile?._id })
        })
        const json = await response.json();
        if (json.success) {
            setFollowing(json.following)
        }
    }

    useEffect(() => {
        if (profile.name && profile.username) {
            document.title = `${profile.name} (@${profile.username}) / X`;
        }
    }, [profile])

    const addFollower = async (_id) => {
        await fetch(`${process.env.REACT_APP_API_URL}/api/follow/addfollower`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ _id: _id })
        }).then(() => {
            props.fetchUser();
            fetchProfile().then((profile) => {
                fetchFollowers(profile)
                fetchFollowing(profile)
            })
        })
    }

    const removeFollower = async (_id) => {
        await fetch(`${process.env.REACT_APP_API_URL}/api/follow/removefollower`, {
            method: "post",
            headers: {
                "authtoken": localStorage.getItem("auth-token"),
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ _id: _id })
        }).then(() => {
            props.fetchUser();
            fetchProfile().then((profile) => {
                fetchFollowers(profile)
                fetchFollowing(profile)
            })
        })
    }

    useEffect(() => {
        setProfile({})
        fetchProfile().then((profile) => {
            fetchFollowers(profile)
            fetchFollowing(profile)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username])

    useEffect(() => {
        fetchProfile().then((profile) => {
            fetchFollowers(profile)
            fetchFollowing(profile)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location.pathname])


    if (window.location.pathname.endsWith("/verified_followers") || window.location.pathname.endsWith("/followers") || window.location.pathname.endsWith("/following")) {
        return (
            <div className={Styles.nonFullContainer}>
                <div className={Styles.topNameConatiner}>
                    <img onClick={() => { navigate(`/${profile.username}`) }} className={Styles.backButton} src={BackButton} alt='backButton' />
                    <div>
                        <h5 className={Styles.topName}>{profile.name?.length === 0 ? "Profile" : profile.name}</h5>
                        <p className={Styles.topSubName}>@{profile.username}</p>
                    </div>
                </div>
                <div className={Styles.header}>
                    <div className={Styles.menuSelectorContainer}>
                        <div onClick={() => navigate(`/${profile.username}/verified_followers`)} className={`${Styles.menuSelectorItem} ${window.location.pathname.endsWith("/verified_followers") ? Styles.verifiedFollowersItemSelected : ""}`}>Verified Followers</div>
                        <div onClick={() => navigate(`/${profile.username}/followers`)} className={`${Styles.menuSelectorItem} ${window.location.pathname.endsWith("/followers") ? Styles.followersItemSelected : ""}`}>Followers</div>
                        <div onClick={() => navigate(`/${profile.username}/following`)} className={`${Styles.menuSelectorItem} ${window.location.pathname.endsWith("/following") ? Styles.followingItemSelected : ""}`}>Following</div>
                    </div>
                </div>
                <div className={Styles.mainBody}>
                    {
                        window.location.pathname.endsWith("/verified_followers") ?
                            <div className={Styles.verifiedFollowersPageContainer}>
                                <h2 className={Styles.verifiedFollowersText}>@{profile.username} doesn’t have any verified followers.</h2>
                                <p className={Styles.verifiedFollowersFadedText}>When someone verified follows this account, they’ll show up here.</p>
                            </div>
                            :
                            window.location.pathname.endsWith("/followers") ?
                                <div className={Styles.followersPageContainer}>
                                    {
                                        !followers ? <Spinner /> :
                                            followers.length > 0 ?
                                                followers.map((follower) => {
                                                    return (
                                                        <div key={follower._id} className={Styles.followersItem}>
                                                            <Link to={`/${follower.username}`}>
                                                                <div className={Styles.followItemContainer}>
                                                                    <div className={Styles.profileImageContainer}>
                                                                        <img src={follower.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
                                                                    </div>
                                                                    <div className={Styles.followerInfo}>
                                                                        <div className={Styles.followerButtonFlex}>
                                                                            <div>
                                                                                <p className={Styles.followerName}>{follower.name}</p>
                                                                                <p className={Styles.followerUsername}>@{follower.username}</p>
                                                                            </div>
                                                                        </div>
                                                                        <p className={Styles.followerBio}>{follower.bio}</p>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                            {
                                                                follower.followers?.includes(props.user._id) || props.user.following?.includes(follower._id) ?
                                                                    follower._id !== props.user._id ?
                                                                        <button type='button' onClick={() => removeFollower(follower._id)} className={`${Styles.followingButton} btn rounded-pill`} onMouseEnter={(e) => { e.currentTarget.innerText = "Unfollow" }} onMouseLeave={(e) => e.currentTarget.innerText = "Following"} >Following</button>
                                                                        : null :
                                                                    follower._id !== props.user._id ?
                                                                        <button type='button' onClick={() => addFollower(follower._id)} className={`${Styles.followButton} btn btn-light rounded-pill`}>Follow</button>
                                                                        : null
                                                            }
                                                        </div>
                                                    )
                                                })
                                                :
                                                <div className={Styles.verifiedFollowersPageContainer}>
                                                    <h2 className={Styles.verifiedFollowersText}>Looking for followers?</h2>
                                                    <p className={Styles.verifiedFollowersFadedText}>When someone follows this account, they’ll show up here. Posting and interacting with others helps boost followers.</p>
                                                </div>
                                    }
                                </div>
                                :
                                window.location.pathname.endsWith("/following") ?
                                    <div className={Styles.followingPageContianer}>
                                        {
                                            !following ? <Spinner /> :
                                            following.length > 0 ?
                                                following.map((follower) => {
                                                    return (
                                                        <div key={follower._id} className={Styles.followersItem}>
                                                            <Link to={`/${follower.username}`}>
                                                                <div className={Styles.followItemContainer}>
                                                                    <div className={Styles.profileImageContainer}>
                                                                        <img src={follower.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
                                                                    </div>
                                                                    <div className={Styles.followerInfo}>
                                                                        <div className={Styles.followerButtonFlex}>
                                                                            <div>
                                                                                <p className={Styles.followerName}>{follower.name}</p>
                                                                                <p className={Styles.followerUsername}>@{follower.username}</p>
                                                                            </div>
                                                                        </div>
                                                                        <p className={Styles.followerBio}>{follower.bio}</p>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                            {
                                                                follower.followers?.includes(props.user._id) || props.user.following?.includes(follower._id) ?
                                                                    follower._id !== props.user._id ?
                                                                        <button type='button' onClick={() => removeFollower(follower._id)} className={`${Styles.followingButton} btn rounded-pill`} onMouseEnter={(e) => { e.currentTarget.innerText = "Unfollow" }} onMouseLeave={(e) => e.currentTarget.innerText = "Following"} >Following</button>
                                                                        : null :
                                                                    follower._id !== props.user._id ?
                                                                        <button type='button' onClick={() => addFollower(follower._id)} className={`${Styles.followButton} btn btn-light rounded-pill`}>Follow</button>
                                                                        : null
                                                            }
                                                        </div>
                                                    )
                                                })
                                                :
                                                <div className={Styles.verifiedFollowersPageContainer}>
                                                    <h2 className={Styles.verifiedFollowersText}>@{profile.username} isn’t following anyone</h2>
                                                    <p className={Styles.verifiedFollowersFadedText}>Once they follow accounts, they’ll show up here.</p>
                                                </div>
                                        }
                                    </div>
                                    :
                                    navigate(`/${profile.username}`)
                    }
                </div>
            </div >
        )
    }
    else {
        return (
            !profile.username ? <Spinner /> :
                <div className={Styles.container}>
                    <div className={Styles.topNameConatiner}>
                        <img onClick={() => { window.history.back() }} className={Styles.backButton} src={BackButton} alt='backButton' />
                        <h5 className={Styles.topName}>{profile.name?.length === 0 ? "Profile" : profile.name}</h5>
                    </div>
                    <div className={Styles.profileContainer}>
                        <div className={Styles.bannerContainer}>
                            {
                                profile.banner?.length > 0 ? <img className={Styles.profileBanner} src={profile.banner} alt="profileBanner" /> : null
                            }
                        </div>
                        <div className={Styles.profilePhotoContainer}>
                            <img className={Styles.profilePhoto} src={profile.profile} alt="profileImage" />
                        </div>
                        {
                            props.user._id === profile._id ?
                                <button className={`${Styles.editProfileButton} btn rounded-pill`}>Edit&nbsp;Profile</button>
                                :
                                <div className={Styles.followContainer}>
                                    <img className={Styles.circleButton} src={ThreeDotsButton} alt='ThreeDotsButton' />
                                    {
                                        profile.followers?.includes(props.user._id) || props.user.following?.includes(profile._id) ?
                                            <>
                                                <img className={Styles.circleButton} src={Messages} alt='ThreeDotsButton' />
                                                <img className={Styles.circleButton} src={Notify} alt='ThreeDotsButton' />
                                                <button type='button' onClick={() => removeFollower(profile._id)} onMouseEnter={(e) => { e.currentTarget.innerText = "Unfollow" }} onMouseLeave={(e) => e.currentTarget.innerText = "Following"} className={`${Styles.followingButton} btn rounded-pill`}>Following</button>
                                            </>
                                            :
                                            <button type='button' onClick={() => addFollower(profile._id)} className={`${Styles.followButton} btn btn-light rounded-pill`}>Follow</button>
                                    }
                                </div>
                        }
                        <div className={Styles.profileInfoContainer}>
                            <h5 className={Styles.profileInfoName}>{profile.name}</h5>
                            <p className={Styles.profileInfoUsername}>@{profile.username}</p>
                            {
                                profile.bio?.length > 0 ?
                                    <p className={Styles.profileInfoBio}>{profile.bio}</p>
                                    : null
                            }
                            <div className={Styles.joinedContainer}>
                                <img src={Calender} alt="calender" className={Styles.calenderIcon} />
                                <p className={Styles.joinedText}>Joined {calculateJoinedDate(profile.joined)}</p>
                            </div>
                            <div className={Styles.followersContainer}>
                                <Link to={`/${profile.username}/following`}>
                                    <p className={Styles.followingText}><b>{profile.following?.length}</b> Following</p>
                                </Link>
                                <Link to={`/${profile.username}/followers`}>
                                    <p className={Styles.followersText}><b>{profile.followers?.length}</b> Followers</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
        )
    }
}