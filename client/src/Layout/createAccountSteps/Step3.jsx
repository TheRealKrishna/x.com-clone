import React, { useEffect, useRef, useState } from 'react'
import Styles from "../../css/Step3.module.css"
import checkMark from "../../Images/CheckMark.svg"

export default function Step1(props) {
  const [dob, setDob] = useState(new Intl.DateTimeFormat('en-UK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(props.credentials.dob))

  const handleNextButton = async (e) => {
    props.setLoading(true)
    e.preventDefault();
    //send otp with api
    props.setCurrentStep(prev => prev + 1);
    props.setLoading(false)
  }

  useEffect(() => {
    setTimeout(() => {
      props.setLoading(false)
    }, 500);
  }, [])

  return (
    <form onSubmit={handleNextButton} style={{ height: "100%" }} className='d-flex flex-column justify-content-between'>
      <div className='d-flex flex-column justify-content-between' style={{ height: "100%" }}>
        <div>
          <h2>Create Your Account</h2>
          <div onClick={()=>props.setCurrentStep(1)} className={Styles.nameInputBox}>
            <label className={`${Styles.floatingLabel} ${Styles.nameFloatingLabel}`}>Name</label>
            <div className="d-flex">
              <input onChange={()=>{}} className={Styles.nameInput} placeholder=" " name='name' type="text" value={props.credentials.name} />
              <img className={Styles.checkMark} src={checkMark} alt="checkMark" />
            </div>
          </div>
          {
            props.currentMethod === "phone" ?
              <>
                <div onClick={()=>props.setCurrentStep(1)} className={Styles.phoneInputBox}>
                  <label className={`${Styles.floatingLabel} ${Styles.phoneFloatingLabel}`}>Phone</label>
                  <div className="d-flex">
                    <input onChange={()=>{}} className={Styles.phoneInput} placeholder=" " name='phone' type="number" value={props.credentials.phone} />
                    <img className={Styles.checkMark} src={checkMark} alt="checkMark" />
                  </div>
                </div>
              </>
              :
              props.currentMethod === "email" ?
                <>
                  <div onClick={()=>props.setCurrentStep(1)} className={Styles.emailInputBox}>
                    <label className={`${Styles.floatingLabel} ${Styles.emailFloatingLabel}`}>Email</label>
                    <div className="d-flex">
                      <input onChange={()=>{}} className={Styles.emailInput} placeholder=" " name='email' type="email" value={props.credentials.email} />
                      <img className={Styles.checkMark} src={checkMark} alt="checkMark" />
                    </div>
                  </div>
                </>
                :
                null
          }

          <div onClick={()=>props.setCurrentStep(1)} className={Styles.dobInputBox}>
            <label className={`${Styles.floatingLabel} ${Styles.dobFloatingLabel}`}>Date of birth</label>
            <div className="d-flex">
              <input onChange={()=>{}} className={Styles.dobInput} placeholder=" " name='dob' type="text" value={dob} />
              <img className={Styles.checkMark} src={checkMark} alt="checkMark" />
            </div>
          </div>
        </div>
        <p className={Styles.agreementText}>By signing up, you agree to the <a href="">Terms of Service</a> and <a href="">Privacy Policy</a>, including <a href="">Cookie Use</a>. Twitter may use your contact information, including your email address and phone number for purposes outlined in our Privacy Policy, like keeping your account secure and personalising our services, including ads. <a href="">Learn more</a>. Others will be able to find you by email or phone number, when provided, unless you choose otherwise <a href="">here</a>.</p>
      </div>


      <div className={`${Styles.modalFooter}`}>
        <button type="submit" className={`btn btn-primary rounded-pill ${Styles.nextButton}`}>Sign&nbsp;up</button>
      </div>
    </form>
  )
}
