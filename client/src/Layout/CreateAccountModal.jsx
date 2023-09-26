import React, { useEffect, useRef, useState } from 'react'
import Styles from "../css/CreateAccountModal.module.css"
import closeButtonIcon from "../Images/closeButtonIcon.svg";
import backButtonIcon from "../Images/backButtonIcon.svg";
import Step1 from './createAccountSteps/Step1';
import { useLocation, useNavigate } from 'react-router-dom';


export default function CreateAccountModal(props) {
    const [currentStep, setCurrentStep] = useState(0);
    const signupModal = useRef();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const renderCurrentStep = ()=>{
        switch (currentStep) {
            case 1: 
                return <Step1/>
            case 2:
                return <Step1/>
            case 3:
                return <Step1/>
            case 4:
                return <Step1/>
            case 5:
                return <Step1/>
        
            default:
                break;
        }
    }

    useEffect(()=>{
        if(currentStep < 0){
            setCurrentStep(0) // this won't let current step go below 1;
        }

        if(pathname === "/i/flow/signup"){
            setCurrentStep(1)
        }

        if(currentStep === 0){
            navigate("/")
        }
        else if(currentStep === 1){
            navigate("/i/flow/signup");
            document.getElementsByClassName(props.Styles.createAccountButton)[0].click();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentStep, pathname])


    useEffect(()=>{
        signupModal.current.addEventListener('shown.bs.modal',()=>{
            document.title = "Sign up for Twitter / X"
        })
        signupModal.current.addEventListener('hidden.bs.modal',()=>{
            document.title = "X. It's what's happening / X"
        })
    },[])

  return (
    <div>
      <div className={`modal ${Styles.fade}`} ref={signupModal} id="signupModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="signupModalLabel" aria-hidden="true">
  <div className={`modal-dialog ${Styles.modalDialog}`}>
    
    <div className={`modal-content ${Styles.modalBox}`}>
      <div className={`${Styles.modalHeader}`}>
        {
            // close button changes to back button according to the steps
            currentStep === 1 ?    
            <button type="button" className={Styles.closeButton} data-bs-dismiss="modal" aria-label="Close" onClick={()=>{
                setCurrentStep(prev=>0)
                navigate("/")
            }}><img className={Styles.closeButtonIcon} src={closeButtonIcon} alt="closebutton" /></button>
            :
            <button type="button" className={Styles.backButton} onClick={()=>setCurrentStep(prev=>prev-1)}><img className={Styles.backButtonIcon} src={backButtonIcon} alt="closebutton" /></button>
        }
        <h1 className={`modal-title fs-5 ${Styles.modalTitle}`} id="signupModalLabel">Step {currentStep} of 5</h1>
      </div>
      <div className={`modal-body ${Styles.modalBody}`}>

        {renderCurrentStep()}

      
      </div>
    </div>
  </div>
</div>
    </div>
  )
}
