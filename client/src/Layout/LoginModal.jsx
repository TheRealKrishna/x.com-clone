import React, { useEffect, useRef, useState } from 'react'
import Styles from "../css/LoginModal.module.css"
import closeButtonIcon from "../Images/closeButtonIcon.svg";
import backButtonIcon from "../Images/backButtonIcon.svg";
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from '../Components/Spinner';
import Step1 from './LoginSteps/Step1';
import Step2 from './LoginSteps/Step2';
import toast from 'react-hot-toast';
import logo from '../Images/logo.svg';


export default function LoginModal(props) {
    const [loading, setLoading] = useState(true)
    const [currentMethod, setCurrentMethod] = useState("email");
    const [currentStep, setCurrentStep] = useState(1);
    const loginModal = useRef();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ name: "", password: "", method: "" });
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1 googleLogin={props.googleLogin} currentMethod={currentMethod} setCurrentMethod={setCurrentMethod} credentials={credentials} setCredentials={setCredentials} setCurrentStep={setCurrentStep} loading={loading} setLoading={setLoading} />
            case 2:
                return <Step2 currentMethod={currentMethod} setCurrentMethod={setCurrentMethod} credentials={credentials} setCredentials={setCredentials} setCurrentStep={setCurrentStep} loading={loading} setLoading={setLoading} />
            default:
                break;
        }
    }

    const login = async () => {
        setLoading(true)
        const getUserInfo = async () => {
            return fetch("https://ipapi.co/json").then(response => response.json())
                .then(data => data).catch(error => {
                    toast(json.error ? json.error : 'Oops, something went wrong. Please try a different web browser.', {
                        style: {
                            border: '1px solid white',
                            padding: '16px 30px',
                            color: 'white',
                            backgroundColor: "rgb(29, 155, 240)",
                        }
                    });
                });;
        }
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
            method: "post",
            body: JSON.stringify({ ...credentials, country: (await getUserInfo()).country }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const json = await response.json();
        if (json.success) {
            localStorage.setItem("auth-token", json.authToken)
            navigate("/home")
            toast.success('Logged in successfully!', {
                style: {
                    border: '1px solid white',
                    padding: '16px 30px',
                    color: 'white',
                    backgroundColor: "rgb(29, 155, 240)",
                },
                iconTheme: {
                    primary: 'white',
                    secondary: 'rgb(29, 155, 240)',
                },
            });

        }
        else {
            if (json.authError) {
                setCurrentStep(prev => 1);
            }
            else {
                setCurrentStep(prev => 2);
            }
            toast(json.error ? json.error : 'Oops, something went wrong. Please try again later.', {
                style: {
                    border: '1px solid white',
                    padding: '16px 30px',
                    color: 'white',
                    backgroundColor: "rgb(29, 155, 240)",
                }
            });
            setLoading(false)
        }
    }

    useEffect(() => {
        if (currentStep < 1) {
            setCurrentStep(1) // this won't let current step go below 1;
        }
        if (pathname === "/i/flow/login") {
            document.getElementsByClassName(props.Styles.loginButton)[0].click();
        }

        if (currentStep > 2) {
            login();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, pathname])

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 500);
    }, [])


    useEffect(() => {
        loginModal.current.addEventListener('shown.bs.modal', () => {
            document.title = "Log in to Twitter / X"
        })
        loginModal.current.addEventListener('hidden.bs.modal', () => {
            document.title = "X. It's what's happening / X"
        })
    }, [])

    return (
        <div>
            <div className={`modal ${Styles.fade}`} ref={loginModal} id="loginModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
                <div className={`modal-dialog ${Styles.modalDialog}`}>
                    <div className={`modal-content ${Styles.modalBox}`}>
                        {loading ? <Spinner /> :
                            <>
                                <div className={`${Styles.modalHeader}`}>
                                    <button type="button" className={Styles.closeButton} data-bs-dismiss="modal" aria-label="Close" onClick={() => {
                                        navigate("/")
                                        setCurrentStep(prev => 1)
                                    }}><img className={Styles.closeButtonIcon} src={closeButtonIcon} alt="closebutton" /></button>
                                    <img src={logo} className={Styles.logo} alt="x.com Logo" />
                                    <img src="" className="" alt="" />
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
