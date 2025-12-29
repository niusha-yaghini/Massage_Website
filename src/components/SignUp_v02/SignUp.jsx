import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Signup.module.css";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiLogIn,
  FiArrowRight,
  FiCalendar,
  FiGift,
  FiShield,
} from "react-icons/fi";
import Logo from "../../assets/images/Logo_white.png";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // طرح اعتبارسنجی
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(3, "نام باید حداقل ۳ کاراکتر باشد")
      .required("نام و نام خانوادگی الزامی است"),
    email: Yup.string().email("ایمیل معتبر نیست").required("ایمیل الزامی است"),
    phone: Yup.string()
      .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست")
      .required("شماره موبایل الزامی است"),
    password: Yup.string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
      .matches(/[a-z]/, "رمز عبور باید شامل حروف کوچک باشد")
      .matches(/[A-Z]/, "رمز عبور باید شامل حروف بزرگ باشد")
      .matches(/[0-9]/, "رمز عبور باید شامل عدد باشد")
      .required("رمز عبور الزامی است"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "رمز عبور و تأیید آن یکسان نیستند")
      .required("تأیید رمز عبور الزامی است"),
    terms: Yup.boolean().oneOf([true], "باید قوانین را پذیرفته باشید"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);

      // فقط نمایش لاگ در کنسول
      console.log("Signup form data:", {
        ...values,
        password: "***", // مخفی کردن پسورد
      });

      // نمایش پیام موفقیت
      setSuccess(`حساب کاربری ${values.fullName} ایجاد شد!`);

      // هدایت به صفحه ورود
      setTimeout(() => {
        navigate("/login");
        setLoading(false);
      }, 2000);
    },
  });

  return (
    <div className={styles.signupPage}>
      {/* Background Particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.particle}></div>
        ))}
      </div>

      {/* Header */}
      <header className={styles.signupHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerActions}>
            <Link to="/" className={styles.backHome}>
              <FiHome />
              <span>بازگشت به سایت</span>
            </Link>
            <Link to="/login" className={styles.loginLink}>
              <FiLogIn />
              <span>ورود</span>
            </Link>
          </div>

          <div className={styles.logo}>
            <span className={styles.logospa}>اسپا اکسیر</span>
            <img src={Logo} alt="اسپا اکسیر" className={styles.logoImage} />
            <div className={styles.logoPulse}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.signupMain}>
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h2>ایجاد حساب کاربری</h2>
            <p>لطفا اطلاعات مورد نیاز را وارد کنید</p>
          </div>

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

          <form onSubmit={formik.handleSubmit} className={styles.signupForm}>
            {/* Full Name */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  <FiUser className={styles.labelIcon} />
                  نام و نام خانوادگی
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={`${styles.formInput} ${
                    formik.touched.fullName && formik.errors.fullName
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="علی احمدی"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.fullName}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className={styles.errorMessage}>
                    {formik.errors.fullName}
                  </div>
                )}
              </div>
            </div>

            {/* Email and Phone */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  <FiPhone className={styles.labelIcon} />
                  موبایل
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`${styles.formInput} ${
                    formik.touched.phone && formik.errors.phone
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="09123456789"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  dir="ltr"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className={styles.errorMessage}>
                    {formik.errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                <FiLock className={styles.labelIcon} />
                رمز عبور
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.formInput} ${styles.formInputpassword} ${
                    formik.touched.password && formik.errors.password
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="••••••••"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  dir="ltr"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {formik.touched.password && formik.errors.password && (
                <div className={styles.errorMessage}>
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !formik.isValid}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  در حال ایجاد حساب...
                </>
              ) : (
                <>
                  ایجاد حساب کاربری
                  <FiArrowRight className={styles.buttonIcon} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Signup;
