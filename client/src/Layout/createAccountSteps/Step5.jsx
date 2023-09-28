import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/Step5.module.css"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"


export default function Step5(props) {
  const passwordInputBox = useRef();
  const passwordInput = useRef();
  const [passwordShow, setPasswordShow] = useState(false)
  const passwordFloatingLabel = useRef();
  const nextButton = useRef();
  const [schema, setSchema] = useState(yup
    .object({
      password: yup.string()
      .required("Please enter a password")
      .min(8, "Password must have at least 8 characters")
    }).required())

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema), mode: "onChange"
  });
  const watchAllFields = watch();

  const handleNextButton = async (data, e) => {
    props.setLoading(true)
    e.preventDefault();
    props.setCredentials(prev=>{ return {...prev, password:data.password}})
    props.setCurrentStep(6)
  }

  const tooglePasswordShow = ()=>{
    setPasswordShow(!passwordShow)
  }

  useEffect(() => {
    if (errors.password?.message?.length > 0) {
      passwordInputBox.current.style.setProperty('border-color', 'red', 'important');
      passwordFloatingLabel.current.style.setProperty('color', 'red', 'important');
    }
    else {
      passwordInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
      passwordFloatingLabel.current.style.color = "#6e6e6e"
    }
    if (getValues("password").length === 0) {
      nextButton.current.disabled = true;
    }
    else {
      if (errors.password) {
        nextButton.current.disabled = true;
      }
      else {
        nextButton.current.disabled = false;
      }
    }
  }, [errors.password, props.currentMethod, watchAllFields, getValues])

  return (
    <form onSubmit={handleSubmit(handleNextButton)} style={{ height: "100%" }} className='d-flex flex-column justify-content-between'>
      <div>
        <h2>You'll need a password</h2>
        <h4 className={Styles.subTitle}>Make sure its 8 characters or more {props.currentMethod === "phone" ? props.credentials.phone : props.credentials.email}</h4>
        <div ref={passwordInputBox} className={Styles.passwordInputBox}>
        <div className="d-flex">
          <input autoComplete='off' ref={passwordInput} className={Styles.passwordInput} placeholder=" " name="password" type={passwordShow ? "text" : "password"} {...register('password')} />
          {
            passwordShow ? 
            <i className={`fa-regular fa-eye-slash ${Styles.eyeIcon}`} onClick={tooglePasswordShow}></i>
            :
            <i className={`fa-regular fa-eye ${Styles.eyeIcon}`} onClick={tooglePasswordShow}></i>
          }
        </div>
          <label ref={passwordFloatingLabel} className={`${Styles.floatingLabel} ${Styles.passwordFloatingLabel}`}>Verification password</label>
        </div>
        <p className={Styles.error}>{errors.password && errors.password?.message}</p>
      </div>

      <div className={`${Styles.modalFooter}`}>
        <button ref={nextButton} type="submit" className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Next</button>
      </div>
    </form>
  )
}
