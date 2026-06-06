import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import logo from "../Images/logo.svg";
import googleLogo from "../Images/googleLogo.svg";
import appleLogo from "../Images/appleLogo.svg";
import Styles from "../css/Auth.module.css";
import { Spinner } from "../ui";
import SignupModal from "../Layout/SignupModal";
import LoginModal from "../Layout/LoginModal";
import { authApi } from "../api";
import { setToken, isLoggedIn, hasGoogle } from "../api/config";
import { notify, notifySuccess } from "../utils/toast";

const APPLE_DISABLED =
  "Sign in with Apple is taking a short nap — our Apple credentials expired and we're renewing them. Please use Google or email for now.";

// useGoogleLogin must be called unconditionally; we only mount Landing inside a
// GoogleOAuthProvider when hasGoogle, but guard anyway.
function useOptionalGoogleLogin(onToken) {
  if (!hasGoogle) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGoogleLogin({ scope: "https://www.googleapis.com/auth/user.birthday.read", onSuccess: onToken });
}

export default function Landing() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);

  const googleLogin = useOptionalGoogleLogin(async (tokenResponse) => {
    const res = await authApi.loginWithGoogle(tokenResponse);
    if (res.success) {
      setToken(res.authToken);
      notifySuccess("Logged in successfully!");
      navigate("/home");
    } else {
      notify(res.error || "Something went wrong. Please try again.");
    }
  });

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/home");
      return;
    }
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [navigate]);

  if (loading) return <Spinner />;

  const onAuthed = () => navigate("/home");

  return (
    <div className={Styles.landing}>
      <div className={Styles.hero}>
        <div className={Styles.heroLogo}>
          <img src={logo} alt="X" />
        </div>
        <div className={Styles.heroText}>
          <h1 className={Styles.bigTitle}>Happening now</h1>
          <h2 className={Styles.joinTitle}>Join today.</h2>
          <div className={Styles.actions}>
            {hasGoogle && (
              <button className={Styles.socialBtn} onClick={googleLogin}>
                <img src={googleLogo} alt="" /> Sign up with Google
              </button>
            )}
            <button className={Styles.socialBtn} disabled title={APPLE_DISABLED}>
              <img src={appleLogo} alt="" /> Sign up with Apple
            </button>
            <div className={Styles.divider}>or</div>
            <button
              className="btn"
              onClick={() => navigate("/i/flow/signup")}
              style={{ background: "var(--x-blue)", color: "#fff", border: "none", borderRadius: "var(--radius-pill)", padding: "11px 0", fontWeight: 700, cursor: "pointer" }}
            >
              Create account
            </button>
            <p className={Styles.terms}>
              By signing up, you agree to the <a href="/">Terms of Service</a> and <a href="/">Privacy Policy</a>, including{" "}
              <a href="/">Cookie Use</a>.
            </p>
          </div>

          <p className={Styles.loginPrompt}>Already have an account?</p>
          <div className={Styles.actions}>
            <button
              className="btn"
              onClick={() => navigate("/i/flow/login")}
              style={{ background: "transparent", color: "var(--x-blue)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-pill)", padding: "11px 0", fontWeight: 700, cursor: "pointer" }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      <SignupModal open={pathname === "/i/flow/signup"} onClose={() => navigate("/")} onAuthed={onAuthed} />
      <LoginModal
        open={pathname === "/i/flow/login"}
        onClose={() => navigate("/")}
        onAuthed={onAuthed}
        onSwitchToSignup={() => navigate("/i/flow/signup")}
        googleLogin={googleLogin}
      />
    </div>
  );
}
