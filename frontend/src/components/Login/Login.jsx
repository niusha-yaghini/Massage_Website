import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Login.module.css";
import { userService } from "../../services/userService";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiUserPlus,
  FiArrowRight,
  FiStar,
  FiPhone,
} from "react-icons/fi";
import Logo from "../../assets/images/Logo_white.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست")
      .required("شماره موبایل الزامی است"),
    password: Yup.string()
      .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
      .required("رمز عبور الزامی است"),
    rememberMe: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      phone: "",
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

        const result = await userService.loginWithPhone(
          values.phone,
          values.password
        );

        console.log("نتیجه از userService:", result);

        if (result.success) {
          setSuccess(` خوش آمدید ${result.user?.full_name || ""}!`);

          // ذخیره اطلاعات کاربر در localStorage برای بررسی نقش
          if (result.user) {
            localStorage.setItem("spa_user", JSON.stringify(result.user));
          }

          // بر اساس نقش کاربر، به صفحه مناسب هدایت کن
          setTimeout(() => {
            if (result.user?.role === "admin") {
              // اگر ادمین هست، به پنل مدیریت بره
              navigate("/admin");
            } else {
              // اگر کاربر عادی هست، به داشبورد بره
              navigate("/dashboard");
            }
          }, 1500);
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
            <span className={styles.logospa}>فرشاد ماساژ</span>
            <img src={Logo} alt="فرشاد ماساژ" className={styles.logoImage} />
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
              با ورود به حساب کاربری خود، از تمامی خدمات فرشاد ماساژ بهره‌مند
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

          <form onSubmit={formik.handleSubmit} className={styles.loginForm}>
            {/* Phone Field */}
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>
                <FiPhone className={styles.labelIcon} /> شماره موبایل
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`${styles.formInputphonenumber} ${
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
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
