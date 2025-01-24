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
import toast from 'react-hot-toast';
import ProgressBar from 'react-bootstrap/ProgressBar';

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
    const selectedImages = e.target.files;

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
    setBannerImageForUpload(prev => selectedImages[0]);
    setBannerImage(prev => loadedImages[0]);
  }

  const onProfileImageUpload = async (e) => {
    const selectedImages = e.target.files;

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
    setProfileImageForUpload(prev => selectedImages[0]);
    if (loadedImages[0]) {
      setProfileImage(prev => loadedImages[0]);
    }
    else {
      setProfileImage(props.user.profile)
    }
  }


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
    if (json.url) {
      return json.url
    }
    else {
      return ""
    }

  };

  const handleSave = async (data, e) => {
    setSavingProgress(20)
    setApiCalling(true)
    setSaving(true)
    e.preventDefault();
    let bannerImageUrl = false
    let profileImageUrl = false
    if (bannerImageForUpload !== false) {
      bannerImageUrl = await uploadImage(bannerImageForUpload);
    }
    if (profileImageForUpload !== false) {
      profileImageUrl = await uploadImage(profileImageForUpload);
    }
    setSavingProgress(50)
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/editprofile`, {
      method: "post",
      body: JSON.stringify({ ...data, profile: profileImageUrl, banner: bannerImageUrl, dob: new Date(dob) }),
      headers: {
        "Content-Type": "application/json",
        "authToken": localStorage.getItem("auth-token")
      }
    })
    setSavingProgress(75)
    const json = await response.json();
    if (json.success) {
      setSavingProgress(100)
      navigate(`/${props.user.username}`)
      toast.success('Profile saved successfully!', {
        style: {
          border: '1px solid white',
          padding: '16px 30px',
          color: 'white',
          backgroundColor: "rgb(29, 155, 240)",
        },
        iconTheme: {
          primary: 'white',
          secondary: 'rgb(29, 155, 240)',
        },
      });
    }
    else {
      toast(json?.error ? json.error : "An error occured!", {
        style: {
          border: '1px solid white',
          padding: '16px 30px',
          color: 'white',
          backgroundColor: "rgb(29, 155, 240)",
        }
      });
    }
    setApiCalling(false)
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
