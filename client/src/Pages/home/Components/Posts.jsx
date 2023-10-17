import React, { useEffect, useState } from 'react'
import Styles from "../../../css/Home/Components/Posts.module.css"
import { Link } from 'react-router-dom';
import spinner from "../../../Images/Spinner.svg"
import spinnerStyles from "../../../css/Spinner.module.css"

export default function Posts(props) {
    const [posts, setPosts] = useState([]);

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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/post/getposts`, {
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
                posts.map((post) => {
                    return (
                        <div className={Styles.postBox}>
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
