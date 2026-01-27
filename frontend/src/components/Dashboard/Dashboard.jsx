import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Dashboard.module.css";
import { userService } from "../../services/userService";
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiLogOut,
  FiHome,
  FiStar,
  FiMessageSquare,
  FiX,
  FiTrendingUp,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiChevronLeft,
  FiEdit,
  FiSave,
  FiActivity,
  FiBriefcase,
} from "react-icons/fi";

// کامپوننت SimplePersianDateInput
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

      // تبدیل ساده میلادی به شمسی
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

    // تبدیل ساده شمسی به میلادی
    const gregorianYear = persianYear + 621;

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

    // فقط اعداد و اسلش مجاز
    input = input.replace(/[^۰-۹0-9\/]/g, "");

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
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={className}
        placeholder={placeholder || "۱۳۷۵/۰۵/۱۵"}
        dir="ltr"
        maxLength="10"
      />
    </div>
  );
};

// تابع تبدیل میلادی به شمسی برای نمایش
const formatToPersianDate = (gregorianDate) => {
  if (!gregorianDate) return "ثبت نشده";

  try {
    // اگر تاریخ به فرمت میلادی هست
    if (gregorianDate.includes("-")) {
      const [year, month, day] = gregorianDate.split("-").map(Number);

      // تبدیل ساده میلادی به شمسی
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

      return `${toPersianNum(persianYear)}/${toPersianNum(
        month
      )}/${toPersianNum(day)}`;
    }

    // اگر از قبل شمسی هست
    return gregorianDate;
  } catch (error) {
    console.error("Error formatting date:", error);
    return gregorianDate || "ثبت نشده";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    selectedMassage: null,
    selectedTherapist: null,
    selectedDate: "",
    selectedTime: "",
    notes: "",
  });

  // ============ stateهای جدید برای داده‌های واقعی ============
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============ useEffect برای بارگذاری داده‌ها ============
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // دریافت اطلاعات کاربر
        const userResponse = await userService.getCurrentUser();
        console.log("User data received:", userResponse.user);
        console.log("Birth date:", userResponse.user?.birth_date);
        setUserData(userResponse.user);

        // دریافت نوبت‌ها
        const appointmentsResponse = await userService.getAppointments();
        setAppointments(appointmentsResponse.appointments || []);

        // دریافت خدمات
        const servicesResponse = await userService.getAllServices();
        setServices(servicesResponse || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");

        // اگر کاربر لاگین نبوده، به صفحه login هدایت کن
        if (err.message.includes("توکن")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ============ تغییر توابع برای استفاده از داده‌های واقعی ============
  const massageHistory = appointments.map((apt) => ({
    id: apt.id,
    date: apt.date,
    time: apt.time,
    type: apt.service?.name || "ماساژ عمومی",
    duration: apt.service?.duration || "۶۰ دقیقه",
    price: apt.service?.price || "۰ تومان",
    rating: apt.rating || 0,
    therapistNotes: apt.therapist_notes || "",
    status:
      apt.status === "completed"
        ? "completed"
        : apt.status === "cancelled"
        ? "cancelled"
        : "upcoming",
    userRating: apt.rating,
    userReview: apt.user_review,
  }));

  // انواع ماساژ برای رزرو (از services واقعی)
  const massageTypes = services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    duration: service.duration_minutes
      ? `${service.duration_minutes} دقیقه`
      : "۶۰ دقیقه",
    price: service.price
      ? new Intl.NumberFormat("fa-IR").format(service.price) + " تومان"
      : "۰ تومان",
    category: service.category || "آرامش‌بخش",
  }));

  // ساعات کاری
  const availableSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ];

  // تاریخ‌های موجود (۷ روز آینده)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      date: date.toISOString().split("T")[0],
      display: date.toLocaleDateString("fa-IR", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      dayName: date.toLocaleDateString("fa-IR", { weekday: "long" }),
    };
  });

  // ============ توابع کمکی ============
  const formatDate = (dateString) => {
    if (!dateString) return "ثبت نشده";

    console.log("Formatting date string:", dateString); // برای دیباگ

    // اگر تاریخ شمسی هست (دارای / یا فرمت ۱۳۷۹-۱۲-۰۵)
    if (dateString.includes("/") || /^13/.test(dateString)) {
      // تاریخ شمسی - نمایش ساده
      return dateString.replace(/-/g, "/");
    }

    // اگر تاریخ میلادی هست (مثل 2024-01-15 یا 2024-01-15T10:30:00.000Z)
    try {
      // حذف قسمت زمان اگر وجود دارد
      const dateOnly = dateString.split("T")[0];
      const date = new Date(dateOnly);

      if (isNaN(date.getTime())) {
        // اگر تاریخ معتبر نیست، همون string رو برگردون
        return dateString;
      }

      // فقط تاریخ، بدون ساعت
      return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString; // اگر خطا خورد، همون string رو برگردون
    }
  };

  // ============ توابع موجود ============
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <FiStar
          key={index}
          className={index < rating ? styles.starFilled : styles.starEmpty}
        />
      ));
  };

  const toggleNotes = (id) => {
    setExpandedNotes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBookingChange = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNextBookingStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevBookingStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  // ============ کامپوننت‌های داخلی ============
  const Sidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h3 className={styles.userName}>{userData?.full_name || "کاربر"}</h3>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {[
            { id: "dashboard", label: "داشبورد", icon: <FiHome /> },
            { id: "profile", label: "پروفایل", icon: <FiUser /> },
            { id: "booking", label: "رزرو وقت", icon: <FiCalendar /> },
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`${styles.navLink} ${
                  activeTab === item.id ? styles.active : ""
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <FiLogOut className={styles.logoutIcon} />
          <span>خروج از حساب</span>
        </button>
      </div>
    </div>
  );

  const DashboardHome = () => {
    // استفاده از appointments واقعی
    const upcomingAppointments = appointments.filter(
      (apt) => apt.status === "pending" || apt.status === "confirmed"
    );

    const completedAppointments = appointments.filter(
      (apt) => apt.status === "completed"
    );

    const stats = [
      {
        icon: <FiCalendar />,
        label: "نوبت‌های آینده",
        value: upcomingAppointments.length.toString(),
        color: "#4CAF50",
      },
      {
        icon: <FiTrendingUp />,
        label: "تعداد ماساژهای گذشته",
        value: completedAppointments.length.toString(),
        color: "#9C27B0",
      },
    ];

    const upcomingAppointment = upcomingAppointments[0] || null;

    const handleSubmitRating = async (appointmentId, rating, review) => {
      try {
        await userService.rateAppointment(appointmentId, rating, review);

        // آپدیت local state
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, rating, user_review: review }
              : apt
          )
        );

        alert("نظر و امتیاز شما با موفقیت ثبت شد!");
      } catch (err) {
        console.error("Error submitting rating:", err);
        alert("خطا در ثبت نظر. لطفاً دوباره تلاش کنید.");
      }
    };

    // تاریخچه ماساژهای انجام شده (برای نمایش در داشبورد)
    const completedMassages = massageHistory
      .filter((item) => item.status === "completed")
      .slice(0, 3); // فقط ۳ مورد آخر

    // State‌های جدید برای ثبت نظر
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [userRatings, setUserRatings] = useState({});

    // تابع برای باز کردن مودال ثبت نظر
    const openRatingModal = (sessionId) => {
      const session = completedMassages.find((s) => s.id === sessionId);
      setSelectedSession(session);
      setRatingValue(userRatings[sessionId]?.rating || 0);
      setReviewText(userRatings[sessionId]?.review || "");
      setShowRatingModal(true);
    };

    // اضافه کردن userRating و userReview به completedMassages
    const enhancedCompletedMassages = completedMassages.map((session) => ({
      ...session,
      userRating: userRatings[session.id]?.rating,
      userReview: userRatings[session.id]?.review,
    }));

    return (
      <div className={styles.dashboardHome}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stat.value}</h3>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Appointment */}
        <div className={styles.upcomingCard}>
          <h2 className={styles.sectionTitle}>
            <FiCalendar className={styles.sectionIcon} />
            نوبت بعدی شما
          </h2>
          <div className={styles.appointmentDetails}>
            <div className={styles.appointmentInfo}>
              {upcomingAppointment ? (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>تاریخ:</span>
                    <span className={styles.infoValue}>
                      {formatDate(upcomingAppointment.date)}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>ساعت:</span>
                    <span className={styles.infoValue}>
                      {upcomingAppointment.time}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>نوع ماساژ:</span>
                    <span className={styles.infoValue}>
                      {upcomingAppointment.type}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>مدت زمان:</span>
                    <span className={styles.infoValue}>
                      {upcomingAppointment.duration}
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.noAppointment}>
                  <FiInfo className={styles.infoIcon} />
                  <p>نوبت آینده‌ای ندارید.</p>
                </div>
              )}
            </div>
            <button className={styles.actionButtonSecondary}>لغو نوبت</button>
          </div>
        </div>
        <div className={styles.recentHistory}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FiClock className={styles.sectionIcon} />
              تاریخچه ماساژهای گذشته
            </h2>
          </div>

          {completedMassages.length > 0 ? (
            <div className={styles.historyList}>
              {enhancedCompletedMassages.map((session) => (
                <div key={session.id} className={styles.historyCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionDate}>
                        <FiCalendar className={styles.infoIcon} />
                        <span>{formatDate(session.date)}</span>
                        <span className={styles.sessionTime}>
                          <FiClock className={styles.timeIcon} />
                          {session.time}
                        </span>
                      </div>

                      <div className={styles.sessionType}>
                        <h3 className={styles.massageType}>{session.type}</h3>
                        <div className={styles.sessionMeta}>
                          <span className={styles.metaItem}>
                            <FiClock className={styles.metaIcon} />
                            {session.duration}
                          </span>
                          <span className={styles.metaItem}>-</span>

                          <span className={styles.metaItem}>
                            {session.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.sessionStatus}>
                      {/* نمایش امتیاز یا دکمه ثبت امتیاز */}
                      {session.userRating ? (
                        <div className={styles.userRatingSection}>
                          <div className={styles.ratingStars}>
                            {renderStars(session.userRating)}
                          </div>
                          <span className={styles.ratingText}>
                            امتیاز شما: {session.userRating}/5
                          </span>
                        </div>
                      ) : (
                        <button
                          className={styles.rateButton}
                          onClick={() => openRatingModal(session.id)}
                        >
                          <FiStar />
                          <span>ثبت نظر و امتیاز</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* نمایش نظر کاربر اگر وجود داشته باشد */}
                  {session.userReview && (
                    <div className={styles.userReviewSection}>
                      <div className={styles.reviewHeader}>
                        <FiMessageSquare className={styles.reviewIcon} />
                        <span>نظر شما:</span>
                      </div>
                      <p className={styles.reviewText}>{session.userReview}</p>
                    </div>
                  )}

                  {/* Therapist Notes (مخفف شده) */}
                  {session.therapistNotes && (
                    <div className={styles.notesSection}>
                      <button
                        className={styles.notesToggle}
                        onClick={() => toggleNotes(session.id)}
                      >
                        <FiMessageSquare className={styles.notesIcon} />
                        <span>توضیحات ماساژتراپیست</span>
                        {expandedNotes.includes(session.id) ? (
                          <FiChevronUp className={styles.toggleIcon} />
                        ) : (
                          <FiChevronDown className={styles.toggleIcon} />
                        )}
                      </button>

                      {expandedNotes.includes(session.id) && (
                        <div className={styles.notesContent}>
                          <p>{session.therapistNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className={styles.cardActions}>
                    <button
                      className={styles.primaryButton}
                      onClick={() => setActiveTab("booking")}
                    >
                      رزرو مجدد این سرویس
                    </button>

                    {/* دکمه ویرایش نظر اگر کاربر نظر داده باشد */}
                    {session.userRating && (
                      <button
                        className={styles.editReviewButton}
                        onClick={() => openRatingModal(session.id)}
                      >
                        <FiEdit />
                        ویرایش نظر
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noHistory}>
              <FiInfo className={styles.infoIcon} />
              <p>هنوز ماساژی انجام نداده‌اید.</p>
            </div>
          )}

          {/* Modal برای ثبت نظر */}
          {showRatingModal && selectedSession && (
            <div className={styles.modalOverlay}>
              <div className={styles.ratingModal}>
                <div className={styles.modalHeader}>
                  <h3>ثبت نظر و امتیاز</h3>
                  <button
                    className={styles.closeModal}
                    onClick={() => setShowRatingModal(false)}
                  >
                    <FiX />
                  </button>
                </div>

                <div className={styles.modalContent}>
                  <div className={styles.sessionInfoModal}>
                    <h4>{selectedSession.type}</h4>
                    <p>
                      {formatDate(selectedSession.date)} -{" "}
                      {selectedSession.time}
                    </p>
                  </div>

                  <div className={styles.ratingSection}>
                    <p>امتیاز شما:</p>
                    <div className={styles.starRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`${styles.starButton} ${
                            ratingValue >= star ? styles.starActive : ""
                          }`}
                          onClick={() => setRatingValue(star)}
                        >
                          <FiStar />
                        </button>
                      ))}
                    </div>
                    <div className={styles.ratingText}>
                      {ratingValue > 0
                        ? `${ratingValue} ستاره`
                        : "لطفاً امتیاز دهید"}
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <label>نظر شما:</label>
                    <textarea
                      className={styles.reviewTextarea}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="تجربه خود از این ماساژ را بنویسید..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowRatingModal(false)}
                  >
                    انصراف
                  </button>
                  <button
                    className={styles.submitRatingButton}
                    onClick={handleSubmitRating}
                    disabled={ratingValue === 0}
                  >
                    <FiCheck />
                    ثبت نظر
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Profile = () => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showMedicalInfo, setShowMedicalInfo] = useState(false);
    const [medicalForm, setMedicalForm] = useState({
      allergies: "",
      conditions: "",
      notes: "",
    });

    // وقتی userData تغییر کرد، formData رو آپدیت کن
    useEffect(() => {
      if (userData && isEditingProfile) {
        // تنظیم فرم اصلی
        formik.setValues({
          full_name: userData.full_name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          birth_date: userData.birth_date || "",
          gender: userData.gender || "",
          job: userData.job || "",
        });

        // تنظیم فرم اطلاعات پزشکی
        if (userData.medical_info) {
          setMedicalForm({
            allergies: userData.medical_info.allergies || "",
            conditions: Array.isArray(userData.medical_info.conditions)
              ? userData.medical_info.conditions.join(", ")
              : userData.medical_info.conditions || "",
            notes: userData.medical_info.notes || "",
          });
        }
      }
    }, [userData, isEditingProfile]); // اضافه کردن isEditingProfile به dependency array

    const validationSchema = Yup.object({
      full_name: Yup.string()
        .required("نام و نام خانوادگی الزامی است.")
        .min(3, "نام باید حداقل ۳ کاراکتر باشد."),
      email: Yup.string()
        .email("ایمیل معتبر نیست.")
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "فرمت ایمیل صحیح نیست"
        )
        .required("ایمیل الزامی است."),
      phone: Yup.string()
        .matches(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست (مثال: 09123456789).")
        .required("شماره موبایل الزامی است."),
      birth_date: Yup.string()
        .matches(
          /^13[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
          "فرمت تاریخ باید شمسی باشد (مثال: ۱۳۷۹-۱۲-۰۵)"
        )
        .nullable()
        .test("is-valid-date", "تاریخ معتبر نیست", (value) => {
          if (!value) return true;
          // اعتبارسنجی ساده تاریخ شمسی
          const parts = value.split("-");
          if (parts.length !== 3) return false;

          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);

          // بررسی‌های ساده
          if (year < 1300 || year > 1500) return false;
          if (month < 1 || month > 12) return false;
          if (day < 1 || day > 31) return false;

          return true;
        }),
      gender: Yup.string()
        .oneOf(["male", "female"], "لطفاً جنسیت را انتخاب کنید")
        .required("جنسیت الزامی است."),
      job: Yup.string().nullable(),
    });

    // Formik برای فرم اصلی
    const formik = useFormik({
      initialValues: {
        full_name: userData?.full_name || "",
        phone: userData?.phone || "",
        email: userData?.email || "",
        birth_date: userData?.birth_date || "",
        gender: userData?.gender || "",
        job: userData?.job || "",
      },
      validationSchema,
      enableReinitialize: true, // این مهمه!
      onSubmit: async (values) => {
        try {
          // اطلاعات کامل برای ارسال
          const allData = {
            full_name: values.full_name,
            phone: values.phone,
            email: values.email,
            birth_date: values.birth_date,
            gender: values.gender,
            job: values.job,
            medical_info: {
              allergies: medicalForm.allergies,
              conditions: medicalForm.conditions
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item),
              notes: medicalForm.notes,
            },
          };

          console.log("Sending to server:", allData);

          await userService.updateProfile(allData);

          // گرفتن اطلاعات بروز شده از سرور
          const updatedUserResponse = await userService.getCurrentUser();
          setUserData(updatedUserResponse.user);

          setIsEditingProfile(false);
          alert("پروفایل با موفقیت به‌روزرسانی شد.");
        } catch (err) {
          console.error("Error updating profile:", err);
          alert("خطا در به‌روزرسانی پروفایل: " + err.message);
        }
      },
    });

    const handleEdit = () => {
      setIsEditingProfile(true);
    };

    const handleCancel = () => {
      formik.resetForm();
      setIsEditingProfile(false);
    };

    const handleMedicalInfoChange = (field, value) => {
      setMedicalForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    return (
      <div className={styles.profilePage}>
        <div className={styles.profileHeader}>
          <h1 className={styles.pageTitle}>
            <FiUser className={styles.titleIcon} />
            پروفایل کاربری
          </h1>
          <div className={styles.headerActions}>
            {!isEditingProfile ? (
              <button onClick={handleEdit} className={styles.editButton}>
                <FiEdit />
                ویرایش پروفایل
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  onClick={() => formik.handleSubmit()} // اینجا فقط formik.handleSubmit رو صدا بزن
                  className={styles.saveButton}
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  {formik.isSubmitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      ذخیره تغییرات
                    </>
                  )}
                </button>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  لغو
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.profileContent}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Personal Information */}
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>
                <FiUser className={styles.cardIcon} />
                اطلاعات شخصی
              </h3>

              <form onSubmit={formik.handleSubmit} className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    نام و نام خانوادگی
                  </label>
                  {isEditingProfile ? (
                    <>
                      <input
                        type="text"
                        name="full_name"
                        value={formik.values.full_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`${styles.formInput} ${
                          formik.touched.full_name && formik.errors.full_name
                            ? styles.inputError
                            : ""
                        }`}
                      />
                      {formik.touched.full_name && formik.errors.full_name && (
                        <div className={styles.errorMessage}>
                          {formik.errors.full_name}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.formValue}>
                      {userData?.full_name || ""}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    ایمیل
                  </label>
                  {isEditingProfile ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`${styles.formInput} ${
                          formik.touched.email && formik.errors.email
                            ? styles.inputError
                            : ""
                        }`}
                        dir="ltr"
                        placeholder="example@email.com"
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className={styles.errorMessage}>
                          {formik.errors.email}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.formValue}>
                      {userData?.email || "ثبت نشده"}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    شماره موبایل
                  </label>
                  {isEditingProfile ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`${styles.formInput} ${
                          formik.touched.phone && formik.errors.phone
                            ? styles.inputError
                            : ""
                        }`}
                        dir="ltr"
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <div className={styles.errorMessage}>
                          {formik.errors.phone}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.formValue}>{userData?.phone || ""}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiBriefcase />
                    شغل
                  </label>
                  {isEditingProfile ? (
                    <>
                      <input
                        type="text"
                        name="job"
                        value={formik.values.job}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={styles.formInput}
                        placeholder="شغل خود را وارد کنید."
                      />
                    </>
                  ) : (
                    <p className={styles.formValue}>
                      {userData?.job || "ثبت نشده."}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    تاریخ تولد
                  </label>
                  {isEditingProfile ? (
                    <>
                      {/* از SimplePersianDateInput استفاده کن */}
                      <SimplePersianDateInput
                        value={formik.values.birth_date || ""}
                        onChange={(date) => {
                          formik.setFieldValue("birth_date", date);
                        }}
                        className={`${styles.formInput} ${
                          formik.touched.birth_date && formik.errors.birth_date
                            ? styles.inputError
                            : ""
                        }`}
                        placeholder="۱۳۷۵/۰۵/۱۵"
                      />
                      {formik.touched.birth_date &&
                        formik.errors.birth_date && (
                          <div className={styles.errorMessage}>
                            {formik.errors.birth_date}
                          </div>
                        )}
                    </>
                  ) : (
                    <p className={styles.formValue}>
                      {userData?.birth_date
                        ? formatToPersianDate(userData.birth_date)
                        : "ثبت نشده"}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>جنسیت</label>
                  {isEditingProfile ? (
                    <>
                      <select
                        name="gender"
                        value={formik.values.gender || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={styles.formSelect}
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="male">آقا</option>
                        <option value="female">خانم</option>
                        {/* <option value="other">سایر</option> */}
                      </select>
                      {formik.touched.gender && formik.errors.gender && (
                        <div className={styles.errorMessage}>
                          {formik.errors.gender}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.formValue}>
                      {userData?.gender === "male"
                        ? "آقا"
                        : userData?.gender === "female"
                        ? "خانم"
                        : userData?.gender === "other"
                        ? "سایر"
                        : "ثبت نشده"}
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>تاریخ عضویت</label>
                  <p className={styles.formValue}>
                    {userData?.created_at
                      ? formatDate(userData.created_at)
                      : "ثبت نشده"}
                  </p>
                </div>
              </form>
            </div>

            {/* Medical Information */}
            <div className={styles.infoCard}>
              <div
                className={styles.sectionHeaderToggle}
                onClick={() => setShowMedicalInfo(!showMedicalInfo)}
              >
                <h3 className={styles.cardTitle}>
                  <FiActivity className={styles.cardIcon} />
                  اطلاعات پزشکی
                  <span className={styles.toggleIcon}>
                    {showMedicalInfo ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </h3>
              </div>

              {showMedicalInfo && (
                <div className={styles.medicalInfo}>
                  {isEditingProfile ? (
                    <>
                      {/* فرم ویرایش اطلاعات پزشکی */}
                      <div>
                        <div className={styles.medicalFormGroup}>
                          <label className={styles.formLabel}>آلرژی‌ها</label>
                          <input
                            type="text"
                            value={medicalForm.allergies}
                            onChange={(e) =>
                              handleMedicalInfoChange(
                                "allergies",
                                e.target.value
                              )
                            }
                            className={styles.formInput}
                            placeholder="مثال: گرده گل، بادام زمینی"
                          />
                        </div>

                        <div className={styles.medicalFormGroup}>
                          <label className={styles.medicalFormLabel}>
                            شرایط خاص
                          </label>
                          <input
                            type="text"
                            value={medicalForm.conditions}
                            onChange={(e) =>
                              handleMedicalInfoChange(
                                "conditions",
                                e.target.value
                              )
                            }
                            className={styles.formInput}
                            placeholder="مثال: دیابت, فشار خون بالا (با کاما جدا کنید)"
                          />
                          <small className={styles.medicalFormHint}>
                            شرایط پزشکی خود را با کاما جدا کنید. (داروهای مصرفی،
                            جراحی های ۶ ماه اخیر، ...)
                          </small>
                        </div>

                        <div className={styles.medicalFormGroup}>
                          <label className={styles.medicalFormLabel}>
                            یادداشت
                          </label>
                          <textarea
                            value={medicalForm.notes}
                            onChange={(e) =>
                              handleMedicalInfoChange("notes", e.target.value)
                            }
                            className={styles.formTextarea}
                            placeholder="هرگونه توضیح یا یادداشت پزشکی"
                            rows="3"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* نمایش اطلاعات پزشکی */}
                      {userData?.medical_info ? (
                        <>
                          <div className={styles.medicalItem}>
                            <span className={styles.medicalLabel}>
                              آلرژی‌ها:
                            </span>
                            <span className={styles.medicalValue}>
                              {userData.medical_info.allergies || "ندارد."}
                            </span>
                          </div>

                          <div className={styles.medicalItem}>
                            <span className={styles.medicalLabel}>
                              شرایط خاص:
                            </span>
                            <div className={styles.conditionsList}>
                              {Array.isArray(
                                userData.medical_info.conditions
                              ) &&
                              userData.medical_info.conditions.length > 0 ? (
                                userData.medical_info.conditions.map(
                                  (condition, index) => (
                                    <span
                                      key={index}
                                      className={styles.conditionTag}
                                    >
                                      {condition}
                                    </span>
                                  )
                                )
                              ) : (
                                <span className={styles.noCondition}>
                                  ندارد
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.medicalItem}>
                            <span className={styles.medicalLabel}>
                              یادداشت:
                            </span>
                            <p className={styles.medicalNote}>
                              {userData.medical_info.notes ||
                                "یادداشتی ثبت نشده است."}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className={styles.noMedicalInfo}>
                          <FiInfo className={styles.infoIcon} />
                          <p>اطلاعات پزشکی ثبت نشده است.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Booking = () => {
    const [availableDates, setAvailableDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // بارگذاری تاریخ‌های available
    useEffect(() => {
      const fetchAvailableDates = async () => {
        try {
          setLoadingDates(true);
          const response = await userService.getAvailableSlots();
          if (response.success) {
            setAvailableDates(response.available_dates || []);
          }
        } catch (error) {
          console.error("Error fetching available dates:", error);
          setAvailableDates([]);
        } finally {
          setLoadingDates(false);
        }
      };

      fetchAvailableDates();
    }, []);

    // وقتی تاریخ انتخاب شد، ساعت‌های اون تاریخ رو بگیر
    useEffect(() => {
      const fetchAvailableSlots = async () => {
        if (bookingData.selectedDate) {
          try {
            setLoadingSlots(true);
            const response = await userService.getAvailableSlots(
              bookingData.selectedDate
            );
            if (response.success) {
              setAvailableSlots(response.available_slots || []);
            }
          } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableSlots([]);
          } finally {
            setLoadingSlots(false);
          }
        } else {
          setAvailableSlots([]);
        }
      };

      fetchAvailableSlots();
    }, [bookingData.selectedDate]);

    // تابع handleSubmitBooking رو آپدیت کن
    const handleSubmitBooking = async () => {
      try {
        if (
          !bookingData.selectedMassage ||
          !bookingData.selectedDate ||
          !bookingData.selectedTime
        ) {
          alert("لطفاً تمام اطلاعات لازم را وارد کنید.");
          return;
        }

        const appointmentData = {
          service_id: bookingData.selectedMassage.id,
          appointment_date: bookingData.selectedDate,
          appointment_time: bookingData.selectedTime,
          notes: bookingData.notes,
        };

        const response = await userService.bookAppointment(appointmentData);

        if (response.success) {
          alert(
            `نوبت شما برای ${bookingData.selectedMassage.name} با موفقیت رزرو شد!`
          );

          // ریست فرم
          setBookingStep(1);
          setBookingData({
            selectedMassage: null,
            selectedDate: "",
            selectedTime: "",
            notes: "",
          });

          // refresh تاریخ‌های available
          const datesResponse = await userService.getAvailableSlots();
          if (datesResponse.success) {
            setAvailableDates(datesResponse.available_dates || []);
          }

          // به داشبورد برگرد
          setActiveTab("dashboard");
        }
      } catch (error) {
        console.error("Error booking appointment:", error);
        alert("خطا در رزرو نوبت. لطفاً دوباره تلاش کنید.");
      }
    };

    return (
      <div className={styles.bookingPage}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <FiCalendar className={styles.titleIcon} />
            رزرو وقت ماساژ
          </h1>

          <div className={styles.bookingSteps}>
            <div
              className={`${styles.step} ${
                bookingStep >= 1 ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>۱</div>
              <div className={styles.stepLabel}>انتخاب ماساژ</div>
            </div>

            <div
              className={`${styles.step} ${
                bookingStep >= 2 ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>۲</div>
              <div className={styles.stepLabel}>تاریخ و ساعت</div>
            </div>

            <div
              className={`${styles.step} ${
                bookingStep >= 3 ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>۳</div>
              <div className={styles.stepLabel}>تأیید نهایی</div>
            </div>
          </div>
        </div>

        <div className={styles.bookingContent}>
          {/* Step 1: Select Massage Type */}
          {bookingStep === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>نوع ماساژ را انتخاب کنید.</h2>
              <p className={styles.stepDescription}>
                بر اساس نیاز خود، یکی از انواع ماساژ را انتخاب نمایید. جهت
                مشاوره برای انتخاب مناسب می توانید در واتس اپ به ماساژتراپیست
                پیام دهید.
              </p>

              <div className={styles.massageGrid}>
                {massageTypes.map((massage) => (
                  <div
                    key={massage.id}
                    className={`${styles.massageCard} ${
                      bookingData.selectedMassage?.id === massage.id
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() =>
                      handleBookingChange("selectedMassage", massage)
                    }
                  >
                    <div className={styles.massageHeader}>
                      <div className={styles.massageCategory}>
                        {massage.category}
                      </div>
                      {bookingData.selectedMassage?.id === massage.id && (
                        <FiCheck className={styles.checkIcon} />
                      )}
                    </div>

                    <h3 className={styles.massageName}>{massage.name}</h3>
                    <p className={styles.massageDescription}>
                      {massage.description}
                    </p>

                    <div className={styles.massageDetails}>
                      <div className={styles.detailItem}>
                        <span>{massage.duration}</span>
                      </div>
                      <span>-</span>
                      <div className={styles.detailItem}>
                        <span>{massage.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.stepActions}>
                <button
                  onClick={handleNextBookingStep}
                  disabled={!bookingData.selectedMassage}
                  className={styles.nextButton}
                >
                  ادامه
                  <FiChevronLeft className={styles.buttonIcon} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {bookingStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>تاریخ و ساعت را انتخاب کنید.</h2>
              <p className={styles.stepDescription}>
                زمان مناسب خود را برای دریافت ماساژ انتخاب نمایید.
              </p>

              <div className={styles.datetimeSection}>
                {/* Date Selection */}
                <div className={styles.dateSection}>
                  <h3 className={styles.sectionTitle}>
                    <FiCalendar className={styles.sectionIcon} />
                    انتخاب تاریخ
                  </h3>

                  <div className={styles.dateGrid}>
                    {availableDates.map((dateObj, index) => (
                      <div
                        key={index}
                        className={`${styles.dateCard} ${
                          bookingData.selectedDate === dateObj.date
                            ? styles.selected
                            : ""
                        }`}
                        onClick={() => {
                          // e.preventDefault(); // این خط رو اضافه کن
                          handleBookingChange("selectedDate", dateObj.date);
                          handleBookingChange("selectedTime", "");
                        }}
                      >
                        <div className={styles.dayName}>{dateObj.dayName}</div>
                        <div className={styles.dateDisplay}>
                          {dateObj.display}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className={styles.timeSection}>
                  <h3 className={styles.sectionTitle}>
                    <FiClock className={styles.sectionIcon} />
                    انتخاب ساعت
                    {bookingData.selectedDate && (
                      <span className={styles.selectedDate}>
                        برای{" "}
                        {new Date(bookingData.selectedDate).toLocaleDateString(
                          "fa-IR"
                        )}
                      </span>
                    )}
                  </h3>

                  {bookingData.selectedDate ? (
                    <div className={styles.timeGrid}>
                      {availableSlots.map((time, index) => (
                        <button
                          key={index}
                          className={`${styles.timeSlot} ${
                            bookingData.selectedTime === time
                              ? styles.selected
                              : ""
                          }`}
                          onClick={(e) => {
                            // e.preventDefault(); // این خط رو اضافه کن
                            handleBookingChange("selectedTime", time);
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.timePlaceholder}>
                      <FiInfo className={styles.infoIcon} />
                      <p>لطفا ابتدا تاریخ را انتخاب کنید</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className={styles.notesSection}>
                <h3 className={styles.sectionTitle}>یادداشت‌های اضافی</h3>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => handleBookingChange("notes", e.target.value)}
                  placeholder="هرگونه نکته خاص یا درخواست ویژه برای ماساژتراپیست (اختیاری) ..."
                  className={styles.notesTextarea}
                  rows="3"
                />
              </div>

              <div className={styles.stepActions}>
                <button
                  onClick={handlePrevBookingStep}
                  className={styles.prevButton}
                >
                  مرحله قبل
                </button>
                <button
                  onClick={handleNextBookingStep}
                  disabled={
                    !bookingData.selectedDate || !bookingData.selectedTime
                  }
                  className={styles.nextButton}
                >
                  ادامه
                  <FiChevronLeft className={styles.buttonIcon} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {bookingStep === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>تأیید نهایی</h2>
              <p className={styles.stepDescription}>
                لطفا اطلاعات رزرو خود را بررسی و تأیید کنید.
              </p>

              <div className={styles.confirmationCard}>
                <div className={styles.confirmationHeader}>
                  <h3>خلاصه رزرو</h3>
                  <div className={styles.bookingId}>
                    کد رزرو: <span>#SPA-{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>

                <div className={styles.confirmationDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>نوع ماساژ:</span>
                    <span className={styles.detailValue}>
                      {bookingData.selectedMassage?.name}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تاریخ:</span>
                    <span className={styles.detailValue}>
                      {new Date(bookingData.selectedDate).toLocaleDateString(
                        "fa-IR"
                      )}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>ساعت:</span>
                    <span className={styles.detailValue}>
                      {bookingData.selectedTime}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>مدت زمان:</span>
                    <span className={styles.detailValue}>
                      {bookingData.selectedMassage?.duration}
                    </span>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>هزینه:</span>
                    <span className={styles.detailValuePrice}>
                      {bookingData.selectedMassage?.price}
                    </span>
                  </div>

                  {bookingData.notes && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>یادداشت:</span>
                      <span className={styles.detailValue}>
                        {bookingData.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.stepActions}>
                <button
                  onClick={handlePrevBookingStep}
                  className={styles.prevButton}
                >
                  مرحله قبل
                </button>
                <button
                  onClick={handleSubmitBooking}
                  className={styles.submitButton}
                >
                  <FiCheck className={styles.buttonIcon} />
                  تأیید و رزرو نهایی
                </button>
              </div>
            </div>
          )}

          {/* Booking Summary Sidebar */}
          <div className={styles.bookingSummary}>
            <h3 className={styles.summaryTitle}>خلاصه رزرو</h3>

            {bookingData.selectedMassage && (
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>ماساژ انتخاب شده:</div>
                <div className={styles.summaryValue}>
                  {bookingData.selectedMassage.name}
                </div>
                <div className={styles.summarySubtext}>
                  {bookingData.selectedMassage.duration} •{" "}
                  {bookingData.selectedMassage.price}
                </div>
              </div>
            )}

            {bookingData.selectedDate && (
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>تاریخ:</div>
                <div className={styles.summaryValue}>
                  {new Date(bookingData.selectedDate).toLocaleDateString(
                    "fa-IR"
                  )}
                </div>
              </div>
            )}

            {bookingData.selectedTime && (
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>ساعت:</div>
                <div className={styles.summaryValue}>
                  {bookingData.selectedTime}
                </div>
              </div>
            )}

            <div className={styles.summaryTotal}>
              <div className={styles.totalLabel}>مجموع:</div>
              <div className={styles.totalValue}>
                {bookingData.selectedMassage?.price || "۰ تومان"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============ رندر اصلی ============
  return (
    <div className={styles.dashboard}>
      <Sidebar />

      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          {activeTab === "dashboard" && <DashboardHome />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "booking" && <Booking />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
