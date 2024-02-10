import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../../css/Home/Components/Home.module.css"
import Globe from "../../../Images/Home/Globe.svg"
import Gallery from "../../../Images/Home/Gallery.svg"
import Gif from "../../../Images/Home/Gif.svg"
import Poll from "../../../Images/Home/Poll.svg"
import Emoji from "../../../Images/Home/Emoji.svg"
import Schedule from "../../../Images/Home/Schedule.svg"
import Location from "../../../Images/Home/Location.svg"
import CrossButton from "../../../Images/Home/CrossButton.svg"
import Plus from "../../../Images/Home/Plus.svg"
import Posts from './Posts'
import toast from 'react-hot-toast';
import ProgressBar from 'react-bootstrap/ProgressBar';
import EmojiPicker, { Theme, SkinTones } from 'emoji-picker-react';
import ClickAwayListener from 'react-click-away-listener';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Link } from 'react-router-dom'


export default function Home(props) {
    const [currentMenu, setCurrentMenu] = useState("For You")
    const [post, setPost] = useState({ message: '', images: [], audience: "Everyone", whoCanReply: "Everyone can reply" });
    const postTextInput = useRef();
    const audienceSelector = useRef();
    const whoCanReplySelector = useRef();
    const [images, setImages] = useState([]);
    const postButton = useRef();
    const [posting, setPosting] = useState(false)
    const [postingProgress, setPostingProgress] = useState(0)
    const postForm = useRef();
    const [reRenderPosts, setReRenderPosts] = useState(1)
    const [emojiPicker, setEmojiPicker] = useState(false)
    const circularProgressContainer = useRef()

    const handlePostTextChange = async (e) => {
        setPost(prev => { return { ...prev, message: e.target.value } });
        fixPostInputTextArea();
    }

    const fixPostInputTextArea = async()=>{
        postTextInput.current.style.height = 'auto';
        const computedStyle = window.getComputedStyle(postTextInput.current);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const padding = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        const scrollHeight = postTextInput.current.scrollHeight - padding;
        postTextInput.current.style.height = (scrollHeight < lineHeight ? lineHeight : scrollHeight) + 'px';
    }

    const toggleEmojiPicker = async () => {
        setEmojiPicker(!emojiPicker)
    }

    const onEmojiClick = async (emojiData, e) => {
        setPost(prev => { return { ...prev, message: prev.message + emojiData.emoji } })
    }

    const onImageUpload = async (e) => {
        if (images.length <= 4) {
            const selectedImages = e.target.files;

            if (selectedImages.length > 4) {
                toast('Sorry, Please choose up to 4 photos!', {
                    style: {
                        border: '1px solid white',
                        padding: '16px 30px',
                        color: 'white',
                        backgroundColor: "rgb(29, 155, 240)",
                    }
                });
                return;
            }

            const loadImage = (image) => {
                return new Promise((resolve) => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(image);
                    fileReader.onload = () => {
                        resolve(fileReader.result);
                    };
                });
            };

            const loadedImages = await Promise.all(Array.from(selectedImages).map(loadImage));

            const updatedImages = [...images, ...loadedImages].slice(0, 4);
            const updatedPostImages = [...post.images, ...selectedImages].slice(0, 4);

            setImages(updatedImages);
            setPost({ ...post, images: updatedPostImages });
        } else {
            toast('Sorry, Please choose up to 4 photos!', {
                style: {
                    border: '1px solid white',
                    padding: '16px 30px',
                    color: 'white',
                    backgroundColor: "rgb(29, 155, 240)",
                }
            });
        }
    };

    const onImageRemove = (index) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);

        const updatedPostImages = [...post.images];
        updatedPostImages.splice(index, 1);

        setImages(updatedImages);
        setPost({ ...post, images: updatedPostImages });
    }

    useEffect(() => {
        if (postForm.current) {
            postForm.current.addEventListener('click', () => {
                setTimeout(() => {
                    if (postForm.current) {
                        whoCanReplySelector.current.style.display = "block"
                    }
                }, 300);
                setTimeout(() => {
                    if (postForm.current) {
                        audienceSelector.current.style.display = "block"
                    }
                }, 500)
            })
        }
    }, [postForm])

    useEffect(() => {
        fixPostInputTextArea();
        if ((post.message.trim().length === 0 && images.length === 0) || post.message.length > 280) {
            postButton.current.disabled = true;
        }
        else {
            postButton.current.disabled = false;
        }
        if (post.message.length > 259) {
            circularProgressContainer.current.children[0].style.width = "30px";
            circularProgressContainer.current.children[0].style.height = "30px"; circularProgressContainer.current.style.width = "40px";
            circularProgressContainer.current.style.height = "28px";
        }
        else {
            circularProgressContainer.current.children[0].style.width = "22px";
            circularProgressContainer.current.children[0].style.height = "22px";
            circularProgressContainer.current.style.width = "35px";
            circularProgressContainer.current.style.height = "28px";
        }
    }, [postButton, images, post])

    const uploadImage = async (image) => {
        const data = new FormData();
        data.append("file", image);
        data.append(
            "upload_preset", "eaajn3c2"
        );
        data.append("cloud_name", "dy72jxgzz");
        data.append("folder", "Cloudinary-React");
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dy72jxgzz/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );
        const json = await response.json();
        return json.url
    };

    const handlePostSubmit = async (e) => {
        setPosting(true)
        e.preventDefault();
        const uploadedImageUrls = [];
        if (post.images.length > 0) {
            setPostingProgress(25)
        }
        for (const image of post.images) {
            const imageUrl = await uploadImage(image);
            if (imageUrl) {
                uploadedImageUrls.push(imageUrl);
            }
        }
        if (post.images.length > 0) {
            setPostingProgress(50)
        }
        else {
            setPostingProgress(25)
        }
        setPost(prev => { return { ...prev, images: uploadedImageUrls } })
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/post/addpost`, {
            method: "post",
            body: JSON.stringify({ ...post, images: uploadedImageUrls }),
            headers: {
                "Content-Type": "application/json",
                "authToken": localStorage.getItem("auth-token")
            }
        })
        setPostingProgress(75)
        const json = await response.json();
        if (json.success) {
            setPostingProgress(100)
        }
        setTimeout(() => {
            setImages([]);
            setPost({ message: '', audience: "Everyone", whoCanReply: "Everyone can reply", images: [] })
            setPosting(false)
            setPostingProgress(0)
            setReRenderPosts(prev => prev + 1)
        }, 1000)
    }

    return (
        <div className={Styles.container}>
            <div className={Styles.header}>
                <div className={Styles.menuSelectorContainer}>
                    <div onClick={() => setCurrentMenu("For You")} className={`${Styles.menuSelectorItem} ${currentMenu === "For You" ? Styles.forYouSelected : ""}`}>For&nbsp;you</div>
                    <div onClick={() => setCurrentMenu("Following")} className={`${Styles.menuSelectorItem} ${currentMenu === "Following" ? Styles.followingItemSelected : ""}`}>Following</div>
                </div>
            </div>
            {
                posting && <ProgressBar now={postingProgress} className={Styles.progressBar} />
            }
            <div className={Styles.body}>
                <form onSubmit={handlePostSubmit}>
                    <div ref={postForm} className={`${Styles.makePostContainer} ${posting ? Styles.makePostContainerLoading : ""}`}>
                        <div className={Styles.profileImageContainer}>
                            <Link to={`/${props.user.username}`}><img src={props.user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" /></Link>
                        </div>
                        <div className={Styles.postBox}>
                            <button type='button' ref={audienceSelector} style={{ display: "none" }} className={Styles.audienceSelectorButton}>{post.audience} <i className="fa-solid fa-angle-down"></i></button>
                            <div className={Styles.postTextBox}>
                                <textarea id="postTextInput" rows="1" ref={postTextInput} onChange={handlePostTextChange} type="text" value={post.message} className={Styles.postTextInput} placeholder='What is happening?!' />
                            </div>
                            <div className={`${Styles.imageContainer} row row-cols-${images.length > 2 ? 2 : 0}`}>
                                {
                                    images.map((image, index) => {
                                        return (
                                            <div key={index} className={`col p-1 ${images.length === 3 && index === 0 ? "col-md-12" : ""} d-flex justify-content-center`} style={{ position: "relative" }}>
                                                <img src={CrossButton} alt="CrossButton" className={Styles.CrossButton} onClick={() => onImageRemove(index)} />
                                                <img className={Styles.image} src={image} alt='postImage' />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <p ref={whoCanReplySelector} style={{ display: "none" }} className={Styles.whoCanReplySelector}><img className={Styles.whoCanReplySelectorGlobeIcon} src={Globe} alt='globe' />{post.whoCanReply}</p>
                            <div className={Styles.postIconsAndSubmitContainer}>
                                <div className={Styles.postIconsContainer}>
                                    <label name='image'><img src={Gallery} className={`${Styles.postIcon} ${images.length < 4 ? "" : Styles.postIconDisabled}`} alt="Gallery" />
                                        <input name='image' style={{ display: "none" }} type="file" accept="image/*" onChange={onImageUpload} multiple /></label>
                                    <img src={Gif} className={Styles.postIcon} alt="Gif" />
                                    <img src={Poll} className={Styles.postIcon} alt="Poll" />
                                    <img onClick={toggleEmojiPicker} src={Emoji} className={Styles.postIcon} alt="Emoji" />
                                    {
                                        emojiPicker && <ClickAwayListener onClickAway={toggleEmojiPicker}>
                                            <div className={Styles.emojiPicker}><EmojiPicker defaultSkinTone={SkinTones.MEDIUM_LIGHT} theme={Theme.DARK} onEmojiClick={onEmojiClick} /></div>
                                        </ClickAwayListener>
                                    }
                                    <img src={Schedule} className={Styles.postIcon} alt="Schedule" />
                                    <img src={Location} className={`${Styles.postIcon} ${Styles.postIconDisabled}`} alt="Location" />
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div ref={circularProgressContainer} style={{ display: post.message.length > 0 ? "block" : "none" }} className={Styles.circleProgressContainer}>
                                        <CircularProgressbar styles={buildStyles({
                                            textSize: "40px",
                                            trailColor: "rgb(83, 100, 113)",
                                            pathColor: post.message.length > 259 ? post.message.length >= 280 ? "rgb(244, 33, 46)" : "rgb(255, 212, 0)" : "rgb(29, 155, 240)",
                                            textColor: post.message.length >= 280 ? "rgb(244, 33, 46)" : "rgb(83, 100, 113)"
                                        })} strokeWidth={10} minValue={0} maxValue={280} value={post.message.length} text={`${post.message.length > 259 ? 280 - post.message.length : ""}`} />
                                    </div>
                                    <img src={Plus} style={{ border: "0.001em solid rgb(29, 155, 240)", borderRadius: "50%", display: post.message.length > 0 ? "block" : "none" }} className={Styles.postIcon} alt="Plus" />
                                    <button type='submit' ref={postButton} className={`${Styles.postButton} btn btn-primary rounded-pill`} disabled>Post</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <Posts reRenderPosts={reRenderPosts} user={props.user} fetchUser={props.fetchUser} />
            </div>
        </div >
    )
}
