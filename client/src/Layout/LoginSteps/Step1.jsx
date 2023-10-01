import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/LoginSteps/Step1.module.css"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import googleLogo from "../../Images/googleLogo.svg";
import appleLogo from "../../Images/appleLogo.svg";
import { Link } from 'react-router-dom';

export default function Step1(props) {
  const nameInputBox = useRef();
  const nameInput = useRef();
  const nameFloatingLabel = useRef();
  const nextButton = useRef();
  const forgotButton = useRef();
  const [apiCalling, setApiCalling] = useState(false)
  const [schema, setSchema] = useState(yup
    .object({
      name: yup.string().required("This field is required!"),
    }).required())
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema), mode: "onChange"
  });
  const watchAllFields = watch();

  const handleNextButton = async (data, e) => {
    props.setLoading(true)
    e.preventDefault();
    if (await loginValidate(data.name) && !errors.name) {
      props.setCredentials(prev=>{return {...prev, name:data.name}})
      props.setCurrentStep(prev => prev + 1);
    }
    props.setLoading(false)
  }

  const onNameChange = (e)=>{
    loginValidate(e.target.value);
  }

  const loginValidate = async (name) => {
    setApiCalling(true)
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/loginvalidate`, {
      method: "post",
      body: JSON.stringify({ name: name, country: (await getUserInfo()).country }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    const json = await response.json();
    if (!json.success) {
      setError('name', { type: "custom", message: json.error }, { shouldFocus: true });
    }
    await props.setCredentials(prev=>{return {...prev, method:json.method}})
    setApiCalling(false)
    return json.success;
  }
  const getUserInfo = async () => {
    const response = await fetch("https://ipapi.co/json/");
    const json = await response.json()
    return json
  }

  useEffect(() => {
    setValue("name", props.credentials.name)
  }, [])

  useEffect(() => {
    if (errors.name?.message?.length > 0) {
      nameInputBox.current.style.setProperty('border-color', 'red', 'important');
      nameFloatingLabel.current.style.setProperty('color', 'red', 'important');
    }
    else {
      nameInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
      nameFloatingLabel.current.style.color = "#6e6e6e";
    }
    if (getValues("name").length === 0) {
      nextButton.current.disabled = true;
    }
    else {
      if (errors.name) {
        nextButton.current.disabled = true;
      }
      else {
        nextButton.current.disabled = false;
      }
    }
    if (apiCalling) {
      nextButton.current.disabled = true;
    }
  }, [errors.name, props.currentMethod, watchAllFields, getValues, apiCalling])


  useEffect(() => {
    setTimeout(() => {
      props.setLoading(false)
    }, 500);
  }, [])

  return (
    <form onSubmit={handleSubmit(handleNextButton)} style={{ height: "100%" }} className={`${Styles.formContainer}`}>
      <h2 className={Styles.headingTitle}>Sign in to X</h2>
      <div className='d-flex flex-column align-items-center'>
        <button className={`btn btn-light rounded-pill ${Styles.signUpWithGoogleButton}`} type='button' onClick={props.googleLogin}><img src={googleLogo} className={Styles.googleLogo} alt="google Logo" />Sign in with Google</button>
        <button className={`btn btn-light rounded-pill ${Styles.signUpWithAppleButton}`}><img src={appleLogo} className={Styles.appleLogo} alt="apple Logo" />Sign in with Apple</button>
        <div className={Styles.orDivider}>or</div>
        <div ref={nameInputBox} className={Styles.nameInputBox}>
          <input className={Styles.nameInput} ref={nameInput} placeholder=" " name='name' type="text" {...register('name', { onBlur: onNameChange })} />
          <label ref={nameFloatingLabel} className={`${Styles.floatingLabel} ${Styles.nameFloatingLabel}`}>Phone, email address, or username</label>
        </div>
        <div className='d-flex justify-content-start' style={{ width: "100%" }}>
          <p className={Styles.error}>{errors.name && errors.name?.message}</p>
        </div>
      </div>
      <div className={`${Styles.modalFooter}`}>
        <button ref={nextButton} type="submit" className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Next</button>
        <button ref={forgotButton} className={`btn rounded-pill ${Styles.forgotButton}`}>Forgot password?</button>
      </div>
      <p className={Styles.dontHaveAccountText}>Don’t have an account?<Link to={"/i/flow/signup"}>&nbsp;Sign up</Link></p>
    </form>
  )
}
