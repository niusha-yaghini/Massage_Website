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

  // مدیریت فرم
  // const formik = useFormik({
  //   initialValues: {
  //     fullName: "",
  //     email: "",
  //     phone: "",
  //     password: "",
  //     confirmPassword: "",
  //     terms: false,
  //   },
  //   validationSchema,
  //   onSubmit: async (values) => {
  //     setLoading(true);
  //     setError("");
  //     setSuccess("");

  //     try {
  //       // شبیه‌سازی API call
  //       await new Promise((resolve) => setTimeout(resolve, 1500));

  //       // در صورت موفقیت
  //       setSuccess("حساب کاربری با موفقیت ایجاد شد!");

  //       // هدایت به صفحه ورود بعد از ۲ ثانیه
  //       setTimeout(() => {
  //         navigate("/login");
  //       }, 2000);
  //     } catch (err) {
  //       setError("خطا در ایجاد حساب کاربری. لطفا مجددا تلاش کنید.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  // });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false
    },
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      
      // فقط نمایش لاگ در کنسول
      console.log('Signup form data:', {
        ...values,
        password: '***' // مخفی کردن پسورد
      });
      
      // نمایش پیام موفقیت
      setSuccess(`حساب کاربری ${values.fullName} ایجاد شد!`);
      
      // هدایت به صفحه ورود
      setTimeout(() => {
        navigate('/login');
        setLoading(false);
      }, 2000);
    }
  });

  // بررسی قدرت رمز عبور
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { label: "خیلی ضعیف", color: "#dc3545" },
      { label: "ضعیف", color: "#fd7e14" },
      { label: "متوسط", color: "#ffc107" },
      { label: "قوی", color: "#28a745" },
      { label: "خیلی قوی", color: "#20c997" },
    ];

    return levels[Math.min(score - 1, 4)];
  };

  const passwordStrength = getPasswordStrength(formik.values.password);

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
          <Link to="/" className={styles.logo}>
            <img src={Logo} alt="اسپا اکسیر" />
            <span>اسپا اکسیر</span>
          </Link>

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
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.signupMain}>
        <div className={styles.signupContainer}>
          {/* Left Side - Benefits */}
          <div className={styles.benefitsSection}>
            <div className={styles.benefitsContent}>
              <div className={styles.welcomeBadge}>
                <FiGift />
                <span>عضویت ویژه</span>
              </div>

              <h1 className={styles.benefitsTitle}>
                به جمع <span className={styles.highlight}>ویژه</span> ما
                بپیوندید
              </h1>

              <p className={styles.benefitsDescription}>
                با ایجاد حساب کاربری، از مزایای منحصربه‌فرد عضو ویژه اسپا اکسیر
                بهره‌مند شوید.
              </p>

              <div className={styles.benefitsGrid}>
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <FiCalendar />
                  </div>
                  <div className={styles.benefitContent}>
                    <h3>رزرو آسان</h3>
                    <p>نوبت‌دهی آنلاین در هر زمان و مکان</p>
                  </div>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <FiGift />
                  </div>
                  <div className={styles.benefitContent}>
                    <h3>تخفیف‌های ویژه</h3>
                    <p>تا ۳۰٪ تخفیف برای اعضای ویژه</p>
                  </div>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <FiShield />
                  </div>
                  <div className={styles.benefitContent}>
                    <h3>تاریخچه خدمات</h3>
                    <p>ذخیره تمام خدمات دریافت شده</p>
                  </div>
                </div>

                <div className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <FiGift />
                  </div>
                  <div className={styles.benefitContent}>
                    <h3>هدایای تولد</h3>
                    <p>هدیه ویژه در روز تولد شما</p>
                  </div>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>۱۰۰۰+</span>
                  <span className={styles.statLabel}>عضو ویژه</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>۹۸٪</span>
                  <span className={styles.statLabel}>رضایت</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>۲۴/۷</span>
                  <span className={styles.statLabel}>پشتیبانی</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className={styles.formSection}>
            <div className={styles.formWrapper}>
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

              <form
                onSubmit={formik.handleSubmit}
                className={styles.signupForm}
              >
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
                    <label htmlFor="email" className={styles.formLabel}>
                      <FiMail className={styles.labelIcon} />
                      ایمیل
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`${styles.formInput} ${
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
                    {formik.touched.email && formik.errors.email && (
                      <div className={styles.errorMessage}>
                        {formik.errors.email}
                      </div>
                    )}
                  </div>

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
                      className={`${styles.formInput} ${
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

                  {/* Password Strength */}
                  {formik.values.password && (
                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthLabels}>
                        <span>ضعیف</span>
                        <span>متوسط</span>
                        <span>قوی</span>
                      </div>
                      <div className={styles.strengthBar}>
                        <div
                          className={styles.strengthFill}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <div className={styles.strengthText}>
                        قدرت رمز عبور:{" "}
                        <strong style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Password Rules */}
                  <div className={styles.passwordRules}>
                    <p>رمز عبور باید شامل:</p>
                    <div className={styles.rulesGrid}>
                      <div
                        className={`${styles.rule} ${
                          formik.values.password.length >= 8
                            ? styles.ruleMet
                            : ""
                        }`}
                      >
                        <span>۸ کاراکتر</span>
                      </div>
                      <div
                        className={`${styles.rule} ${
                          /[a-z]/.test(formik.values.password)
                            ? styles.ruleMet
                            : ""
                        }`}
                      >
                        <span>حرف کوچک</span>
                      </div>
                      <div
                        className={`${styles.rule} ${
                          /[A-Z]/.test(formik.values.password)
                            ? styles.ruleMet
                            : ""
                        }`}
                      >
                        <span>حرف بزرگ</span>
                      </div>
                      <div
                        className={`${styles.rule} ${
                          /[0-9]/.test(formik.values.password)
                            ? styles.ruleMet
                            : ""
                        }`}
                      >
                        <span>عدد</span>
                      </div>
                    </div>
                  </div>

                  {formik.touched.password && formik.errors.password && (
                    <div className={styles.errorMessage}>
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    <FiLock className={styles.labelIcon} />
                    تکرار رمز عبور
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`${styles.formInput} ${
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? styles.inputError
                          : ""
                      }`}
                      placeholder="••••••••"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.confirmPassword}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <div className={styles.errorMessage}>
                        {formik.errors.confirmPassword}
                      </div>
                    )}
                </div>

                {/* Terms */}
                <div className={styles.termsGroup}>
                  <label className={styles.termsLabel}>
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formik.values.terms}
                      onChange={formik.handleChange}
                      className={styles.termsCheckbox}
                    />
                    <span className={styles.checkboxCustom}></span>
                    <span className={styles.termsText}>
                      با
                      <Link to="/terms" className={styles.termsLink}>
                        {" "}
                        قوانین و مقررات{" "}
                      </Link>
                      و
                      <Link to="/privacy" className={styles.termsLink}>
                        {" "}
                        حریم خصوصی{" "}
                      </Link>
                      اسپا اکسیر موافقم.
                    </span>
                  </label>
                  {formik.touched.terms && formik.errors.terms && (
                    <div className={styles.errorMessage}>
                      {formik.errors.terms}
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

                {/* Login Prompt */}
                <div className={styles.loginPrompt}>
                  <p>قبلاً حساب کاربری دارید؟</p>
                  <Link to="/login" className={styles.loginLink}>
                    ورود به حساب
                    <FiArrowRight />
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.signupFooter}>
        <div className={styles.footerContent}>
          <div className={styles.securityBadge}>
            <FiShield />
            <span>امنیت اطلاعات شما برای ما مهم است</span>
          </div>
          <p>© ۱۴۰۳ اسپا اکسیر. تمام حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
