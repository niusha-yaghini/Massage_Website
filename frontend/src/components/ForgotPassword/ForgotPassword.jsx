import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./ForgotPassword.module.css";
import {
  FiPhone,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiHome,
  FiLogIn,
} from "react-icons/fi";
import Logo from "../../assets/images/Logo_white.png";
import { userService } from "../../services/userService";

const ForgotPassword = () => {
  // States
  const [step, setStep] = useState(1); // 1: شماره تلفن، 2: کد تایید، 3: رمز جدید
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [userPhone, setUserPhone] = useState(""); // اضافه شد

  const [codeInputs, setCodeInputs] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const navigate = useNavigate();

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newCodeInputs = [...codeInputs];
    newCodeInputs[index] = value;
    setCodeInputs(newCodeInputs);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all inputs are filled
    if (newCodeInputs.every((digit) => digit !== "") && index === 3) {
      // وقتی ۴ رقم کامل شد، فرم رو submit کن
      const fullCode = newCodeInputs.join("");
      formikStep2.setFieldValue("code", fullCode);

      // کمی تاخیر بده بعد submit کن
      setTimeout(() => {
        formikStep2.handleSubmit();
      }, 300);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // فرم مرحله ۱: وارد کردن شماره تلفن
  const formikStep1 = useFormik({
    initialValues: {
      phone: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست.")
        .required("شماره موبایل الزامی است."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        console.log("ارسال کد تایید به:", values.phone);

        // ذخیره شماره تلفن در state
        setUserPhone(values.phone);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSuccess(`کد تایید به شماره ${values.phone} ارسال شد.`);
        setStep(2);
        setCountdown(120);
      } catch (err) {
        setError("خطا در ارسال کد تایید. لطفاً مجدداً تلاش کنید.");
      } finally {
        setLoading(false);
      }
    },
  });

  // فرم مرحله ۲: وارد کردن کد تایید
  const formikStep2 = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .matches(/^[0-9]{4}$/, "کد تایید باید ۴ رقمی باشد") // 6 به 4 تغییر کرد
        .required("کد تایید الزامی است."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        console.log("تأیید کد:", values.code);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (values.code === "1234") {
          setSuccess("کد تایید صحیح است.");
          setStep(3);
          setCodeInputs(["", "", "", ""]);
        } else {
          setError("کد تایید نامعتبر است.");
          setCodeInputs(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } catch (err) {
        setError("خطا در تأیید کد");
      } finally {
        setLoading(false);
      }
    },
  });

  // فرم مرحله ۳
  const formikStep3 = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد.")
        .matches(/[a-zA-Z]/, "رمز عبور باید شامل حروف باشد.")
        .matches(/[0-9]/, "رمز عبور باید شامل عدد باشد.")
        .required("رمز عبور جدید الزامی است."),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref("newPassword"), null],
          "رمز عبور و تأیید آن یکسان نیستند."
        )
        .required("تأیید رمز عبور الزامی است."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        // استفاده از شماره تلفن ذخیره شده
        const phone = userPhone;

        console.log("Attempting to reset password for:", phone);

        // فراخوانی سرویس واقعی
        const result = await userService.resetPassword(
          phone,
          values.newPassword,
          values.confirmPassword
        );

        setSuccess(result.message || "رمز عبور با موفقیت تغییر یافت.");

        // هدایت به صفحه لاگین بعد از ۲ ثانیه
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        console.error("Reset password error:", err);
        setError(err.message || "خطا در تغییر رمز عبور");
      } finally {
        setLoading(false);
      }
    },
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, clearMessages]);

  return (
    <div className={styles.forgotPasswordPage}>
      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
      </div>

      {/* Header */}
      <header className={styles.forgotHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerActions}>
            <Link to="/" className={styles.backHome}>
              <FiHome />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
            <Link to="/login" className={styles.loginLink}>
              <FiArrowLeft />
              <span>بازگشت به ورود</span>
            </Link>
          </div>

          {/* <div className={styles.headerActions}>
            <Link to="/" className={styles.backHome}>
              <FiHome />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
            <Link to="/login" className={styles.loginLink}>
              <FiLogIn />
              <span>ورود</span>
            </Link>
          </div> */}

          <div className={styles.logo}>
            <span className={styles.logospa}>فرشاد ماساژ</span>
            <img src={Logo} alt="فرشاد ماساژ" className={styles.logoImage} />
            <div className={styles.logoPulse}></div>
          </div>
        </div>
      </header>

      {/* <div className={styles.backgroundAnimation}>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
      </div> */}

      {/* Main Content */}
      <main className={styles.forgotMain}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>بازیابی رمز عبور</h1>
            <p className={styles.formSubtitle}>
              {step === 1 && "شماره موبایل خود را وارد کنید."}
              {step === 2 && "کد تایید ارسال شده را وارد کنید."}
              {step === 3 && "رمز عبور جدید خود را تنظیم کنید."}
            </p>
          </div>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
              <div className={styles.stepNumber}>۱</div>
              <div className={styles.stepLabel}>شماره تلفن</div>
            </div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
              <div className={styles.stepNumber}>۲</div>
              <div className={styles.stepLabel}>کد تایید</div>
            </div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
              <div className={styles.stepNumber}>۳</div>
              <div className={styles.stepLabel}>رمز جدید</div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className={styles.errorAlert}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={styles.successAlert}>
              <FiCheckCircle />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Enter Phone Number */}
          {step === 1 && (
            <form
              onSubmit={formikStep1.handleSubmit}
              className={styles.forgotForm}
            >
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  <FiPhone className={styles.labelIcon} />
                  شماره موبایل ثبت شده
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`${styles.formInput} ${
                      formikStep1.touched.phone && formikStep1.errors.phone
                        ? styles.inputError
                        : ""
                    }`}
                    placeholder="09123456789"
                    onChange={formikStep1.handleChange}
                    onBlur={formikStep1.handleBlur}
                    value={formikStep1.values.phone}
                    dir="ltr"
                  />
                </div>
                {formikStep1.touched.phone && formikStep1.errors.phone && (
                  <div className={styles.errorMessage}>
                    {formikStep1.errors.phone}
                  </div>
                )}
              </div>

              <div className={styles.formNote}>
                <FiAlertCircle className={styles.noteIcon} />
                <span> کد تایید به این شماره ارسال خواهد شد.</span>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !formikStep1.isValid}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    ارسال کد تایید
                    <FiArrowRight className={styles.buttonIcon} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter Verification Code */}
          {step === 2 && (
            <form
              onSubmit={formikStep2.handleSubmit}
              className={styles.forgotForm}
            >
              <div className={styles.formGroup}>
                <div className={styles.codeInputsContainer}>
                  {codeInputs.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={styles.codeInput}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {formikStep2.touched.code && formikStep2.errors.code && (
                  <div className={styles.errorMessage}>
                    {formikStep2.errors.code}
                  </div>
                )}
              </div>

              <div className={styles.timerSection}>
                {countdown > 0 ? (
                  <div className={styles.timer}>
                    <span>ارسال مجدد کد پس از:</span>
                    <span className={styles.time}>{formatTime(countdown)}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.resendButton}
                    onClick={() => {
                      setCountdown(120);
                      setSuccess("کد تایید مجدداً ارسال شد.");
                      setCodeInputs(["", "", "", ""]);
                      if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                      }
                    }}
                  >
                    ارسال مجدد کد تایید
                  </button>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => {
                    setStep(1);
                    clearMessages();
                  }}
                >
                  <FiArrowRight className={styles.buttonIcon} />
                  بازگشت
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || codeInputs.some((digit) => digit === "")}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      در حال تأیید...
                    </>
                  ) : (
                    <>
                      تأیید کد
                      <FiArrowLeft className={styles.buttonIcon} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Enter New Password */}
          {step === 3 && (
            <form
              onSubmit={formikStep3.handleSubmit}
              className={styles.forgotForm}
            >
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.formLabel}>
                  <FiLock className={styles.labelIcon} />
                  رمز عبور جدید
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className={`${styles.formInput} ${
                      formikStep3.touched.newPassword &&
                      formikStep3.errors.newPassword
                        ? styles.inputError
                        : ""
                    }`}
                    placeholder="••••••••"
                    onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur}
                    value={formikStep3.values.newPassword}
                    dir="ltr"
                  />
                </div>
                {formikStep3.touched.newPassword &&
                  formikStep3.errors.newPassword && (
                    <div className={styles.errorMessage}>
                      {formikStep3.errors.newPassword}
                    </div>
                  )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <FiLock className={styles.labelIcon} />
                  تأیید رمز عبور جدید
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className={`${styles.formInput} ${
                      formikStep3.touched.confirmPassword &&
                      formikStep3.errors.confirmPassword
                        ? styles.inputError
                        : ""
                    }`}
                    placeholder="••••••••"
                    onChange={formikStep3.handleChange}
                    onBlur={formikStep3.handleBlur}
                    value={formikStep3.values.confirmPassword}
                    dir="ltr"
                  />
                </div>
                {formikStep3.touched.confirmPassword &&
                  formikStep3.errors.confirmPassword && (
                    <div className={styles.errorMessage}>
                      {formikStep3.errors.confirmPassword}
                    </div>
                  )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setStep(2)}
                >
                  <FiArrowRight className={styles.buttonIcon} />
                  بازگشت
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || !formikStep3.isValid}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      در حال تغییر رمز...
                    </>
                  ) : (
                    <>
                      تغییر رمز عبور
                      <FiArrowLeft className={styles.buttonIcon} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Links */}
          <div className={styles.formFooter}>
            <p>
              مشکل دیگری دارید؟{" "}
              <Link to="/contact" className={styles.footerLink}>
                به پشتیبانی پیام دهید.
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
