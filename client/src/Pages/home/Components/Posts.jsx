import React, { useEffect, useState } from 'react'
import Styles from "../../../css/Home/Components/Posts.module.css"
import { Link } from 'react-router-dom';
import spinner from "../../../Images/Spinner.svg"
import spinnerStyles from "../../../css/Spinner.module.css"
import Replies from "../../../Images/Home/Posts/Replies.svg"
import Repost from "../../../Images/Home/Posts/Repost.svg"
import Like from "../../../Images/Home/Posts/Like.svg"
import LikeSelected from "../../../Images/Home/Posts/LikeSelected.svg"
import Views from "../../../Images/Home/Posts/Views.svg"
import Bookmark from "../../../Images/Home/Posts/Bookmark.svg"
import Share from "../../../Images/Home/Posts/Share.svg"

export default function Posts(props) {
    const [posts, setPosts] = useState([]);
    // const [renderedPosts, setRenderedPosts] = useState(5);
    const [viewedPosts, setViewedPosts] = useState([]);
    const [viewsUpdateTimeout, setViewsUpdateTimeout] = useState()

    function calculatePostAge(postDate) {
        const postDateTime = new Date(postDate);
        const now = new Date();
        const ageInMilliseconds = now - postDateTime;
        const ageInSeconds = Math.floor(ageInMilliseconds / 1000);

        if (ageInSeconds < 60) {
            return `${ageInSeconds}s`;
        } else if (ageInSeconds < 3600) {
            return `${Math.floor(ageInSeconds / 60)}m`;
        } else if (ageInSeconds < 86400) {
            return `${Math.floor(ageInSeconds / 3600)}h`;
        } else if (ageInSeconds < 7 * 86400) {
            return `${Math.floor(ageInSeconds / 86400)}d`;
        } else {
            const options = {
                month: 'short',
                day: 'numeric',
            };
            if (ageInMilliseconds >= 31536000000) {
                options.year = 'numeric';
            }
            return postDateTime.toLocaleDateString(undefined, options);
        }
    }

    const fetchPosts = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/post/getposts`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("auth-token")
            }
        })
        const json = await response.json();
        if (json.success) {
            setPosts(json.posts);
        }
    }

    const addViewToPost = async (_id) => {
        await fetch(`${process.env.REACT_APP_API_URL}/post/addview`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("auth-token")
            },
            body: JSON.stringify({ _id: _id })
        })
    }

    const addLikeToPost = async (_id) => {
        await fetch(`${process.env.REACT_APP_API_URL}/post/addlike`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("auth-token")
            },
            body: JSON.stringify({ _id: _id })
        }).then(() => fetchPosts())
    }

    const removeLikeFromPost = async (_id) => {
        await fetch(`${process.env.REACT_APP_API_URL}/post/removelike`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("auth-token")
            },
            body: JSON.stringify({ _id: _id })
        }).then(() => fetchPosts())
    }

    // const addToViewedPosts = async (post) => {
    //     if (addViewTimeout) {
    //         clearTimeout(addViewTimeout);
    //     }
    //     if (viewedPosts && post.views && props.user._id) {
    //         if (!viewedPosts.includes(post._id)) {
    //             if (!post.views.includes(props.user._id)) {
    //                 setViewedPosts(prev => [...prev, post._id]);
    //             }
    //         }
    //     }
    //     setAddViewTimeout(setTimeout(() => {
    //         viewedPosts.forEach((_id) => addViewToPosts(_id))
    //         setViewedPosts([]);
    //     }, 5000))
    // }

    const addToViewedPosts = async (post) => {
        if (viewsUpdateTimeout) {
            clearTimeout(viewsUpdateTimeout);
        }
        
        setViewsUpdateTimeout(setTimeout(() => {
            updateViewedPosts.then(()=>fetchPosts().then(()=>setViewedPosts([])))
        }, 5000))
    }

    const updateViewedPosts = async()=>{
        viewedPosts.forEach((_id) => addViewToPost(_id))
    }


    useEffect(() => {
        fetchPosts()
    }, [props.reRenderPosts])


    return (
        <>
            {
                posts.length === 0 ?
                    <div className={spinnerStyles.spinnerContainer}>
                        <img className={spinnerStyles.spinner} src={spinner} alt="O" />
                    </div>
                    :
                    posts.map((post, index) => {
                        return (
                            <div key={index} className={Styles.postBox}>
                                <div className={Styles.profileContainer}>
                                    <Link to={`/${post.sender.username}`}><img src={post.sender.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" /></Link>
                                </div>
                                <div className={Styles.body}>
                                    <div className={Styles.nameContainer}>
                                        <Link to={`/${post.sender.username}`}><h6 className={Styles.name}>{post.sender.name}</h6></Link>
                                        <Link to={`/${post.sender.username}`}><p className={Styles.username}>@{post.sender.username}</p></Link>
                                        <p className={Styles.dot}>•</p>
                                        <p className={Styles.timestamp}>{calculatePostAge(post.timestamp)}</p>
                                    </div>
                                    <div className={Styles.postContainer}>
                                        <div className={Styles.postMessage}>
                                            {post.message}
                                        </div>
                                        <div className={`${Styles.postImages} row row-cols-${post.images.length > 2 ? 2 : 0}`}>
                                            {
                                                post.images && post.images.map((image, index) => {
                                                    return (
                                                        <div key={index} className={`col p-1 ${post.images.length === 3 && index === 0 ? "col-md-12" : ""} d-flex justify-content-center`} style={{ position: "relative" }}>
                                                            <img className={Styles.image} key={image} src={image} alt='postImage' />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                        <div className={Styles.postButtonsContainer}>
                                            <div className={Styles.repliesContainer}>
                                                <img src={Replies} alt="" className={`${Styles.postButton} ${Styles.repliesButton}`} />
                                                <p className={`${Styles.postButtonText} ${Styles.repliesText}`}>{post.replies.length}</p>
                                            </div>
                                            <div className={Styles.repostContainer}>
                                                <img src={Repost} alt="" className={`${Styles.postButton} ${Styles.repostButton}`} />
                                                <p className={`${Styles.postButtonText} ${Styles.repostText}`}>{post.reposts.length}</p>
                                            </div>
                                            <div className={Styles.likeContainer} onClick={() => post.likes.includes(props.user._id) ? removeLikeFromPost(post._id) : addLikeToPost(post._id)}>
                                                <img src={post.likes.includes(props.user._id) ? LikeSelected : Like} alt="" className={`${Styles.postButton} ${Styles.likeButton}`} />
                                                <p className={`${Styles.postButtonText} ${Styles.likeText} ${post.likes.includes(props.user._id) ? Styles.likeTextSelected : ""}`}>{post.likes.length}</p>
                                            </div>
                                            <div className={Styles.viewsContainer}>
                                                <img src={Views} alt="" className={`${Styles.postButton} ${Styles.viewsButton}`} />
                                                <p className={`${Styles.postButtonText} ${Styles.viewsText}`}>{post.views.length}</p>
                                            </div>
                                            <div className={Styles.bookmarkAndShareContainer}>
                                                <img src={Bookmark} alt="" className={`${Styles.postButton} ${Styles.bookmarkButton}`} />
                                                <img src={Share} alt="" className={`${Styles.postButton} ${Styles.shareButton}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
            }
        </>
    )
}
