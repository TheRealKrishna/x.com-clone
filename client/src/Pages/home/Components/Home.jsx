import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";
import EmojiPicker, { Theme, SkinTones } from "emoji-picker-react";
import ClickAwayListener from "react-click-away-listener";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import Styles from "../../../css/Home/Components/Home.module.css";
import Gallery from "../../../Images/Home/Gallery.svg";
import Gif from "../../../Images/Home/Gif.svg";
import Poll from "../../../Images/Home/Poll.svg";
import Emoji from "../../../Images/Home/Emoji.svg";
import Schedule from "../../../Images/Home/Schedule.svg";
import Location from "../../../Images/Home/Location.svg";
import CrossButton from "../../../Images/Home/CrossButton.svg";
import Posts from "./Posts";
import ReplyModal from "./ReplyModal";
import { postApi } from "../../../api";
import { uploadImage, fileToDataUrl } from "../../../utils/upload";
import { notify } from "../../../utils/toast";

const MAX_CHARS = 280;

export default function Feed({ user }) {
  const [tab, setTab] = useState("forYou"); // "forYou" | "following"
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]); // { file, preview }
  const [posting, setPosting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reload, setReload] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const textRef = useRef();

  const remaining = MAX_CHARS - message.length;
  const canPost = (message.trim().length > 0 || files.length > 0) && message.length <= MAX_CHARS && !posting;

  const autosize = () => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(autosize, [message]);

  const onImageUpload = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 4) {
      notify("Please choose up to 4 photos.");
      return;
    }
    const loaded = await Promise.all(
      selected.map(async (file) => ({ file, preview: await fileToDataUrl(file) }))
    );
    setFiles((prev) => [...prev, ...loaded].slice(0, 4));
    e.target.value = "";
  };

  const removeImage = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const onEmojiClick = (emojiData) => setMessage((prev) => prev + emojiData.emoji);

  const submit = async (e) => {
    e.preventDefault();
    if (!canPost) return;
    setPosting(true);
    setProgress(20);

    const imageUrls = [];
    for (const { file } of files) {
      // eslint-disable-next-line no-await-in-loop
      const url = await uploadImage(file);
      if (url) imageUrls.push(url);
    }
    setProgress(60);

    const res = await postApi.add({ message: message.trim(), images: imageUrls });
    setProgress(100);
    if (res.success) {
      setMessage("");
      setFiles([]);
      setReload((n) => n + 1);
    } else {
      notify(res.error || "Could not post. Please try again.");
    }
    setTimeout(() => {
      setPosting(false);
      setProgress(0);
    }, 400);
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <div className={Styles.menuSelectorContainer}>
          <div
            onClick={() => setTab("forYou")}
            className={`${Styles.menuSelectorItem} ${tab === "forYou" ? Styles.forYouSelected : ""}`}
          >
            For&nbsp;you
          </div>
          <div
            onClick={() => setTab("following")}
            className={`${Styles.menuSelectorItem} ${tab === "following" ? Styles.followingItemSelected : ""}`}
          >
            Following
          </div>
        </div>
      </div>

      {posting && <ProgressBar now={progress} className={Styles.progressBar} />}

      <div className={Styles.body}>
        <form onSubmit={submit}>
          <div className={`${Styles.makePostContainer} ${posting ? Styles.makePostContainerLoading : ""}`}>
            <div className={Styles.profileImageContainer}>
              <Link to={`/${user.username}`}>
                <img src={user.profile} referrerPolicy="no-referrer" className={Styles.profileImage} alt="" />
              </Link>
            </div>
            <div className={Styles.postBox}>
              <div className={Styles.postTextBox}>
                <textarea
                  id="postTextInput"
                  rows="1"
                  ref={textRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={Styles.postTextInput}
                  placeholder="What is happening?!"
                />
              </div>
              {files.length > 0 && (
                <div className={`${Styles.imageContainer} row row-cols-${files.length > 1 ? 2 : 1}`}>
                  {files.map((f, index) => (
                    <div
                      key={index}
                      className={`col p-1 ${files.length === 3 && index === 0 ? "col-md-12" : ""} d-flex justify-content-center`}
                      style={{ position: "relative" }}
                    >
                      <img src={CrossButton} alt="remove" className={Styles.CrossButton} onClick={() => removeImage(index)} />
                      <img className={Styles.image} src={f.preview} alt="upload preview" />
                    </div>
                  ))}
                </div>
              )}
              <div className={Styles.postIconsAndSubmitContainer}>
                <div className={Styles.postIconsContainer}>
                  <label>
                    <img src={Gallery} className={`${Styles.postIcon} ${files.length < 4 ? "" : Styles.postIconDisabled}`} alt="Gallery" />
                    <input style={{ display: "none" }} type="file" accept="image/*" onChange={onImageUpload} multiple disabled={files.length >= 4} />
                  </label>
                  <img src={Gif} className={Styles.postIcon} alt="Gif" />
                  <img src={Poll} className={Styles.postIcon} alt="Poll" />
                  <img onClick={() => setEmojiOpen((v) => !v)} src={Emoji} className={Styles.postIcon} alt="Emoji" />
                  {emojiOpen && (
                    <ClickAwayListener onClickAway={() => setEmojiOpen(false)}>
                      <div className={Styles.emojiPicker}>
                        <EmojiPicker defaultSkinTone={SkinTones.MEDIUM_LIGHT} theme={Theme.DARK} onEmojiClick={onEmojiClick} />
                      </div>
                    </ClickAwayListener>
                  )}
                  <img src={Schedule} className={Styles.postIcon} alt="Schedule" />
                  <img src={Location} className={`${Styles.postIcon} ${Styles.postIconDisabled}`} alt="Location" />
                </div>
                <div className="d-flex align-items-center">
                  {message.length > 0 && (
                    <div className={Styles.circleProgressContainer} style={{ width: 35, height: 28 }}>
                      <CircularProgressbar
                        styles={buildStyles({
                          textSize: "40px",
                          trailColor: "rgb(83, 100, 113)",
                          pathColor: remaining < 0 ? "rgb(244,33,46)" : remaining <= 20 ? "rgb(255,212,0)" : "rgb(29,155,240)",
                          textColor: remaining < 0 ? "rgb(244,33,46)" : "rgb(83,100,113)",
                        })}
                        strokeWidth={10}
                        minValue={0}
                        maxValue={MAX_CHARS}
                        value={Math.min(message.length, MAX_CHARS)}
                        text={remaining <= 20 ? `${remaining}` : ""}
                      />
                    </div>
                  )}
                  <button type="submit" className={`${Styles.postButton} btn btn-primary rounded-pill`} disabled={!canPost}>
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        <Posts
          filter={tab === "following" ? "following" : undefined}
          reload={reload}
          currentUser={user}
          onReply={setReplyTarget}
        />
      </div>

      {replyTarget && (
        <ReplyModal
          post={replyTarget}
          user={user}
          onClose={() => setReplyTarget(null)}
          onReplied={() => {
            setReplyTarget(null);
            setReload((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
