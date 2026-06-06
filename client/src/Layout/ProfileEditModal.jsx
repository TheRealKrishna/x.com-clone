import React, { useEffect, useRef, useState } from "react";

import { Modal, Avatar, Button } from "../ui";
import { authApi } from "../api";
import { uploadImage, fileToDataUrl } from "../utils/upload";
import { notify, notifySuccess } from "../utils/toast";
import Styles from "../css/Home/ProfileEditModal.module.css";

/**
 * Edit-profile modal. Controlled via `open`/`onClose`. Lets the user change
 * name, bio, location, website, avatar, and banner. Saves via authApi and
 * refreshes the current user.
 */
export default function ProfileEditModal({ open, onClose, user, fetchUser, setUser }) {
  const [form, setForm] = useState({ name: "", bio: "", location: "", website: "" });
  const [avatar, setAvatar] = useState({ url: "", file: null });
  const [banner, setBanner] = useState({ url: "", file: null });
  const [saving, setSaving] = useState(false);
  const avatarInput = useRef();
  const bannerInput = useRef();

  useEffect(() => {
    if (!open) return;
    setForm({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    });
    setAvatar({ url: user.profile || "", file: null });
    setBanner({ url: user.banner || "", file: null });
  }, [open, user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickAvatar = async (e) => {
    const file = e.target.files[0];
    if (file) setAvatar({ url: await fileToDataUrl(file), file });
  };
  const pickBanner = async (e) => {
    const file = e.target.files[0];
    if (file) setBanner({ url: await fileToDataUrl(file), file });
  };

  const save = async () => {
    if (!form.name.trim()) {
      notify("Name can’t be blank");
      return;
    }
    setSaving(true);
    let profileUrl = user.profile;
    let bannerUrl = banner.url === "" ? "" : user.banner;
    if (avatar.file) profileUrl = await uploadImage(avatar.file);
    if (banner.file) bannerUrl = await uploadImage(banner.file);

    const res = await authApi.editProfile({ ...form, profile: profileUrl, banner: bannerUrl });
    setSaving(false);
    if (res.success) {
      if (res.user) setUser?.(res.user);
      await fetchUser?.();
      notifySuccess("Profile updated");
      onClose?.();
    } else {
      notify(res.error || "Could not save profile");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      maxWidth={600}
      headerRight={
        <Button size="sm" variant="secondary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      }
    >
      <div className={Styles.bannerEdit} onClick={() => bannerInput.current?.click()}>
        {banner.url && <img src={banner.url} alt="" className={Styles.bannerImg} />}
        <div className={Styles.bannerOverlay}>
          <i className="fa-solid fa-camera" />
          {banner.url && (
            <i
              className="fa-solid fa-xmark"
              onClick={(e) => {
                e.stopPropagation();
                setBanner({ url: "", file: null });
              }}
            />
          )}
        </div>
        <input ref={bannerInput} type="file" accept="image/*" hidden onChange={pickBanner} />
      </div>

      <div className={Styles.avatarEdit} onClick={() => avatarInput.current?.click()}>
        <Avatar src={avatar.url} size="xxl" />
        <div className={Styles.avatarOverlay}>
          <i className="fa-solid fa-camera" />
        </div>
        <input ref={avatarInput} type="file" accept="image/*" hidden onChange={pickAvatar} />
      </div>

      <div className={Styles.fields}>
        <Field label="Name" value={form.name} onChange={set("name")} maxLength={50} />
        <Field label="Bio" value={form.bio} onChange={set("bio")} maxLength={160} textarea />
        <Field label="Location" value={form.location} onChange={set("location")} maxLength={30} />
        <Field label="Website" value={form.website} onChange={set("website")} maxLength={100} />
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange, maxLength, textarea }) {
  return (
    <label className={Styles.field}>
      <div className={Styles.fieldHead}>
        <span className={Styles.fieldLabel}>{label}</span>
        <span className={Styles.fieldCount}>
          {(value || "").length} / {maxLength}
        </span>
      </div>
      {textarea ? (
        <textarea className={Styles.input} value={value} onChange={onChange} maxLength={maxLength} rows={3} />
      ) : (
        <input className={Styles.input} value={value} onChange={onChange} maxLength={maxLength} />
      )}
    </label>
  );
}
