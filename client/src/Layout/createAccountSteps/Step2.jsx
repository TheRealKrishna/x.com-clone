import React from 'react'
import Styles from "../../css/Step2.module.css"

export default function Step2(props) {

  const handleNextButton = async (e) => {
    e.preventDefault();
    props.setCurrentStep(prev=>prev+1);

  }

  return (
    <form onSubmit={handleNextButton} style={{ height: "100%" }} className='d-flex flex-column justify-content-between'>
      <div className={Styles.mainContainer}> 
        <h2 className={Styles.title}>Customise your experience</h2>
        <div>
        <p className={Styles.subTitle}>Track where you see X content across the web</p>
        <div className={Styles.checkBoxContianer}>
        <p className={Styles.checkBoxText}>X uses this data to personalise your experience. This web browsing history will never be stored with your name, email, or phone number.</p>
        <input className={Styles.checkBox} type="checkbox" name="" id="" />
        </div>
        </div>
        <p className={Styles.agreementText}>By signing up, you agree to our <a href="">Terms</a>, <a href="">Privacy Policy</a>, and <a href="">Cookie Use</a>. X may use your contact information, including your email address and phone number for purposes outlined in our Privacy Policy. <a href="">Learn more</a></p>
      </div>

      <div className={`${Styles.modalFooter}`}>
        <button type="submit" className={`btn btn-light rounded-pill ${Styles.nextButton}`}>Next</button>
      </div>
    </form>
  )
}
