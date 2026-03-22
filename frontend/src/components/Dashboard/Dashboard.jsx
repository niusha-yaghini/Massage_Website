import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Dashboard.module.css";
import Booking from "./Booking";
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

  // ============ stateهای جدید برای داده‌های واقعی ============
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);

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

  // ============ تبدیل appointments به massageHistory ============
  const massageHistory = appointments.map((apt) => {
    const serviceInfo = apt.service || {};

    return {
      id: apt.id,
      date: apt.date || apt.appointment_date,
      time: apt.time || apt.appointment_time,
      type: serviceInfo.name || "ماساژ عمومی",
      duration: serviceInfo.duration_minutes
        ? `${serviceInfo.duration_minutes} دقیقه`
        : serviceInfo.duration || "۶۰ دقیقه",
      price: apt.price // عددی
        ? new Intl.NumberFormat("fa-IR").format(apt.price) + " تومان"
        : serviceInfo.price // عددی
        ? new Intl.NumberFormat("fa-IR").format(serviceInfo.price) + " تومان"
        : "۰ تومان",
      priceValue: apt.price || serviceInfo.price || 0, // برای محاسبات
      rating: apt.rating || 0,
      therapistNotes: apt.therapist_notes || "",
      status: apt.status,
      userRating: apt.rating,
      userReview: apt.user_review,
      service: serviceInfo,
    };
  });

  // انواع ماساژ برای رزرو (از services واقعی)
  const massageTypes = services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    duration: service.duration_minutes
      ? `${service.duration_minutes} دقیقه`
      : "۶۰ دقیقه",
    price: service.price, // این باید عدد باشه نه فرمت شده
    priceFormatted: service.price
      ? new Intl.NumberFormat("fa-IR").format(service.price) + " تومان"
      : "۰ تومان",
    category: service.category || "آرامش‌بخش",
  }));

  console.log("Massage Types:", massageTypes);

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
    const upcomingAppointments = appointments.filter(
      (apt) => apt.status === "pending" || apt.status === "confirmed"
    );

    const completedAppointments = appointments.filter(
      (apt) => apt.status === "completed"
    );

    const [showAllUpcoming, setShowAllUpcoming] = useState(false);

    // مرتب‌سازی از نزدیک‌ترین به دورترین
    const sortedUpcomingAppointments = [...upcomingAppointments].sort(
      (a, b) => {
        const dateA = new Date(
          `${a.date || a.appointment_date}T${a.time || a.appointment_time}`
        );
        const dateB = new Date(
          `${b.date || b.appointment_date}T${b.time || b.appointment_time}`
        );
        return dateA - dateB; // کوچیک‌ترین (نزدیک‌ترین) اول
      }
    );

    // ✅ نزدیک‌ترین نوبت (اولین آیتم در آرایه مرتب شده)
    const upcomingAppointment = sortedUpcomingAppointments[0] || null;

    // تابع لغو نوبت
    const handleCancelAppointment = async (appointmentId) => {
      if (
        window.confirm("آیا مطمئن هستید که می‌خواهید این نوبت را لغو کنید؟")
      ) {
        try {
          await userService.cancelAppointment(appointmentId);
          const appointmentsResponse = await userService.getAppointments();
          setAppointments(appointmentsResponse.appointments || []);
          alert("نوبت با موفقیت لغو شد.");
        } catch (error) {
          console.error("Error cancelling appointment:", error);
          alert("خطا در لغو نوبت. لطفاً دوباره تلاش کنید.");
        }
      }
    };

    // تابع تغییر زمان نوبت
    const handleReschedule = (appointment) => {
      console.log("🔄 === RESCHEDULE CLICKED ===");
      console.log("1. Original appointment:", appointment);
      console.log("2. Appointment service:", appointment.service);
      console.log("3. MassageTypes available:", massageTypes);

      const selectedMassage = massageTypes.find(
        (m) => m.id === appointment.service?.id
      );

      console.log("4. Found selected massage:", selectedMassage);

      // setEditingAppointment({
      //   ...appointment,
      //   service: selectedMassage || appointment.service,
      // });

      setEditingAppointment({
        id: appointment.id,
        service: selectedMassage || appointment.service,
        date: appointment.date || appointment.appointment_date,
        time: appointment.time || appointment.appointment_time,
        notes: appointment.notes || "",
      });

      console.log("5. Editing appointment set:", {
        id: appointment.id,
        service: selectedMassage || appointment.service,
        date: appointment.date || appointment.appointment_date,
        time: appointment.time || appointment.appointment_time,
      });

      setActiveTab("booking");
      console.log("6. Active tab changed to: booking");
    };

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

    const handleSubmitRating = async (appointmentId, rating, review) => {
      try {
        await userService.rateAppointment(appointmentId, rating, review);
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

    // تاریخچه ماساژهای انجام شده
    const completedMassages = massageHistory
      .filter((item) => item.status === "completed")
      .slice(0, 3);

    // State‌های مربوط به مودال ثبت نظر
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [userRatings, setUserRatings] = useState({});

    const openRatingModal = (sessionId) => {
      const session = completedMassages.find((s) => s.id === sessionId);
      setSelectedSession(session);
      setRatingValue(userRatings[sessionId]?.rating || 0);
      setReviewText(userRatings[sessionId]?.review || "");
      setShowRatingModal(true);
    };

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
            {sortedUpcomingAppointments.length > 0
              ? `نوبت‌های آینده شما:`
              : "نوبت آینده:"}
          </h2>

          <div className={styles.appointmentDetails}>
            {upcomingAppointment ? (
              <>
                <div className={styles.appointmentInfo}>
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
                      {upcomingAppointment.type ||
                        upcomingAppointment.service?.name ||
                        "ماساژ عمومی"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>مدت زمان:</span>
                    <span className={styles.infoValue}>
                      {upcomingAppointment.duration ||
                        (upcomingAppointment.service?.duration_minutes
                          ? `${upcomingAppointment.service.duration_minutes} دقیقه`
                          : "۶۰ دقیقه")}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>قیمت:</span>
                    <span className={styles.infoValue}>
                      {upcomingAppointment.price
                        ? new Intl.NumberFormat("fa-IR").format(
                            upcomingAppointment.price
                          ) + " تومان"
                        : upcomingAppointment.service?.price || "۰ تومان"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>یادداشت ها:</span>
                    <span className={styles.infoValue}>
                      {upcomingAppointment.notes}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.noAppointment}>
                <FiInfo className={styles.infoIcon} />
                <p>نوبت آینده‌ای ندارید.</p>
                <button
                  className={styles.bookNowButton}
                  onClick={() => setActiveTab("booking")}
                >
                  رزرو نوبت جدید
                </button>
              </div>
            )}
          </div>

          {sortedUpcomingAppointments.length > 1 && (
            <button
              className={styles.toggleButton}
              onClick={() => setShowAllUpcoming(!showAllUpcoming)}
            >
              {showAllUpcoming ? (
                <>
                  <FiChevronUp />
                  بستن لیست نوبت‌ها
                </>
              ) : (
                <>
                  <FiChevronDown />
                  مشاهده همه نوبت‌ها ({sortedUpcomingAppointments.length})
                </>
              )}
            </button>
          )}

          {showAllUpcoming && sortedUpcomingAppointments.length > 1 && (
            <div className={styles.allAppointmentsList}>
              <h4 className={styles.listTitle}>
                <FiCalendar />
                همه نوبت‌های آینده شما
              </h4>

              <div className={styles.appointmentsGrid}>
                {sortedUpcomingAppointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className={`${styles.appointmentItem} ${
                      index === 0 ? styles.currentAppointment : ""
                    }`}
                  >
                    <div className={styles.appointmentHeader}>
                      <div className={styles.appointmentNumber}>
                        نوبت #{index + 1}
                        {index === 0 && (
                          <span className={styles.currentBadge}>جاری</span>
                        )}
                      </div>
                      <div className={styles.appointmentDateTime}>
                        <span className={styles.date}>
                          <FiCalendar /> {formatDate(apt.date)}
                        </span>
                        <span className={styles.time}>
                          <FiClock /> {apt.time}
                        </span>
                      </div>
                    </div>

                    <div className={styles.appointmentContent}>
                      <div className={styles.serviceInfo}>
                        <h5>
                          {apt.type || apt.service?.name || "ماساژ عمومی"}
                        </h5>
                        <div className={styles.serviceDetails}>
                          <span>
                            <FiClock />{" "}
                            {apt.duration ||
                              (apt.service?.duration_minutes
                                ? `${apt.service.duration_minutes} دقیقه`
                                : "۶۰ دقیقه")}
                          </span>
                          <span>•</span>
                          <span>
                            {apt.price
                              ? new Intl.NumberFormat("fa-IR").format(
                                  apt.price
                                ) + " تومان"
                              : apt.service?.price
                              ? new Intl.NumberFormat("fa-IR").format(
                                  apt.service.price
                                ) + " تومان"
                              : "۰ تومان"}
                          </span>
                        </div>

                        <div className={styles.serviceDetails}>
                          <span>
                            {apt.notes && (
                              <div>
                                <FiMessageSquare /> {apt.notes}
                              </div>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className={styles.appointmentActions}>
                        <button
                          className={styles.cancelSingleButton}
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          <FiX />
                          لغو این نوبت
                        </button>
                        <button
                          className={styles.rescheduleButton}
                          onClick={() => handleReschedule(apt)}
                        >
                          <FiCalendar />
                          تغییر زمان
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

                  {session.userReview && (
                    <div className={styles.userReviewSection}>
                      <div className={styles.reviewHeader}>
                        <FiMessageSquare className={styles.reviewIcon} />
                        <span>نظر شما:</span>
                      </div>
                      <p className={styles.reviewText}>{session.userReview}</p>
                    </div>
                  )}

                  {/* Therapist Notes */}
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

  return (
    <div className={styles.dashboard}>
      <Sidebar />

      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          {activeTab === "dashboard" && <DashboardHome />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "booking" && (
            <Booking
              massageTypes={massageTypes}
              onBookingSuccess={async () => {
                console.log("Booking success callback triggered");
                const appointmentsResponse =
                  await userService.getAppointments();
                setAppointments(appointmentsResponse.appointments || []);
                setEditingAppointment(null);
              }}
              initialData={
                editingAppointment
                  ? {
                      selectedMassage: editingAppointment.service,
                      selectedDate: editingAppointment.date,
                      selectedTime: editingAppointment.time,
                      notes: editingAppointment.notes || "",
                    }
                  : null
              }
              isEditing={!!editingAppointment}
              editingAppointmentId={editingAppointment?.id}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
