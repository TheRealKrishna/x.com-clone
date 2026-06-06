import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import logo from "../Images/logo.svg";
import googleLogo from "../Images/googleLogo.svg";
import Styles from "../css/Home.module.css";
import CreateAccountModal from "../Layout/CreateAccountModal";
import LoginModal from "../Layout/LoginModal";
import Loader from "../Components/Loader";
import { authApi } from "../api";
import { setToken, isLoggedIn, hasGoogle } from "../api/config";
import { notify, notifySuccess } from "../utils/toast";

// Google login hook is only safe to call inside a GoogleOAuthProvider, which we
// only mount when a client ID is configured. This wrapper keeps the rules of
// hooks intact while letting the button render conditionally.
function useOptionalGoogleLogin(onToken) {
  if (!hasGoogle) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGoogleLogin({
    scope: "https://www.googleapis.com/auth/user.birthday.read",
    onSuccess: onToken,
  });
}

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const googleLogin = useOptionalGoogleLogin(async (tokenResponse) => {
    const json = await authApi.loginWithGoogle(tokenResponse);
    if (json.success) {
      setToken(json.authToken);
      navigate("/home");
      notifySuccess("Logged in successfully!");
    } else {
      notify(json.error || "Oops, something went wrong. Please try again later.");
    }
  });

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/home");
    } else {
      const t = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(t);
    }
  }, [navigate]);

  if (loading) return <Loader />;

  return (
    <>
      <CreateAccountModal Styles={Styles} />
      <LoginModal Styles={Styles} googleLogin={googleLogin} />
      <div className="container">
        <div className={Styles.flexContainer}>
          <div className={Styles.logoContainer}>
            <img src={logo} className={Styles.logo} alt="x.com Logo" />
          </div>
          <div className={Styles.textContainer}>
            <h1 className={Styles.title}>Happening now</h1>
            <div className={Styles.alignLeftContainer}>
              <h2 className={Styles.subTitle}>Join today.</h2>
              <div className={Styles.signUpContainer}>
                {hasGoogle && (
                  <button
                    className={`btn btn-light rounded-pill ${Styles.signUpWithGoogleButton}`}
                    onClick={googleLogin}
                  >
                    <img src={googleLogo} className={Styles.googleLogo} alt="google Logo" />
                    Sign up with Google
                  </button>
                )}
                <div className={Styles.orDivider}>{hasGoogle ? "or" : "Get started"}</div>
                <button
                  className={`btn btn-primary rounded-pill ${Styles.createAccountButton}`}
                  data-bs-toggle="modal"
                  data-bs-target="#signupModal"
                  onClick={() => navigate("/i/flow/signup")}
                >
                  Create account
                </button>
                <p className={Styles.agreementText}>
                  By signing up, you agree to the <a href="/">Terms of Service</a> and{" "}
                  <a href="/">Privacy Policy</a>, including <a href="/">Cookie Use</a>.
                </p>
              </div>
            </div>
            <div className={Styles.loginContainer}>
              <p className={Styles.loginText}>Already have an account?</p>
              <button
                className={`btn btn-outline-info rounded-pill ${Styles.loginButton}`}
                data-bs-toggle="modal"
                data-bs-target="#loginModal"
                onClick={() => navigate("/i/flow/login")}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
