import React, { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import ClickAwayListener from "react-click-away-listener";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import Styles from "../../../css/Home/Components/Composer.module.css";
import { Avatar, Button } from "../../../ui";
import { postApi } from "../../../api";
import { uploadImage, fileToDataUrl } from "../../../utils/upload";
import { notify } from "../../../utils/toast";

const MAX = 280;

/**
 * Reusable post composer used by the feed, the global Post modal, and replies.
 *
 * Props:
 *  - user: current user (for avatar)
 *  - replyTo: optional parent post; switches to reply mode
 *  - autoFocus, compact: layout tweaks
 *  - onPosted(post): called after a successful post/reply
 */
export default function Composer({ user, replyTo = null, autoFocus = false, compact = false, onPosted, placeholder }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]); // { file, preview }
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const textRef = useRef();
  const fileRef = useRef();

  const remaining = MAX - text.length;
  const over = remaining < 0;
  const canPost = (text.trim().length > 0 || files.length > 0) && !over && !posting;

  const autosize = () => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(autosize, [text]);
  useEffect(() => {
    if (autoFocus) textRef.current?.focus();
  }, [autoFocus]);

  const onPickFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 4) {
      notify("Please choose up to 4 photos.");
      return;
    }
    const loaded = await Promise.all(selected.map(async (file) => ({ file, preview: await fileToDataUrl(file) })));
    setFiles((prev) => [...prev, ...loaded].slice(0, 4));
    e.target.value = "";
  };

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    const urls = [];
    for (const { file } of files) {
      // eslint-disable-next-line no-await-in-loop
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    const payload = { message: text.trim(), images: urls };
    const res = replyTo ? await postApi.reply(replyTo._id, payload) : await postApi.add(payload);
    setPosting(false);
    if (res.success) {
      setText("");
      setFiles([]);
      onPosted?.(res.post);
    } else {
      notify(res.error || "Could not post. Please try again.");
    }
  };

  return (
    <div className={Styles.composer}>
      <Avatar src={user.profile} size="md" username={user.username} />
      <div className={Styles.composerBody}>
        {replyTo && (
          <p className={Styles.replyingTo}>
            Replying to <b>@{replyTo.sender?.username}</b>
          </p>
        )}
        {!replyTo && !compact && (
          <button type="button" className={Styles.audience}>
            Everyone <i className="fa-solid fa-angle-down" />
          </button>
        )}
        <textarea
          ref={textRef}
          className={Styles.textarea}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || (replyTo ? "Post your reply" : "What is happening?!")}
        />

        {files.length > 0 && (
          <div className={`${Styles.previews} ${Styles[`previews${files.length}`]}`}>
            {files.map((f, i) => (
              <div key={i} className={Styles.previewWrap}>
                <button className={Styles.removeImg} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label="Remove image">
                  <i className="fa-solid fa-xmark" />
                </button>
                <img src={f.preview} alt="upload preview" className={Styles.previewImg} />
              </div>
            ))}
          </div>
        )}

        <div className={Styles.divider} />

        <div className={Styles.toolbar}>
          <div className={Styles.tools}>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
            <button className={Styles.tool} onClick={() => fileRef.current?.click()} disabled={files.length >= 4} title="Media">
              <i className="fa-regular fa-image" />
            </button>
            <button className={Styles.tool} onClick={() => notify("GIF picker coming soon")} title="GIF">
              <i className="fa-solid fa-film" />
            </button>
            <button className={Styles.tool} onClick={() => notify("Polls coming soon")} title="Poll">
              <i className="fa-solid fa-square-poll-horizontal" />
            </button>
            <button className={Styles.tool} onClick={() => setEmojiOpen((v) => !v)} title="Emoji">
              <i className="fa-regular fa-face-smile" />
            </button>
            <button className={Styles.tool} onClick={() => notify("Scheduling coming soon")} title="Schedule">
              <i className="fa-regular fa-calendar" />
            </button>
            {emojiOpen && (
              <ClickAwayListener onClickAway={() => setEmojiOpen(false)}>
                <div className={Styles.emojiPicker}>
                  <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setText((t) => t + e.emoji)} />
                </div>
              </ClickAwayListener>
            )}
          </div>

          <div className={Styles.right}>
            {text.length > 0 && (
              <>
                <div className={Styles.counter}>
                  <CircularProgressbar
                    value={Math.min(text.length, MAX)}
                    maxValue={MAX}
                    text={remaining <= 20 ? `${remaining}` : ""}
                    styles={buildStyles({
                      textSize: "36px",
                      pathColor: over ? "var(--danger)" : remaining <= 20 ? "var(--warn)" : "var(--x-blue)",
                      textColor: over ? "var(--danger)" : "var(--text-secondary)",
                      trailColor: "var(--border-strong)",
                    })}
                    strokeWidth={10}
                  />
                </div>
                <div className={Styles.counterDivider} />
              </>
            )}
            <Button size="sm" onClick={submit} disabled={!canPost}>
              {posting ? "Posting…" : replyTo ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
