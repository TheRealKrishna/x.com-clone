import React, { useEffect, useRef, useState } from 'react'
import Styles from "../css/Home/ProfileEditModal.module.css"
import Spinner from '../Components/Spinner'
import { useNavigate } from 'react-router-dom';
import closeButtonIcon from "../Images/closeButtonIcon.svg";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { SelectDatepicker } from 'react-select-datepicker';
import Camera from "../Images/Home/Camera.svg"
import Cross from "../Images/Home/Cross.svg"
import ProgressBar from 'react-bootstrap/ProgressBar';
import { authApi } from '../api';
import { uploadImage, fileToDataUrl } from '../utils/upload';
import { notify, notifySuccess } from '../utils/toast';

export default function ProfileEditModal(props) {
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const modalOpenButton = useRef()
  const editProfileModalCloseButton = useRef()
  const editProfileModal = useRef()
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dob, setDob] = useState()
  const nameInputBox = useRef();
  const nameFloatingLabel = useRef();
  const bioInputBox = useRef();
  const bioFloatingLabel = useRef();
  const locationInputBox = useRef();
  const locationFloatingLabel = useRef();
  const websiteInputBox = useRef();
  const websiteFloatingLabel = useRef();
  const saveButton = useRef();
  const [bannerImageForUpload, setBannerImageForUpload] = useState(false);
  const [bannerImage, setBannerImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileImageForUpload, setProfileImageForUpload] = useState(false);
  const [saving, setSaving] = useState(false)
  const [savingProgress, setSavingProgress] = useState(0)
  const [apiCalling, setApiCalling] = useState(false)
  const [schema, setSchema] = useState(yup
    .object({
      name: yup.string().required("Name can’t be blank"),
      bio: yup.string(),
      location: yup.string(),
      website: yup.string(),
    }).required())
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    setFocus,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema), mode: "onChange"
  });
  const watchAllFields = watch();


  const onImageRemove = () => {
    setBannerImage("");
    setBannerImageForUpload("");
  }

  const onDobChange = (Date) => {
    setDob(Date)
  }

  const onBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerImageForUpload(file);
    setBannerImage(await fileToDataUrl(file));
  }

  const onProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImageForUpload(file);
    const preview = await fileToDataUrl(file);
    setProfileImage(preview || props.user.profile);
  }

  const handleSave = async (data, e) => {
    e.preventDefault();
    setSavingProgress(20)
    setApiCalling(true)
    setSaving(true)

    // Upload only newly selected images; otherwise keep existing URLs.
    let profileUrl = props.user.profile;
    let bannerUrl = bannerImage === "" ? "" : props.user.banner;
    if (profileImageForUpload) profileUrl = await uploadImage(profileImageForUpload);
    if (bannerImageForUpload) bannerUrl = await uploadImage(bannerImageForUpload);

    setSavingProgress(50)
    const json = await authApi.editProfile({
      ...data,
      profile: profileUrl,
      banner: bannerUrl,
      dob: new Date(dob),
    });
    setSavingProgress(75)
    if (json.success) {
      setSavingProgress(100)
      if (props.setUser && json.user) props.setUser(json.user);
      if (props.fetchUser) await props.fetchUser();
      navigate(`/${props.user.username}`)
      notifySuccess('Profile saved successfully!')
    } else {
      notify(json?.error || "An error occurred!")
    }
    setApiCalling(false)
    setSaving(false)
  }


  useEffect(() => {
    if (errors.name?.message?.length > 0) {
      nameInputBox.current.style.setProperty('border-color', 'red', 'important');
      nameFloatingLabel.current.style.setProperty('color', 'red', 'important');
    }
    else {
      nameInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
      nameFloatingLabel.current.style.color = "#6e6e6e";
    }
    if (getValues("name").length === 0 || !dob) {
      saveButton.current.disabled = true;
    }
    else {
      if (errors.name) {
        saveButton.current.disabled = true;
      }
      else {
        saveButton.current.disabled = false;
      }
    }
    if (apiCalling) {
      saveButton.current.disabled = true;
    }
  }, [errors.name, dob, watchAllFields, getValues, apiCalling])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 500);
    setBannerImage(props.user.banner)
    setProfileImage(props.user.profile)
    setValue("name", props.user.name)
    setValue("bio", props.user.bio)
    setValue("location", props.user.location)
    setValue("website", props.user.website)
    setDob(new Date(props.user.dob))
    nameInputBox.current.addEventListener('click', () => {
      setFocus("name")
    })
    bioInputBox.current.addEventListener('click', () => {
      setFocus("bio")
    })
    locationInputBox.current.addEventListener('click', () => {
      setFocus("location")
    })
    websiteInputBox.current.addEventListener('click', () => {
      setFocus("website")
    })
  }, [])

  useEffect(() => {
    if (window.location.pathname === "/settings/profile") {
      modalOpenButton.current.click();
    }
    else {
      editProfileModalCloseButton.current.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname])


  useEffect(() => {
    editProfileModal.current.addEventListener('shown.bs.modal', () => {
      navigate("/settings/profile")
    })
    editProfileModal.current.addEventListener('hidden.bs.modal', () => {
      navigate(`/${props.user.username}`)
    })
  }, [])

  return (
    <form onSubmit={handleSubmit(handleSave)} style={{ height: "100%" }}>
      <div className={`modal ${Styles.fade}`} ref={editProfileModal} id="editProfileModal" aria-labelledby="editProfileModalLabel" data-bs-backdrop="true">
        <div className={`modal-dialog ${Styles.modalDialog}`}>
          <div className={`modal-content ${Styles.modalBox}`}>
            {loading ? <Spinner /> :
              <>
                <div className={`${Styles.modalHeader} ${saving ? Styles.modalHeaderLoading : ""}`}>
                  <div className='d-flex justify-content-center'>
                    <button ref={props.editProfileModalCloseButton} type="button" className={Styles.closeButton} data-bs-dismiss="modal" aria-label="Close"><img className={Styles.closeButtonIcon} src={closeButtonIcon} alt="closebutton" /></button>
                    <h1 className={`modal-title fs-5 ${Styles.modalTitle}`} id="signupModalLabel">Edit Profile</h1>
                  </div>
                  <button ref={saveButton} type="submit" className={`btn btn-light rounded-pill ${Styles.saveButton}`}>Save</button>
                </div>
                <div className={`modal-body ${Styles.modalBody} ${saving ? Styles.modalBodyLoading : ""}`}>
                  <div className={Styles.profileContainer}>
                    <div className={Styles.bannerContainer}>
                      {
                        bannerImage?.length > 0 ?
                          <>
                            <img className={Styles.profileBanner} src={bannerImage} alt="profileBanner" />
                            <label name='bannerImage'>
                              <img src={Camera} alt="CameraButton" className={Styles.BannerButton} />
                              <input name='bannerImage' style={{ display: "none" }} type="file" accept="image/*" onChange={onBannerImageUpload} />
                            </label>
                            <img src={Cross} alt="CrossButton" className={Styles.BannerButton} onClick={onImageRemove} />
                          </>
                          :
                          <label name='bannerImage' style={{ marginRight: "60px" }}>
                            <img src={Camera} alt="CameraButton" className={Styles.BannerButton} />
                            <input name='bannerImage' style={{ display: "none" }} type="file" accept="image/*" onChange={onBannerImageUpload} />
                          </label>
                      }
                    </div>
                    <div className={Styles.profilePhotoContainer}>
                      <img className={Styles.profilePhoto} src={profileImage} alt="profileImage" />
                      <label name='profileImage'>
                        <img src={Camera} alt="CameraButton" className={Styles.profileButton} />
                        <input name='profileImage' style={{ display: "none" }} type="file" accept="image/*" onChange={onProfileImageUpload} />
                      </label>
                    </div>
                    <div className={Styles.profileInfoContainer}>
                      <div ref={nameInputBox} className={Styles.nameInputBox}>
                        <input className={Styles.nameInput} placeholder=" " name='name' type="text" {...register('name')} maxLength={50} />
                        <label ref={nameFloatingLabel} className={`${Styles.floatingLabel} ${Styles.nameFloatingLabel}`}>Name</label>
                      </div>
                      <p className={Styles.error}>{errors.name && errors.name?.message}</p>

                      <div ref={bioInputBox} className={Styles.bioInputBox}>
                        <textarea rows={3} className={Styles.bioInput} placeholder=" " name='bio' type="text" {...register('bio')} maxLength={160} />
                        <label ref={bioFloatingLabel} className={`${Styles.floatingLabel} ${Styles.bioFloatingLabel}`}>Bio</label>
                      </div>
                      <p className={Styles.error}>{errors.bio && errors.bio?.message}</p>

                      <div ref={locationInputBox} className={Styles.locationInputBox}>
                        <input className={Styles.locationInput} placeholder=" " name='location' type="text" {...register('location')} maxLength={30} />
                        <label ref={locationFloatingLabel} className={`${Styles.floatingLabel} ${Styles.locationFloatingLabel}`}>Location</label>
                      </div>
                      <p className={Styles.error}>{errors.location && errors.location?.message}</p>

                      <div ref={websiteInputBox} className={Styles.websiteInputBox}>
                        <input className={Styles.websiteInput} placeholder=" " name='website' type="text" {...register('website')} maxLength={100} />
                        <label ref={websiteFloatingLabel} className={`${Styles.floatingLabel} ${Styles.websiteFloatingLabel}`}>Website</label>
                      </div>
                      <p className={Styles.error}>{errors.website && errors.website?.message}</p>

                      <div className={Styles.dateOfBirthContainer}>
                        <p className={Styles.dateOfBirthText}>Date of birth</p>
                        <p className={Styles.dateOfBirthSubText}>This should be the date of birth of the person using the account. Even if you’re making an account for your business, event, or cat.<br />
                          X uses your age to customize your experience, including ads, as explained in our <a href='/' target='_blank'>Privacy Policy</a>.</p>
                        {
                          currentDate &&
                          <SelectDatepicker
                            className={Styles.dobSelector}
                            selectedDate={dob}
                            onDateChange={onDobChange}
                            minDate={(new Date(currentDate.getFullYear() - 120, currentDate.getMonth(), currentDate.getDate()))}
                            maxDate={(new Date(currentDate.getFullYear() - 13, currentDate.getMonth(), currentDate.getDate()))}
                            name="date"
                          />
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </>
            }
          </div>
          <button ref={modalOpenButton} type='button' data-bs-toggle="modal" data-bs-target="#editProfileModal" style={{ display: "none" }}></button>
        </div>
      </div >
    </form>
  )
}
