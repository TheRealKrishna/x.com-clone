import React, { useState } from "react";

import { Modal, Button } from "../ui";
import Styles from "../css/Auth.module.css";
import logo from "../Images/logo.svg";
import { authApi } from "../api";
import { setToken } from "../api/config";
import { getCountry } from "../utils/country";
import { notify, notifySuccess } from "../utils/toast";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const now = new Date();
const YEARS = Array.from({ length: 110 }, (_, i) => now.getFullYear() - i);

function daysIn(month, year) {
  if (month === "") return 31;
  return new Date(year || 2000, Number(month) + 1, 0).getDate();
}

/**
 * Multi-step signup: details (name + email/phone + DOB) → password → submit.
 */
export default function SignupModal({ open, onClose, onAuthed }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("email");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", month: "", day: "", year: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep(1);
    setForm({ name: "", email: "", phone: "", password: "", month: "", day: "", year: "" });
    setErrors({});
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const dobValid = form.month !== "" && form.day !== "" && form.year !== "";
  const dob = dobValid ? new Date(Number(form.year), Number(form.month), Number(form.day)) : null;

  const validateDetails = () => {
    const e = {};
    if (!form.name.trim()) e.name = "What’s your name?";
    if (method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    if (method === "phone" && form.phone.trim().length < 5) e.phone = "Please enter a valid phone number.";
    if (!dobValid) e.dob = "Please select your full date of birth.";
    else {
      const age = (now - dob) / (365.25 * 24 * 3600 * 1000);
      if (age < 13) e.dob = "You must be at least 13 years old.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validateDetails()) return;
    setBusy(true);
    // Server-side uniqueness check before moving on.
    const check = method === "email" ? await authApi.emailValidate(form.email) : await authApi.phoneValidate(form.phone, await getCountry());
    setBusy(false);
    if (!check.success) {
      setErrors({ [method]: check.error });
      return;
    }
    setStep(2);
  };

  const submit = async () => {
    if (form.password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters." });
      return;
    }
    setBusy(true);
    const payload = { name: form.name.trim(), password: form.password, dob };
    let res;
    if (method === "email") res = await authApi.signUpWithEmail({ ...payload, email: form.email });
    else res = await authApi.signUpWithPhone({ ...payload, phone: form.phone, country: await getCountry() });
    setBusy(false);
    if (res.success) {
      setToken(res.authToken);
      notifySuccess("Welcome to X!");
      reset();
      onAuthed?.();
    } else {
      notify(res.error || "Could not create account.");
      setStep(1);
    }
  };

  return (
    <Modal open={open} onClose={close} maxWidth={600} title={step > 1 ? "" : undefined} headerRight={null}>
      <div className={Styles.modalBody}>
        <div className={Styles.modalLogo}>
          <img src={logo} alt="X" />
        </div>

        {step === 1 && (
          <>
            <h1 className={Styles.modalTitle}>Create your account</h1>
            <div className={Styles.field}>
              <input className={`${Styles.input} ${form.name ? Styles.inputFilled : ""} ${errors.name ? Styles.inputError : ""}`} value={form.name} onChange={set("name")} maxLength={50} />
              <label className={Styles.floatLabel}>Name</label>
            </div>
            {errors.name && <p className={Styles.error}>{errors.name}</p>}

            {method === "email" ? (
              <>
                <div className={Styles.field}>
                  <input className={`${Styles.input} ${form.email ? Styles.inputFilled : ""} ${errors.email ? Styles.inputError : ""}`} value={form.email} onChange={set("email")} type="email" />
                  <label className={Styles.floatLabel}>Email</label>
                </div>
                {errors.email && <p className={Styles.error}>{errors.email}</p>}
              </>
            ) : (
              <>
                <div className={Styles.field}>
                  <input className={`${Styles.input} ${form.phone ? Styles.inputFilled : ""} ${errors.phone ? Styles.inputError : ""}`} value={form.phone} onChange={set("phone")} type="tel" />
                  <label className={Styles.floatLabel}>Phone</label>
                </div>
                {errors.phone && <p className={Styles.error}>{errors.phone}</p>}
              </>
            )}
            <span className={Styles.switchMethod} onClick={() => { setMethod((m) => (m === "email" ? "phone" : "email")); setErrors({}); }}>
              Use {method === "email" ? "phone" : "email"} instead
            </span>

            <div className={Styles.dobSection}>
              <p className={Styles.dobTitle}>Date of birth</p>
              <p className={Styles.dobHint}>This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.</p>
              <div className={Styles.dobRow}>
                <select className={Styles.select} value={form.month} onChange={set("month")}>
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select className={Styles.select} value={form.day} onChange={set("day")}>
                  <option value="">Day</option>
                  {Array.from({ length: daysIn(form.month, form.year) }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className={Styles.select} value={form.year} onChange={set("year")}>
                  <option value="">Year</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {errors.dob && <p className={Styles.error} style={{ marginTop: 8 }}>{errors.dob}</p>}
            </div>

            <div className={Styles.footerBtn}>
              <Button size="lg" variant="secondary" onClick={next} disabled={busy}>
                {busy ? "Checking…" : "Next"}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={Styles.modalTitle}>You’ll need a password</h1>
            <p className={Styles.dobHint}>Make sure it’s 8 characters or more.</p>
            <div className={Styles.field}>
              <input type="password" className={`${Styles.input} ${form.password ? Styles.inputFilled : ""} ${errors.password ? Styles.inputError : ""}`} value={form.password} onChange={set("password")} autoFocus />
              <label className={Styles.floatLabel}>Password</label>
            </div>
            {errors.password && <p className={Styles.error}>{errors.password}</p>}
            <div className={Styles.footerBtn}>
              <Button size="lg" variant="secondary" onClick={submit} disabled={busy || form.password.length < 8}>
                {busy ? "Creating…" : "Sign up"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
