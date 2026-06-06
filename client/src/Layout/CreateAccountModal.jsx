import React, { useEffect, useRef, useState } from 'react'
import Styles from "../css/CreateAccountModal.module.css"
import closeButtonIcon from "../Images/closeButtonIcon.svg";
import backButtonIcon from "../Images/backButtonIcon.svg";
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../Components/Spinner';
import Step1 from './CreateAccountSteps/Step1';
import Step2 from './CreateAccountSteps/Step2';
import Step3 from './CreateAccountSteps/Step3';
import Step4 from './CreateAccountSteps/Step4';
import Step5 from './CreateAccountSteps/Step5';
import { authApi } from '../api';
import { setToken } from '../api/config';
import { getCountry } from '../utils/country';
import { notify, notifySuccess } from '../utils/toast';


export default function CreateAccountModal(props) {
    const [loading, setLoading] = useState(true)
    const [currentMethod, setCurrentMethod] = useState("email");
    const [currentStep, setCurrentStep] = useState(1);
    const signupModal = useRef();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ name: "", phone: "", email: "", password: "", dob: undefined });
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1 currentMethod={currentMethod} setCurrentMethod={setCurrentMethod} credentials={credentials} setCredentials={setCredentials} setCurrentStep={setCurrentStep} loading={loading} setLoading={setLoading} />
            case 2:
                return <Step2 setCurrentStep={setCurrentStep} />
            case 3:
                return <Step3 currentMethod={currentMethod} credentials={credentials} setCurrentStep={setCurrentStep} loading={loading} setLoading={setLoading} />
            case 4:
                return <Step4 currentMethod={currentMethod} setCurrentMethod={setCurrentMethod} credentials={credentials} setCredentials={setCredentials} setCurrentStep={setCurrentStep} loading={loading} setLoading={setLoading} />
            case 5:
                return <Step5 currentMethod={currentMethod} setCurrentMethod={setCurrentMethod} credentials={credentials} setCredentials={setCredentials} setCurrentStep={setCurrentStep} loading={loading} setLoading={setLoading} />
            default:
                break;
        }
    }

    const createAccount = async () => {
        setLoading(true)
        let json;
        if (currentMethod === "email") {
            json = await authApi.signUpWithEmail(credentials);
        } else {
            const country = await getCountry();
            json = await authApi.signUpWithPhone({ ...credentials, country });
        }
        if (json.success) {
            setToken(json.authToken)
            navigate("/home")
            notifySuccess('Account successfully created!')
        } else {
            setCurrentStep(() => 1);
            notify(json.error || 'Oops, something went wrong. Please try again later.')
            setLoading(false)
        }
    }

    useEffect(() => {
        if (currentStep < 1) {
            setCurrentStep(1) // this won't let current step go below 1;
        }
        if (pathname === "/i/flow/signup") {
            document.getElementsByClassName(props.Styles.createAccountButton)[0].click();
        }

        if (currentStep > 5) {
            createAccount();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, pathname])

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 500);
    }, [])


    useEffect(() => {
        signupModal.current.addEventListener('shown.bs.modal', () => {
            document.title = "Sign up for Twitter / X"
        })
        signupModal.current.addEventListener('hidden.bs.modal', () => {
            document.title = "X. It's what's happening / X"
        })
    }, [])

    return (
        <div>
            <div className={`modal ${Styles.fade}`} ref={signupModal} id="signupModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="signupModalLabel" aria-hidden="true">
                <div className={`modal-dialog ${Styles.modalDialog}`}>
                    <div className={`modal-content ${Styles.modalBox}`}>
                        {loading ? <Spinner /> :
                            <>
                                <div className={`${Styles.modalHeader}`}>
                                    {
                                        // close button changes to back button according to the steps
                                        currentStep === 1 ?
                                            <button type="button" className={Styles.closeButton} data-bs-dismiss="modal" aria-label="Close" onClick={() => {
                                                navigate("/")
                                                setCurrentStep(prev => 1)
                                            }}><img className={Styles.closeButtonIcon} src={closeButtonIcon} alt="closebutton" /></button>
                                            :
                                            <button type="button" className={Styles.backButton} onClick={() => {
                                                if (currentStep === 5) {
                                                    setCurrentStep(prev => 1)
                                                }
                                                else {
                                                    setCurrentStep(prev => prev - 1)
                                                }

                                            }}><img className={Styles.backButtonIcon} src={backButtonIcon} alt="closebutton" /></button>
                                    }
                                    <h1 className={`modal-title fs-5 ${Styles.modalTitle}`} id="signupModalLabel">Step {currentStep} of 5</h1>
                                </div>
                                <div className={`modal-body ${Styles.modalBody}`}>

                                    {renderCurrentStep()}


                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
