import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/CreateAccountSteps/Step4.module.css"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export default function Step4(props) {
  const codeInputBox = useRef();
  const codeInput = useRef();
  const codeFloatingLabel = useRef();
  const didntReceiveBox = useRef();
  const nextButton = useRef();
  const [schema, setSchema] = useState(yup
    .object({
      code: yup.number("Invalid code!").positive("Invalid code!").integer("Invalid code!").min(100000, "Invalid code!").max(999999, "Invalid code!").nonNullable("Invalid code!").typeError("Invalid code!"),
    }).required())
  const {
    register,
    handleSubmit,
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
    console.log(data.code)
    props.setCurrentStep(prev => prev + 1);
    props.setLoading(false)
  }

  const handleResend = async()=>{
    // to do
  }

  const handleTypeChange = async()=>{
    props.setCurrentStep(1);
    if (props.currentMethod === "phone") {
      props.setCurrentMethod(prev => "email")
    }
    else if (props.currentMethod === "email") {
      props.setCurrentMethod(prev => "phone")
    }
  }

  useEffect(() => {
    if (errors.code?.message?.length > 0) {
      codeInputBox.current.style.setProperty('border-color', 'red', 'important');
      codeFloatingLabel.current.style.setProperty('color', 'red', 'important');
    }
    else {
      codeInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
      codeFloatingLabel.current.style.color = "#6e6e6e"
    }
    if (getValues("code").length === 0) {
      nextButton.current.disabled = true;
    }
    else {
      if (errors.code) {
        nextButton.current.disabled = true;
      }
      else {
        nextButton.current.disabled = false;
      }
    }
  }, [errors.code, props.currentMethod, watchAllFields, getValues])

  const didntReceiveToogle = () => {
    didntReceiveBox.current.style.display === "none" ? 
    didntReceiveBox.current.style.display = "block" : didntReceiveBox.current.style.display = "none";
  }

  return (
    <form onSubmit={handleSubmit(handleNextButton)} style={{ height: "100%" }} className='d-flex flex-column justify-content-between'>
      <div>
        <h2>We sent you a code</h2>
        <h4 className={Styles.subTitle}>Enter it below to verify {props.currentMethod === "phone" ? props.credentials.phone : props.credentials.email}</h4>
        <div ref={codeInputBox} className={Styles.codeInputBox}>
          <input autoComplete='off' ref={codeInput} className={Styles.codeInput} placeholder=" " name='code' type="number" {...register('code')} />
          <label ref={codeFloatingLabel} className={`${Styles.floatingLabel} ${Styles.codeFloatingLabel}`}>Verification code</label>
        </div>
        <p className={Styles.error}>{errors.code && errors.code?.message}</p>
        <div className={Styles.didntReceiveContainer}>
          <p onClick={didntReceiveToogle} className={Styles.didntReceiveButton}>Didn't receive a text?</p>
          <div ref={didntReceiveBox} className={Styles.didntReceiveBox} style={{display:"none"}}>
              <li className={Styles.didntReceiveBoxHeading}>Didn't receive an {props.currentMethod === "phone" ? "sms" : "email"}?</li>
              <li onClick={handleResend} className={Styles.didntReceiveBoxOption}>Resend {props.currentMethod === "phone" ? "sms" : "email"}</li>
              <li onClick={handleTypeChange} className={Styles.didntReceiveBoxOption}>Use {props.currentMethod === "phone" ? "email" : "phone"} instead</li>
          </div>
        </div>
      </div>

      <div className={`${Styles.modalFooter}`}>
        <button ref={nextButton} type="submit" className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Next</button>
      </div>
    </form>
  )
}
