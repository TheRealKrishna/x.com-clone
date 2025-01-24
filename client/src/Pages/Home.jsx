import React, { useEffect, useState } from 'react';
import logo from '../Images/logo.svg';
import Styles from "../css/Home.module.css"
import googleLogo from "../Images/googleLogo.svg";
import appleLogo from "../Images/appleLogo.svg";
import CreateAccountModal from '../Layout/CreateAccountModal';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';
import LoginModal from '../Layout/LoginModal';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import AppleLogin from 'react-apple-login';

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)

    const googleLogin = useGoogleLogin({
        scope: ['https://www.googleapis.com/auth/user.birthday.read'], onSuccess: async (tokenResponse) => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/loginwithgoogle`, {
                method: "post",
                body: JSON.stringify(tokenResponse),
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
                toast('Oops, something went wrong. Please try again later.', {
                    style: {
                        border: '1px solid white',
                        padding: '16px 30px',
                        color: 'white',
                        backgroundColor: "rgb(29, 155, 240)",
                    }
                })
            }
        },
    })

    useEffect(() => {
        if (localStorage.getItem("auth-token")) {
            navigate("/home")
        }
        else {
            setTimeout(() => {
                setLoading(false)
            }, 500);
        }
    }, [])
    return (
        loading ? <Loader /> :
            <>
                <CreateAccountModal Styles={Styles} />
                <LoginModal Styles={Styles} googleLogin={googleLogin} />
                <div className='container'>
                    <div className={Styles.flexContainer}>
                        <div className={Styles.logoContainer}>
                            <img src={logo} className={Styles.logo} alt="x.com Logo" />
                        </div>
                        <div className={Styles.textContainer}>
                            <h1 className={Styles.title}>Happening now</h1>
                            <div className={Styles.alignLeftContainer}>
                                <h2 className={Styles.subTitle}>Join today.</h2>
                                <div className={Styles.signUpContainer}>
                                    <button className={`btn btn-light rounded-pill ${Styles.signUpWithGoogleButton}`} onClick={googleLogin}><img src={googleLogo} className={Styles.googleLogo} alt="google Logo" />Sign up with Google</button>
                                    <button className={`btn btn-light rounded-pill ${Styles.signUpWithAppleButton}`}><img src={appleLogo} className={Styles.appleLogo} alt="apple Logo" />Sign up with Apple</button>
                                    <div className={Styles.orDivider}>or</div>
                                    <button className={`btn btn-primary rounded-pill ${Styles.createAccountButton}`} data-bs-toggle="modal" data-bs-target="#signupModal" onClick={() => navigate("/i/flow/signup")}>Create account</button>
                                    <p className={Styles.agreementText}>By signing up, you agree to the <a href="">Terms of Service</a> and <a href="">Privacy Policy</a>, including <a href="">Cookie Use</a>.</p>
                                </div>
                            </div>
                            <div className={Styles.loginContainer}>
                                <p className={Styles.loginText}>Already have an account?</p>
                                <button className={`btn btn-outline-info rounded-pill ${Styles.loginButton}`} data-bs-toggle="modal" data-bs-target="#loginModal" onClick={() => navigate("/i/flow/login")}>Sign in</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
    )
}
