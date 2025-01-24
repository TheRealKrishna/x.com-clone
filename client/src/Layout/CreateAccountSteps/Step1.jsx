import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/CreateAccountSteps/Step1.module.css"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { SelectDatepicker } from 'react-select-datepicker';

export default function Step1(props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dob, setDob] = useState()
  const nameInputBox = useRef();
  const nameInput = useRef();
  const nameFloatingLabel = useRef();
  const phoneInputBox = useRef();
  const phoneInput = useRef();
  const phoneFloatingLabel = useRef();
  const emailInputBox = useRef();
  const emailInput = useRef();
  const emailFloatingLabel = useRef();
  const nextButton = useRef();
  const [apiCalling, setApiCalling] = useState(false)
  const [emailValidateTimeout, setEmailValidateTimeout] = useState()
  const [phoneValidateTimeout, setPhoneValidateTimeout] = useState()
  const [schema, setSchema] = useState(yup
    .object({
      name: yup.string().required("What’s your name?"),
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
    if (!(errors.name || errors.phone || errors.email)) {
      props.setCredentials({ ...data, dob: new Date(dob) })
      props.setCurrentStep(prev => prev + 1);
    }
    props.setLoading(false)
  }

  const onEmailChange = async (e) => {
    setApiCalling(true)
    if (emailValidateTimeout) {
      clearTimeout(emailValidateTimeout);
    }
    setEmailValidateTimeout(setTimeout(async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/emailvalidate`, {
        method: "post",
        body: JSON.stringify({ email: e.target.value }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const json = await response.json();
      if (!json.success) {
        setError('email', { type: "custom", message: json.error }, { shouldFocus: false });
      }
      setApiCalling(false)
    }, 1000))
  }

  const onPhoneChange = async (e) => {
    setApiCalling(true)
    if (phoneValidateTimeout) {
      clearTimeout(phoneValidateTimeout);
    }
    setPhoneValidateTimeout(setTimeout(async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/phonevalidate`, {
        method: "post",
        body: JSON.stringify({ phone: e.target.value, country: (await getUserInfo()).country }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const json = await response.json();
      if (!json.success) {
        setError('phone', { type: "custom", message: json.error }, { shouldFocus: false });
      }
      setApiCalling(false)
    }, 1000))
  }


  const onDobChange = (Date) => {
    setDob(Date)
  }

  const getUserInfo = async () => {
    const response = await fetch("https://ipapi.co/json/");
    const json = await response.json()
    return json
  }

  useEffect(() => {
    setValue("name", props.credentials.name)
    setValue("phone", props.credentials.phone)
    setValue("email", props.credentials.email)
    setDob(props.credentials.dob)
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
    if (props.currentMethod === "phone") {
      delete errors.email
      if (errors.phone?.message?.length > 0) {
        phoneInputBox.current.style.setProperty('border-color', 'red', 'important');
        phoneFloatingLabel.current.style.setProperty('color', 'red', 'important');
      }
      else {
        phoneInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
        phoneFloatingLabel.current.style.color = "#6e6e6e"
      }
    }
    else if (props.currentMethod === "email") {
      delete errors.phone
      if (errors.email?.message?.length > 0) {
        emailInputBox.current.style.setProperty('border-color', 'red', 'important');
        emailFloatingLabel.current.style.setProperty('color', 'red', 'important');
      }
      else {
        emailInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
        emailFloatingLabel.current.style.color = "#6e6e6e"
      }
    }
    if (getValues("name").length === 0 || (getValues("phone").length === 0 && getValues("email").length === 0) || !dob) {
      nextButton.current.disabled = true;
    }
    else {
      if (errors.name || errors.phone || errors.email) {
        nextButton.current.disabled = true;
      }
      else {
        nextButton.current.disabled = false;
      }
    }
    if (apiCalling) {
      nextButton.current.disabled = true;
    }
  }, [errors.name, errors.phone, errors.email, dob, props.currentMethod, watchAllFields, getValues, apiCalling])

  useEffect(() => {
    if (props.currentMethod === "phone") {
      setSchema(yup
        .object({
          name: yup.string().required("What’s your name?"),
          phone: yup.number("Phone number is required!").required("Phone number is required!").nonNullable("Phone number is required!").typeError("Phone number is required!"),
        }).required())
    }

    else if (props.currentMethod === "email") {
      setSchema(yup
        .object({
          name: yup.string().required("What’s your name?"),
          email: yup.string().required("Email is required!").email("Invalid email address!").nonNullable("Phone number is required!").typeError("Email is required!"),
        }).required())
    }
  }, [props.currentMethod])

  const switchAuthType = () => {
    if (props.currentMethod === "phone") {
      props.setCurrentMethod(prev => "email")
    }
    else if (props.currentMethod === "email") {
      props.setCurrentMethod(prev => "phone")
    }
    delete errors.phone
    delete errors.email
    setValue("phone", "")
    setValue("email", "")
  }

  useEffect(() => {
    setTimeout(() => {
      props.setLoading(false)
    }, 500);
  }, [])

  return (
    <form onSubmit={handleSubmit(handleNextButton)} style={{ height: "100%" }} className='d-flex flex-column justify-content-between'>
      <div>
        <h2>Create Your Account</h2>
        <div ref={nameInputBox} className={Styles.nameInputBox}>
          <input className={Styles.nameInput} ref={nameInput} placeholder=" " name='name' type="text" {...register('name')} />
          <label ref={nameFloatingLabel} className={`${Styles.floatingLabel} ${Styles.nameFloatingLabel}`}>Name</label>
        </div>
        <p className={Styles.error}>{errors.name && errors.name?.message}</p>
        {
          props.currentMethod === "phone" ?
            <>
              <div ref={phoneInputBox} className={Styles.phoneInputBox}>
                <input ref={phoneInput} className={Styles.phoneInput} placeholder=" " name='phone' type="number" {...register('phone', { onChange: onPhoneChange })} />
                <label ref={phoneFloatingLabel} className={`${Styles.floatingLabel} ${Styles.phoneFloatingLabel}`}>Phone</label>
              </div>
              <p className={Styles.error}>{errors.phone && errors.phone?.message}</p>
            </>
            :
            props.currentMethod === "email" ?
              <>
                <div ref={emailInputBox} className={Styles.emailInputBox}>
                  <input ref={emailInput} className={Styles.emailInput} placeholder=" " name='email' type="email" {...register('email', { onChange: onEmailChange })} />
                  <label ref={emailFloatingLabel} className={`${Styles.floatingLabel} ${Styles.emailFloatingLabel}`}>Email</label>
                </div>
                <p className={Styles.error}>{errors.email && errors.email?.message}</p>
              </>
              :
              null
        }
        <div className={Styles.emailSwitchContainer}>
          <p onClick={switchAuthType} className={Styles.emailSwitchButton}>Use {props.currentMethod === "phone" ? "email" : "phone"} instead</p>
        </div>

        <div className={Styles.dateOfBirthContainer}>
          <p className={Styles.dateOfBirthText}>Date of birth</p>
          <p className={Styles.dateOfBirthSubText}>This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.</p>
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
      <div className={`${Styles.modalFooter}`}>
        <button ref={nextButton} type="submit" className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Next</button>
      </div>
    </form>
  )
}
