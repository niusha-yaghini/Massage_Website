import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Login.module.css";
import { userService } from "../../services/userService";
import {
  // FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiUserPlus,
  FiArrowRight,
  FiStar,
  // FiShield,
  FiPhone,
} from "react-icons/fi";
import Logo from "../../assets/images/Logo_white.png";

const Login = () => {
  // ======== اضافه کردن stateها ========
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // ======== تعریف validationSchema ========
  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست")
      .required("شماره موبایل الزامی است"),
    password: Yup.string()
      .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
      .required("رمز عبور الزامی است"),
    rememberMe: Yup.boolean(),
  });

  // ======== تابع formik ========
  const formik = useFormik({
    initialValues: {
      phone: "", // به جای email
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        console.log("تلاش برای ورود با شماره:", values.phone);

        // استفاده از userService با شماره تماس
        const result = await userService.loginWithPhone(
          values.phone,
          values.password
        );

        console.log("نتیجه از userService:", result);

        if (result.success) {
          setSuccess(`خوش آمدید ${result.user?.full_name || ""}!`);

          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          setError(result.error || "خطا در ورود");
        }
      } catch (err) {
        console.error("خطای کامل:", err);
        setError(err.message || "خطا در ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className={styles.loginPage}>
      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
      </div>

      {/* Header */}
      <header className={styles.loginHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerActions}>
            <Link to="/" className={styles.backHome}>
              <FiHome />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
            <Link to="/signup" className={styles.signupLink}>
              <FiUserPlus />
              <span>ایجاد حساب</span>
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
      <main className={styles.loginMain}>
        <div className={styles.loginHero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              به دنیای <span className={styles.highlight}>آرامش</span> خوش آمدید
            </h1>
            <p className={styles.heroDescription}>
              با ورود به حساب کاربری خود، از تمامی خدمات اسپا اکسیر بهره‌مند
              شوید و نوبت‌های خود را مدیریت کنید.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <FiStar className={styles.featureIcon} />
                <span>مدیریت آسان نوبت‌ها</span>
              </div>
              <div className={styles.feature}>
                <FiStar className={styles.featureIcon} />
                <span>تخفیف‌های ویژه اعضا</span>
              </div>
              <div className={styles.feature}>
                <FiStar className={styles.featureIcon} />
                <span>تاریخچه خدمات دریافت شده</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualCircle}></div>
            <div className={styles.visualPattern}></div>
          </div>
        </div>

        {/* Login Form */}
        <div className={styles.loginFormSection}>
          <div className={styles.formHeader}>
            <h2>ورود به حساب کاربری</h2>
          </div>

          {/* نمایش خطا */}
          {error && (
            <div className={styles.errorAlert}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* نمایش موفقیت */}
          {success && (
            <div className={styles.successAlert}>
              <FiCheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className={styles.loginForm}>
            {/* Phone number Field */}
            {/* <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                <FiMail className={styles.labelIcon} />
                ایمیل
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`${styles.formInputemail} ${
                    formik.touched.email && formik.errors.email
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="example@spa-eksir.com"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  dir="ltr"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className={styles.errorMessage}>{formik.errors.email}</div>
              )}
            </div> */}

            {/* Phone Field - به جای Email Field */}
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>
                <FiPhone className={styles.labelIcon} />{" "}
                {/* ایمپورت FiPhone کن */}
                شماره موبایل
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`${styles.formInputemail} ${
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
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <div className={styles.errorMessage}>{formik.errors.phone}</div>
              )}
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <label htmlFor="password" className={styles.formLabel}>
                  <FiLock className={styles.labelIcon} />
                  رمز عبور
                </label>
                <Link to="/forgot-password" className={styles.forgotPassword}>
                  رمز عبور را فراموش کرده‌اید؟
                </Link>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.formInputpassword} ${
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
                  در حال ورود...
                </>
              ) : (
                <>
                  ورود به حساب
                  <FiArrowRight className={styles.buttonIcon} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span>یا</span>
            </div>

            {/* Social Login */}
            <div className={styles.socialLogin}>
              <button type="button" className={styles.socialButton}>
                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                ادامه با گوگل
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
