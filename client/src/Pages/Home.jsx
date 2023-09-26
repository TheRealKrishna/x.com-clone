import React from 'react';
import logo from '../Images/logo.svg';
import Styles from "../css/Home.module.css"
import googleLogo from "../Images/googleLogo.svg";
import appleLogo from "../Images/appleLogo.svg";
import CreateAccountModal from '../Layout/CreateAccountModal';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
  return (
    <>
    <CreateAccountModal  Styles = {Styles}/>
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
                    <button className={`btn btn-light rounded-pill ${Styles.signUpWithGoogleButton}`}><img src={googleLogo} className={Styles.googleLogo} alt="google Logo" />Sign up with Google</button>
                    <button className={`btn btn-light rounded-pill ${Styles.signUpWithAppleButton}`}><img src={appleLogo} className={Styles.appleLogo} alt="apple Logo" />Sign up with Apple</button>
                    <div className={Styles.orDivider}>or</div>
                    <button className={`btn btn-primary rounded-pill ${Styles.createAccountButton}`} data-bs-toggle="modal" data-bs-target="#signupModal" onClick={()=>navigate("/i/flow/signup")}>Create account</button>
                    <p className={Styles.agreementText}>By signing up, you agree to the <a href="">Terms of Service</a> and <a href="">Privacy Policy</a>, including <a href="">Cookie Use</a>.</p>
                </div>
                </div>
                <div className={Styles.loginContainer}>
                    <p className={Styles.loginText}>Already have an account?</p>
                    <button className={`btn btn-outline-info rounded-pill ${Styles.loginButton}`}>Sign in</button>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}
