import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/LoginSteps/Step2.module.css"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Link } from 'react-router-dom';


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
    props.setCurrentStep(prev=>prev+1);
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
        <h2 style={{marginBottom:"30px"}}>Enter your password</h2>

        <div className={Styles.nameInputBox}>
        <input autoComplete='off' disabled value={props.credentials.name} className={Styles.nameInput} placeholder=" " name="name" type='text' />
        <label className={`${Styles.floatingLabel} ${Styles.nameFloatingLabel}`}>{props.credentials.method}</label>
        </div>

        <div ref={passwordInputBox} className={Styles.passwordInputBox}>
        <div className="d-flex">
          <input ref={passwordInput} className={Styles.passwordInput} placeholder=" " name="password" type={passwordShow ? "text" : "password"} {...register('password')} />
          {
            passwordShow ? 
            <i className={`fa-regular fa-eye-slash ${Styles.eyeIcon}`} onClick={tooglePasswordShow}></i>
            :
            <i className={`fa-regular fa-eye ${Styles.eyeIcon}`} onClick={tooglePasswordShow}></i>
          }
        </div>
          <label ref={passwordFloatingLabel} className={`${Styles.floatingLabel} ${Styles.passwordFloatingLabel}`}>Password</label>
        </div>
        <p className={Styles.error}>{errors.password && errors.password?.message}</p>
        <Link to={"/i/flow/password_reset"} className={Styles.forgotPasswordLink}>Forgot password?</Link>
      </div>

      <div className={`${Styles.modalFooter}`}>
        <button ref={nextButton} type="submit" className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Log&nbsp;in</button>
        <p className={Styles.dontHaveAccountText}>Don’t have an account?<Link to={"/i/flow/signup"}>&nbsp;Sign up</Link></p>
      </div>
    </form>
  )
}
