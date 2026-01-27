import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Signup.module.css";
import { userService } from "../../services/userService";
// import DatePicker from "react-datepicker2";
// import moment from "moment-jalaali";
// import "react-datepicker2/dist/react-datepicker2.css";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiLogIn,
  FiArrowRight,
  FiArrowLeft,
  FiActivity,
  FiAlertTriangle,
  FiMail,
  FiBriefcase,
} from "react-icons/fi";
import Logo from "../../assets/images/Logo_white.png";

const phoneRegex = /^09[0-9]{9}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// کامپوننت اصلاح شده SimplePersianDateInput
const SimplePersianDateInput = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const [displayValue, setDisplayValue] = useState("");

  // تبدیل میلادی به شمسی برای نمایش
  const toPersian = (gregorianDate) => {
    if (!gregorianDate) return "";

    // اگر تاریخ میلادی هست (فرمت: YYYY-MM-DD)
    if (gregorianDate.includes("-")) {
      const [year, month, day] = gregorianDate.split("-").map(Number);

      // تبدیل ساده میلادی به شمسی (دقت پایین)
      const persianYear = year - 621;

      // تبدیل اعداد به فارسی
      const toPersianNum = (num) => {
        const persianDigits = [
          "۰",
          "۱",
          "۲",
          "۳",
          "۴",
          "۵",
          "۶",
          "۷",
          "۸",
          "۹",
        ];
        return num.toString().replace(/\d/g, (d) => persianDigits[d]);
      };

      // برای دقت بیشتر نیاز به الگوریتم دقیق‌تری داری
      // اینجا فقط نمایش می‌دیم
      return `${toPersianNum(persianYear)}/${toPersianNum(
        month
      )}/${toPersianNum(day)}`;
    }

    // اگر از قبل شمسی هست
    return gregorianDate;
  };

  // تبدیل شمسی به میلادی برای ذخیره
  const toGregorian = (persianDate) => {
    if (!persianDate || persianDate.length < 10) return "";

    // تبدیل اعداد فارسی به انگلیسی
    const toEnglish = (str) => {
      return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    };

    const englishDate = toEnglish(persianDate);
    const [persianYear, persianMonth, persianDay] = englishDate
      .split("/")
      .map(Number);

    // تبدیل ساده شمسی به میلادی (دقت پایین)
    const gregorianYear = persianYear + 621;

    // اینجا نیاز به الگوریتم دقیق‌تری برای تبدیل ماه و روز داری
    // فعلاً همون ماه و روز رو می‌فرستیم
    return `${gregorianYear}-${String(persianMonth).padStart(2, "0")}-${String(
      persianDay
    ).padStart(2, "0")}`;
  };

  // مقدار اولیه
  useEffect(() => {
    if (value) {
      setDisplayValue(toPersian(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e) => {
    let input = e.target.value;

    // فقط اعداد فارسی و اسلش مجاز
    input = input.replace(/[^۰-۹\/]/g, "");

    // فرمت خودکار
    if (input.length === 4 && !input.includes("/")) {
      input = input + "/";
    } else if (input.length === 7 && input.split("/")[1]?.length === 2) {
      input = input + "/";
    }

    setDisplayValue(input);

    // اگر کامل وارد شد
    if (input.length === 10) {
      const gregorian = toGregorian(input);
      onChange(gregorian);
    } else if (input === "") {
      onChange("");
    }
  };

  return (
    <div className={styles.dateInputContainer}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={className}
        placeholder={placeholder || "۱۳۷۵/۰۵/۱۵"}
        dir="ltr"
        maxLength="10"
      />
      <div className={styles.dateHint}>فرمت: سال/ماه/روز (شمسی)</div>
    </div>
  );
};

const Signup = () => {
  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeInputs, setCodeInputs] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const medicalConditionsOptions = [
    "آرتروز",
    "دیسک کمر",
    "میگرن",
    "فیبرومیالژیا",
    "پوکی استخوان",
    "اسکولیوز",
    "تنگی کانال نخاعی",
    "سیاتیک",
    "التهاب مفاصل",
    "بیماری قلبی",
    "دیابت",
    "فشار خون بالا",
    "سایر",
  ];

  const handleMedicalConditionChange = (condition) => {
    const currentConditions = [...formik.values.medicalConditions];
    if (currentConditions.includes(condition)) {
      const index = currentConditions.indexOf(condition);
      currentConditions.splice(index, 1);
    } else {
      currentConditions.push(condition);
    }
    formik.setFieldValue("medicalConditions", currentConditions);
  };

  // Steps configuration
  const steps = [
    { id: 1, label: "اطلاعات شخصی", icon: <FiUser /> },
    { id: 2, label: "تأیید شماره", icon: <FiPhone /> },
    { id: 3, label: "اطلاعات تکمیلی", icon: <FiActivity /> },
  ];

  // Validation Schema اصلاح شده
  const validationSchema = Yup.object({
    // Step 1 - Required fields
    fullName: Yup.string()
      .min(3, "نام باید حداقل ۳ کاراکتر باشد")
      .required("نام و نام خانوادگی الزامی است"),
    phone: Yup.string()
      .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست")
      .required("شماره موبایل الزامی است"),
    password: Yup.string()
      .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
      .matches(/[a-zA-Z]/, "رمز عبور باید شامل حروف باشد")
      .matches(/[0-9]/, "رمز عبور باید شامل عدد باشد")
      .required("رمز عبور الزامی است"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "رمز عبور و تأیید آن یکسان نیستند")
      .required("تأیید رمز عبور الزامی است"),

    // Step 3 - Optional fields
    email: Yup.string().email("ایمیل معتبر نیست"),
    birthDate: Yup.string().test(
      "is-valid-date",
      "تاریخ تولد باید به فرمت صحیح (۱۳۷۵/۰۵/۱۵) باشد",
      (value) => {
        if (!value) return true; // اختیاری

        // اگر تاریخ میلادی هست
        if (value.includes("-")) {
          const [year, month, day] = value.split("-").map(Number);
          // چک کردن محدوده معقول
          return (
            year > 1300 &&
            year < 1500 && // سال‌های شمسی (تقریبی)
            month >= 1 &&
            month <= 12 &&
            day >= 1 &&
            day <= 31
          );
        }

        // اگر شمسی هست
        const persianDateRegex =
          /^۱۳[۰-۹]{2}\/(۰[۱-۹]|۱[۰-۲])\/(۰[۱-۹]|[۱۲][۰-۹]|۳[۰۱])$/;
        return persianDateRegex.test(value);
      }
    ),
    gender: Yup.string().oneOf(["male", "female", ""], "جنسیت را انتخاب کنید"),
    job: Yup.string(),
    medicalConditions: Yup.array().of(Yup.string()),
    hasAllergy: Yup.boolean(),
    allergyDetails: Yup.string(),
    notes: Yup.string().max(500, "یادداشت نباید بیشتر از ۵۰۰ کاراکتر باشد"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      // Step 1
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",

      // Step 3
      email: "",
      birthDate: "",
      gender: "",
      job: "",
      medicalConditions: [],
      hasAllergy: false,
      allergyDetails: "",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        console.log("Signup data being sent:", values);

        // آماده‌سازی داده برای ارسال به بک‌اند
        // در onSubmit فرم
        const userData = {
          full_name: values.fullName,
          phone: values.phone,
          password: values.password,
          email: values.email || null,
          birth_date: values.birthDate || null, // این تاریخ میلادی هست
          gender: values.gender || null,
          job: values.job || null,
          // medical_info باید string باشه
          medical_info:
            values.hasAllergy ||
            values.medicalConditions.length > 0 ||
            values.notes
              ? JSON.stringify({
                  conditions: values.medicalConditions || [],
                  allergies: values.hasAllergy
                    ? values.allergyDetails || "ندارد"
                    : "ندارد",
                  notes: values.notes || "",
                })
              : null,
        };

        console.log("Sending to API:", userData);

        // ارسال به API واقعی - فقط این خط تغییر کرده
        const response = await userService.register(userData);

        console.log("Signup API response:", response);

        if (response.success) {
          setSuccess(
            response.message || "ثبت‌نام با موفقیت انجام شد! در حال انتقال..."
          );

          // 3 ثانیه صبر کن بعد به داشبورد برو
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else {
          setError(response.error || "خطا در ثبت‌نام");
        }
      } catch (err) {
        console.error("Signup error:", err);
        setError(
          err.message || "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Send verification code
  const sendVerificationCode = () => {
    if (!formik.values.phone || formik.errors.phone) {
      setError("لطفا شماره موبایل معتبر وارد کنید");
      return;
    }

    // TODO: Implement actual SMS sending
    console.log("Sending verification code to:", formik.values.phone);

    setVerificationSent(true);
    setCountdown(120); // 2 minutes
    clearMessages();
    setError("");
    setSuccess("کد تأیید به شماره شما ارسال شد.");
  };

  // Handle code input change
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
      verifyCode(newCodeInputs.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // اضافه کن بعد از stateها
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Verify code
  const verifyCode = (code) => {
    // TODO: Implement actual verification
    console.log("Verifying code:", code);

    clearMessages();

    // Simulate verification
    setTimeout(() => {
      if (code === "1234") {
        // Test code
        setSuccess("شماره موبایل با موفقیت تأیید شد.");
        setTimeout(() => {
          clearMessages();
          setCurrentStep(3);
          setCodeInputs(["", "", "", ""]);
        }, 1500);
      } else {
        setError("کد تأیید نادرست است.");
        setCodeInputs(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    }, 500);
  };

  // Handle resend code
  const handleResendCode = () => {
    if (countdown > 0) return;
    sendVerificationCode();
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1
      const errors = {};
      if (!formik.values.fullName.trim()) errors.fullName = "نام الزامی است.";
      if (!formik.values.phone.trim())
        errors.phone = "شماره موبایل الزامی است.";
      if (!formik.values.password) errors.password = "رمز عبور الزامی است.";
      if (!formik.values.confirmPassword)
        errors.confirmPassword = "تأیید رمز عبور الزامی است.";
      if (formik.values.password !== formik.values.confirmPassword) {
        errors.confirmPassword = "رمز عبور و تأیید آن یکسان نیستند.";
      }

      if (Object.keys(errors).length > 0) {
        formik.setErrors(errors);
        return;
      }

      // Move to verification step
      setCurrentStep(2);
      setTimeout(() => {
        sendVerificationCode();
        inputRefs.current[0]?.focus();
      }, 100);
    } else if (currentStep === 2) {
      // Check if verification is done
      if (codeInputs.some((digit) => digit === "")) {
        setError("لطفا کد تأیید را کامل وارد کنید.");
        return;
      }
      // Verification will be handled by auto-submit
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      clearMessages();
      setCurrentStep(currentStep - 1);
      setError("");
      setSuccess("");
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <FiUser className={styles.sectionIcon} />
              اطلاعات شخصی
            </h2>

            <div className={styles.formGrid}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  <FiUser className={styles.labelIcon} />
                  نام و نام خانوادگی *
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

              {/* Phone */}
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  <FiPhone className={styles.labelIcon} />
                  شماره موبایل *
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

              {/* Password */}
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  <FiLock className={styles.labelIcon} />
                  رمز عبور *
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`${styles.formInput} ${
                      styles.formInputpassword
                    } ${
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
                <div className={styles.optionalLabel}>
                  حداقل ۶ کاراکتر، شامل حروف و عدد
                </div>
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <FiLock className={styles.labelIcon} />
                  تأیید رمز عبور *
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${styles.formInput} ${
                      styles.formInputpassword
                    } ${
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.verificationContainer}>
            <h2 className={styles.sectionTitle}>
              <FiPhone className={styles.sectionIcon} />
              تأیید شماره موبایل
            </h2>

            <p className={styles.sectionSubtitle}>
              کد تأیید به شماره زیر ارسال شد:
            </p>

            <div className={styles.verificationPhone}>
              {formik.values.phone}
            </div>

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

            <div className={styles.resendCode}>
              <button
                onClick={handleResendCode}
                disabled={countdown > 0}
                className={styles.resendButton}
              >
                ارسال مجدد کد
              </button>
              {countdown > 0 && (
                <span className={styles.timer}>
                  ({Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, "0")})
                </span>
              )}
            </div>

            <p className={styles.sectionSubtitle}>
              کد تست: <strong>1234</strong>
            </p>
          </div>
        );

      case 3:
        return (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <FiActivity className={styles.sectionIcon} />
              اطلاعات تکمیلی (اختیاری)
            </h2>

            <div className={styles.formGrid}>
              {/* Email */}
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
                  placeholder="example@email.com"
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

              {/* Job */}
              <div className={styles.formGroup}>
                <label htmlFor="job" className={styles.formLabel}>
                  <FiBriefcase className={styles.labelIcon} />
                  شغل
                </label>
                <input
                  id="job"
                  name="job"
                  type="text"
                  className={`${styles.formInput} ${
                    formik.touched.job && formik.errors.job
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="شغل خود را وارد کنید."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.job}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="birthDate" className={styles.formLabel}>
                  <FiCalendar className={styles.labelIcon} />
                  تاریخ تولد
                </label>
                <SimplePersianDateInput
                  value={formik.values.birthDate}
                  onChange={(date) => {
                    formik.setFieldValue("birthDate", date);
                  }}
                  className={`${styles.formInput} ${
                    formik.touched.birthDate && formik.errors.birthDate
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="۱۳۷۵/۰۵/۱۵"
                />
                {formik.touched.birthDate && formik.errors.birthDate && (
                  <div className={styles.errorMessage}>
                    {formik.errors.birthDate}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>جنسیت</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formik.values.gender === "male"}
                      onChange={formik.handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    آقا
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formik.values.gender === "female"}
                      onChange={formik.handleChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    خانم
                  </label>
                </div>
                {formik.touched.gender && formik.errors.gender && (
                  <div className={styles.errorMessage}>
                    {formik.errors.gender}
                  </div>
                )}
              </div>
            </div>

            {/* Medical Info - Optional Section */}
            <div className={styles.optionalSection}>
              <div className={`${styles.formGroup} ${styles.formGroupbottom}`}>
                <h2 className={styles.sectionTitle}>
                  <FiActivity className={styles.sectionIcon} />
                  شرایط پزشکی (در صورت وجود - اختیاری)
                </h2>

                <div className={styles.checkboxGrid}>
                  {medicalConditionsOptions.map((condition, index) => (
                    <label key={index} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formik.values.medicalConditions.includes(
                          condition
                        )}
                        onChange={() => handleMedicalConditionChange(condition)}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxCustom}></span>
                      {condition}
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergy */}
              <div className={`${styles.formGroup} ${styles.formGroupbottom}`}>
                <label className={styles.formLabel}>
                  <FiAlertTriangle className={styles.labelIcon} />
                  آیا آلرژی دارید؟
                </label>
                <div className={styles.switchGroup}>
                  <label className={styles.switchLabel}>
                    <input
                      type="checkbox"
                      name="hasAllergy"
                      checked={formik.values.hasAllergy}
                      onChange={formik.handleChange}
                      className={styles.switchInput}
                    />
                    <span className={styles.switchSlider}></span>
                    <span className={styles.switchText}>
                      {formik.values.hasAllergy ? "بله" : "خیر"}
                    </span>
                  </label>
                </div>
                {formik.values.hasAllergy && (
                  <div className={styles.dependentField}>
                    <input
                      type="text"
                      name="allergyDetails"
                      placeholder="لطفا آلرژی خود را توضیح دهید ..."
                      className={styles.formInput}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.allergyDetails}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.formLabel}>
                  توضیحات اضافی (جراحی، داروهای مصرفی، ... )
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className={styles.formTextarea}
                  placeholder="هرگونه اطلاعات دیگری که لازم می‌دانید..."
                  rows="3"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.notes}
                ></textarea>
                <div className={styles.charCounter}>
                  {formik.values.notes.length}/500 کاراکتر
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Stepper component
  const Stepper = () => (
    <div className={styles.stepperContainer}>
      <div className={styles.stepper}>
        {steps.map((step, index) => (
          <div key={step.id} className={styles.stepWrapper}>
            <div
              className={`${styles.stepCircle} ${
                step.id === currentStep
                  ? styles.active
                  : step.id < currentStep
                  ? styles.completed
                  : styles.inactive
              }`}
            >
              {step.id < currentStep ? (
                <span className={styles.checkmark}>✓</span>
              ) : (
                <span className={styles.stepNumber}>{step.id}</span>
              )}
            </div>
            <div className={styles.stepLabel}>{step.label}</div>
            {index < steps.length && (
              <div
                className={`${styles.stepLine} ${
                  step.id < currentStep ? styles.completedLine : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.signupPage}>
      {/* Header */}
      <header className={styles.signupHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerActions}>
            <Link to="/" className={styles.backHome}>
              <FiHome />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
            <Link to="/login" className={styles.loginLink}>
              <FiLogIn />
              <span>ورود</span>
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
      <main className={styles.signupMain}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>ایجاد حساب کاربری</h2>
          </div>

          {/* Stepper */}
          <Stepper />

          {/* Alerts */}
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

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className={styles.stepNavigation}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={goToPrevStep}
                className={styles.stepButton}
                disabled={loading}
              >
                <FiArrowRight />
                مرحله قبل
              </button>
            )}

            <button
              type="button"
              onClick={currentStep === 3 ? formik.handleSubmit : goToNextStep}
              className={`${styles.stepButton} ${styles.primary}`}
              disabled={
                loading ||
                (currentStep === 1 &&
                  (!formik.values.fullName ||
                    !formik.values.phone ||
                    !formik.values.password ||
                    !formik.values.confirmPassword ||
                    formik.values.password !== formik.values.confirmPassword))
              }
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  {currentStep === 3 ? "در حال ثبت‌نام..." : "در حال پردازش..."}
                </>
              ) : (
                <>
                  {currentStep === 3 ? "تکمیل ثبت‌نام" : "ادامه"}
                  {currentStep === 3 ? <FiCheckCircle /> : <FiArrowLeft />}
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
