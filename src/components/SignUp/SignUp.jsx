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
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiLogIn,
  FiArrowRight,
  FiActivity,
  FiHeart,
  FiAlertTriangle,
  FiDroplet,
  FiThermometer,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Logo from "../../assets/images/Logo_white.png";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const navigate = useNavigate();

  // طرح اعتبارسنجی - بخش اطلاعات شخصی
  const validationSchema = Yup.object({
    // اطلاعات شخصی
    fullName: Yup.string()
      .min(3, "نام باید حداقل ۳ کاراکتر باشد")
      .required("نام و نام خانوادگی الزامی است"),
    email: Yup.string().email("ایمیل معتبر نیست").required("ایمیل الزامی است"),
    phone: Yup.string()
      .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست")
      .required("شماره موبایل الزامی است"),
    birthDate: Yup.date()
      .max(new Date(), "تاریخ تولد نمی‌تواند در آینده باشد")
      .required("تاریخ تولد الزامی است"),
    gender: Yup.string()
      .oneOf(["male", "female"], "جنسیت را انتخاب کنید")
      .required("جنسیت الزامی است"),

    // رمز عبور
    password: Yup.string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
      .matches(/[a-z]/, "رمز عبور باید شامل حروف کوچک باشد")
      .matches(/[A-Z]/, "رمز عبور باید شامل حروف بزرگ باشد")
      .matches(/[0-9]/, "رمز عبور باید شامل عدد باشد")
      .required("رمز عبور الزامی است"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "رمز عبور و تأیید آن یکسان نیستند")
      .required("تأیید رمز عبور الزامی است"),

    // اطلاعات پزشکی
    medicalConditions: Yup.array().of(Yup.string()),
    hasAllergy: Yup.boolean(),
    allergyDetails: Yup.string().when("hasAllergy", {
      is: true,
      then: (schema) => schema.required("لطفا توضیح دهید"),
      otherwise: (schema) => schema.notRequired(),
    }),
    hasSkinCondition: Yup.boolean(),
    skinConditionDetails: Yup.string(),
    hasHeartCondition: Yup.boolean(),
    hasHighBloodPressure: Yup.boolean(),
    hasDiabetes: Yup.boolean(),
    isPregnant: Yup.boolean(),
    recentSurgeries: Yup.string(),
    regularMedications: Yup.string(),
    notes: Yup.string().max(500, "یادداشت نباید بیشتر از ۵۰۰ کاراکتر باشد"),

    // قوانین
    terms: Yup.boolean()
      .oneOf([true], "باید قوانین را پذیرفته باشید")
      .required("پذیرش قوانین الزامی است"),
  });

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

  const formik = useFormik({
    initialValues: {
      // اطلاعات شخصی
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",

      // رمز عبور
      password: "",
      confirmPassword: "",

      // اطلاعات پزشکی
      medicalConditions: [],
      hasAllergy: false,
      allergyDetails: "",
      hasSkinCondition: false,
      skinConditionDetails: "",
      hasHeartCondition: false,
      hasHighBloodPressure: false,
      hasDiabetes: false,
      isPregnant: false,
      recentSurgeries: "",
      regularMedications: "",
      notes: "",

      // قوانین
      terms: false,
    },
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      setError("");

      // فقط نمایش لاگ در کنسول
      console.log("Signup form data:", {
        personalInfo: {
          name: values.fullName,
          email: values.email,
          phone: values.phone,
          birthDate: values.birthDate,
          gender: values.gender,
        },
        medicalInfo: {
          conditions: values.medicalConditions,
          allergies: values.hasAllergy ? values.allergyDetails : "ندارد",
          skinConditions: values.hasSkinCondition
            ? values.skinConditionDetails
            : "ندارد",
          hasHeartCondition: values.hasHeartCondition,
          hasHighBloodPressure: values.hasHighBloodPressure,
          hasDiabetes: values.hasDiabetes,
          isPregnant: values.isPregnant,
          recentSurgeries: values.recentSurgeries || "ندارد",
          regularMedications: values.regularMedications || "ندارد",
          notes: values.notes || "ندارد",
        },
      });

      // نمایش پیام موفقیت
      setSuccess(
        `حساب کاربری ${values.fullName} ایجاد شد! اطلاعات پزشکی شما ثبت گردید.`
      );

      // هدایت به صفحه اصلی
      setTimeout(() => {
        navigate("/");
        setLoading(false);
      }, 3000);
    },
  });

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

  return (
    <div className={styles.signupPage}>
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
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>ایجاد حساب کاربری</h2>
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
            {/* Section 1: اطلاعات شخصی */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <FiUser className={styles.sectionIcon} />
                اطلاعات شخصی
              </h2>

              <div className={styles.formGrid}>
                {/* نام کامل */}
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

                {/* موبایل */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>
                    <FiPhone className={styles.labelIcon} />
                    شماره موبایل
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

                {/* تاریخ تولد */}
                <div className={styles.formGroup}>
                  <label htmlFor="birthDate" className={styles.formLabel}>
                    <FiCalendar className={styles.labelIcon} />
                    تاریخ تولد
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    className={`${styles.formInput} ${
                      formik.touched.birthDate && formik.errors.birthDate
                        ? styles.inputError
                        : ""
                    }`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.birthDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {formik.touched.birthDate && formik.errors.birthDate && (
                    <div className={styles.errorMessage}>
                      {formik.errors.birthDate}
                    </div>
                  )}
                </div>

                {/* جنسیت */}
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
                </div>
              </div>
            </div>

            {/* Section 3: اطلاعات پزشکی */}
            <div className={styles.formSection}>
              <div
                className={styles.sectionHeaderToggle}
                onClick={() => setShowMedicalInfo(!showMedicalInfo)}
              >
                <h2 className={styles.sectionTitle}>
                  <FiActivity className={styles.sectionIcon} />
                  اطلاعات پزشکی
                  <span className={styles.toggleIcon}>
                    {showMedicalInfo ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </h2>
                <p className={styles.sectionSubtitle}>
                  این اطلاعات برای ارائه خدمات ماساژ مناسب و ایمن ضروری است
                </p>
              </div>

              {showMedicalInfo && (
                <div className={styles.medicalInfoSection}>
                  {/* شرایط پزشکی */}
                  <div
                    className={`${styles.formGroup} ${styles.formGroupbottom}`}
                  >
                    <label className={styles.formLabel}>
                      <FiActivity className={styles.labelIcon} />
                      شرایط پزشکی (در صورت وجود)
                    </label>
                    <div className={styles.checkboxGrid}>
                      {medicalConditionsOptions.map((condition, index) => (
                        <label key={index} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={formik.values.medicalConditions.includes(
                              condition
                            )}
                            onChange={() =>
                              handleMedicalConditionChange(condition)
                            }
                            className={styles.checkboxInput}
                          />
                          <span className={styles.checkboxCustom}></span>
                          {condition}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* آلرژی */}
                  <div
                    className={`${styles.formGroup} ${styles.formGroupbottom}`}
                  >
                    <label className={styles.formLabel}>
                      <FiAlertTriangle className={styles.labelIcon} />
                      آیا آلرژی یا مشکلات پوستی دارید؟
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
                          placeholder="لطفا توضیح دهید ..."
                          className={styles.formInput}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.allergyDetails}
                        />
                        {formik.touched.allergyDetails &&
                          formik.errors.allergyDetails && (
                            <div className={styles.errorMessage}>
                              {formik.errors.allergyDetails}
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {/* یادداشت‌های اضافی */}
                  <div className={styles.formGroup}>
                    <label htmlFor="notes" className={styles.formLabel}>
                      توضیحات (جراحی‌های اخیر، داروهای مصرفی، ... )
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
              )}
            </div>

            {/* Section 4: قوانین */}
            {/* <div className={styles.formSection}>
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
                    اسپا اکسیر موافقم و تأیید می‌کنم که اطلاعات پزشکی ارائه شده
                    صحیح است.
                  </span>
                </label>
                {formik.touched.terms && formik.errors.terms && (
                  <div className={styles.errorMessage}>
                    {formik.errors.terms}
                  </div>
                )}
              </div>
            </div> */}

            {/* Submit Button */}
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !formik.isValid}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    در حال ثبت‌نام...
                  </>
                ) : (
                  <>
                    تکمیل ثبت‌نام
                    <FiArrowRight className={styles.buttonIcon} />
                  </>
                )}
              </button>

              <div className={styles.formNote}>
                <FiAlertCircle className={styles.noteIcon} />
                <span>
                  اطلاعات پزشکی شما محرمانه بوده و فقط برای ارائه خدمات مناسب
                  استفاده می‌شود.
                </span>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Signup;
