import React, { useState } from "react";

import { Modal, Button } from "../ui";
import Styles from "../css/Auth.module.css";
import logo from "../Images/logo.svg";
import googleLogo from "../Images/googleLogo.svg";
import { authApi } from "../api";
import { setToken, hasGoogle } from "../api/config";
import { getCountry } from "../utils/country";
import { notifySuccess } from "../utils/toast";

/**
 * Two-step login: identifier (username/email/phone) → password.
 */
export default function LoginModal({ open, onClose, onAuthed, onSwitchToSignup, googleLogin }) {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setStep(1);
    setIdentifier("");
    setPassword("");
    setError("");
    onClose?.();
  };

  const next = async () => {
    if (!identifier.trim()) {
      setError("Please enter your username, email, or phone.");
      return;
    }
    setBusy(true);
    const res = await authApi.loginValidate(identifier.trim(), await getCountry());
    setBusy(false);
    if (res.success) {
      setError("");
      setStep(2);
    } else {
      setError(res.error || "We couldn’t find your account.");
    }
  };

  const submit = async () => {
    setBusy(true);
    const res = await authApi.login({ name: identifier.trim(), password, country: await getCountry() });
    setBusy(false);
    if (res.success) {
      setToken(res.authToken);
      notifySuccess("Welcome back!");
      close();
      onAuthed?.();
    } else {
      setError(res.error || "Wrong password.");
    }
  };

  return (
    <Modal open={open} onClose={close} maxWidth={600}>
      <div className={Styles.modalBody}>
        <div className={Styles.modalLogo}>
          <img src={logo} alt="X" />
        </div>

        {step === 1 ? (
          <>
            <h1 className={Styles.modalTitle}>Sign in to X</h1>
            {hasGoogle && (
              <>
                <button className={Styles.socialBtn} onClick={googleLogin} style={{ marginBottom: 20 }}>
                  <img src={googleLogo} alt="" /> Sign in with Google
                </button>
                <div className={Styles.divider} style={{ marginBottom: 20 }}>
                  or
                </div>
              </>
            )}
            <div className={Styles.field}>
              <input
                className={`${Styles.input} ${identifier ? Styles.inputFilled : ""} ${error ? Styles.inputError : ""}`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && next()}
              />
              <label className={Styles.floatLabel}>Phone, email, or username</label>
            </div>
            {error && <p className={Styles.error}>{error}</p>}
            <div className={Styles.footerBtn}>
              <Button size="lg" variant="secondary" onClick={next} disabled={busy}>
                {busy ? "Checking…" : "Next"}
              </Button>
              <p className={Styles.subText}>
                Don’t have an account?{" "}
                <a
                  href="/i/flow/signup"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitchToSignup?.();
                  }}
                >
                  Sign up
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className={Styles.modalTitle}>Enter your password</h1>
            <div className={Styles.reviewField}>
              <div className={Styles.reviewLabel}>Account</div>
              <div className={Styles.reviewValue}>{identifier}</div>
            </div>
            <div className={Styles.field}>
              <input
                type="password"
                className={`${Styles.input} ${password ? Styles.inputFilled : ""} ${error ? Styles.inputError : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <label className={Styles.floatLabel}>Password</label>
            </div>
            {error && <p className={Styles.error}>{error}</p>}
            <div className={Styles.footerBtn}>
              <Button size="lg" variant="secondary" onClick={submit} disabled={busy || !password}>
                {busy ? "Signing in…" : "Log in"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
