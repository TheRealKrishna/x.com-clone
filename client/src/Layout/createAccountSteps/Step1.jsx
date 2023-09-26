import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/CreateAccountSteps.module.css"
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { SelectDatepicker } from 'react-select-datepicker';

export default function Step1() {
  const [currentMethod, setCurrentMethod] = useState("phone");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dob, setDob] = useState(new Date())
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
  const [schema, setSchema] = useState(yup
    .object({
      name: yup.string().required("What’s your name?")
    }).required())


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema), mode: "onChange"
  });

  const handleNextButton = async (data, e) => {
    e.preventDefault();
    console.log(data)
  }

  const handleNameChange = async (e) => {

  }

  const handlePhoneChange = async (e) => {

  }

  const handleEmailChange = async (e) => {

  }

  const onDobChange = (Date) => {
    setDob(Date)
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
    if (currentMethod === "phone") {
      if (errors.phone?.message?.length > 0) {
        phoneInputBox.current.style.setProperty('border-color', 'red', 'important');
        phoneFloatingLabel.current.style.setProperty('color', 'red', 'important');
      }
      else {
        phoneInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
        phoneFloatingLabel.current.style.color = "#6e6e6e"
      }
    }
    else if (currentMethod === "email") {
      if (errors.email?.message?.length > 0) {
        emailInputBox.current.style.setProperty('border-color', 'red', 'important');
        emailFloatingLabel.current.style.setProperty('color', 'red', 'important');
      }
      else {
        emailInputBox.current.style.border = "1px solid rgb(45, 45, 45)";
        emailFloatingLabel.current.style.color = "#6e6e6e"
      }
    }
    if (errors.name || errors.phone || errors.email) {
      nextButton.current.disabled = true;
    }
    else {
      nextButton.current.disabled = false;
    }
  }, [errors.name, errors.phone, errors.email, currentMethod])

  useEffect(() => {
    if (currentMethod === "phone") {
      setSchema(yup
        .object({
          name: yup.string().required("What’s your name?"),
          phone: yup.number("Phone number is required!").positive("Phone number can only have numbers!").integer("Phone number can only have numbers!").min(1000000000, "Please enter a valid phone number!").max(9999999999, "Please enter a valid phone number!").nonNullable("Phone number is required!").typeError("Phone number is required!"),
        }).required())
    }

    else if (currentMethod === "email") {
      setSchema(yup
        .object({
          name: yup.string().required("What’s your name?"),
          email: yup.string().required("Email is required!").email("Invalid email!").nonNullable("Phone number is required!").typeError("email is required!"),
        }).required())
    }
  }, [currentMethod])

  const switchAuthType = () => {
    if (currentMethod === "phone") {
      setValue("phone", "")
      delete errors.phone
      setCurrentMethod(prev => "email")
    }
    else if (currentMethod === "email") {
      setValue("email", "")
      delete errors.email
      setCurrentMethod(prev => "phone")
    }
  }

  return (
      <form onSubmit={handleSubmit(handleNextButton)} style={{height:"100%"}} className='d-flex flex-column justify-content-between'>
      <div>
      <h3>Create Your Account</h3>
        <div ref={nameInputBox} className={Styles.nameInputBox}>
          <input className={Styles.nameInput} ref={nameInput} placeholder=" " name='name' type="text" {...register('name', { onChange: handleNameChange })} />
          <label ref={nameFloatingLabel} className={`${Styles.floatingLabel} ${Styles.nameFloatingLabel}`}>Name</label>
        </div>
        <p className={Styles.error}>{errors.name && errors.name?.message}</p>
        {
          currentMethod === "phone" ?
            <>
              <div ref={phoneInputBox} className={Styles.phoneInputBox}>
                <input ref={phoneInput} className={Styles.phoneInput} placeholder=" " name='phone' type="number" {...register('phone', { onChange: handlePhoneChange })} />
                <label ref={phoneFloatingLabel} className={`${Styles.floatingLabel} ${Styles.phoneFloatingLabel}`}>Phone</label>
              </div>
              <p className={Styles.error}>{errors.phone && errors.phone?.message}</p>
            </>
            :
            currentMethod === "email" ?
              <>
                <div ref={emailInputBox} className={Styles.emailInputBox}>
                  <input ref={emailInput} className={Styles.emailInput} placeholder=" " name='email' type="email" {...register('email', { onChange: handleEmailChange })} />
                  <label ref={emailFloatingLabel} className={`${Styles.floatingLabel} ${Styles.emailFloatingLabel}`}>Email</label>
                </div>
                <p className={Styles.error}>{errors.email && errors.email?.message}</p>
              </>
              :
              null
        }
        <div className={Styles.emailSwitchContainer}>
          <p onClick={switchAuthType} className={Styles.emailSwitchButton}>Use {currentMethod === "phone" ? "email" : "phone"} instead</p>
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
              minDate={(new Date(currentDate.getFullYear() - 120,currentDate.getMonth(),currentDate.getDate()))}
              maxDate={(new Date(currentDate.getFullYear() - 13,currentDate.getMonth(),currentDate.getDate()))}
            />
          }
        </div>
        </div>
        <div className={`${Styles.modalFooter}`}>
          <button ref={nextButton} type="submit" disabled className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Next</button>
        </div>
      </form> 
  )
}
