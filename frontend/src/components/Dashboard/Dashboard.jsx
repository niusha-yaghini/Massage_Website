import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { userService } from "../../services/userService";
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiLogOut,
  FiHome,
  FiSettings,
  FiStar,
  FiHeart,
  FiMessageSquare,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
  FiFilter,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiMapPin,
  FiInfo,
  FiChevronRight,
  FiChevronLeft,
  FiEdit,
  FiSave,
  FiShield,
  FiActivity,
  FiDroplet,
  FiThermometer,
} from "react-icons/fi";

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

  // ============ اطلاعات ============
  // اطلاعات کاربر
  const userData = {
    id: 1,
    fullName: "علی احمدی",
    email: "ali.ahmadi@example.com",
    phone: "09123456789",
    birthDate: "1990-05-15",
    gender: "male",
    membershipDate: "2023-01-15",
    points: 1250,
    membershipLevel: "VIP",
    medicalInfo: {
      allergies: "ندارد",
      conditions: ["میگرن خفیف"],
      notes: "ترجیح می‌دهم ماساژ آرام باشد",
    },
  };

  // تاریخچه ماساژها
  const massageHistory = [
    {
      id: 1,
      date: "2024-01-15",
      time: "14:30",
      type: "ماساژ سوئدی",
      duration: "60 دقیقه",
      price: "۱,۸۰۰,۰۰۰ تومان",
      rating: 5,
      therapistNotes:
        "عضلات گردن و شانه نیاز به توجه بیشتری دارند. پیشنهاد می‌کنم جلسات هفتگی داشته باشید.",
      status: "completed",
    },
    {
      id: 2,
      date: "2024-01-08",
      time: "11:00",
      type: "ماساژ تایلندی",
      duration: "90 دقیقه",
      price: "۲,۲۰۰,۰۰۰ تومان",
      rating: 4,
      therapistNotes:
        "انعطاف پذیری خوبی دارید. برای جلسه بعدی تمرکز روی کمر خواهد بود.",
      status: "completed",
    },
    {
      id: 3,
      date: "2023-12-20",
      time: "16:00",
      type: "ماساژ ورزشی",
      duration: "75 دقیقه",
      price: "۲,۰۰۰,۰۰۰ تومان",
      rating: 5,
      therapistNotes:
        "عضلات پا بعد از ورزش نیاز به ریکاوری بیشتری دارند. حتما آب زیاد بنوشید.",
      status: "completed",
    },
    {
      id: 4,
      date: "2023-12-05",
      time: "10:30",
      type: "ماساژ آرام‌سازی",
      duration: "60 دقیقه",
      price: "۱,۹۰۰,۰۰۰ تومان",
      rating: 5,
      therapistNotes:
        "استرس قابل توجهی در ناحیه کتف مشاهده شد. تمرینات تنفسی پیشنهاد می‌شود.",
      status: "completed",
    },
    {
      id: 5,
      date: "2024-02-01",
      time: "15:00",
      type: "ماساژ درمانی",
      duration: "90 دقیقه",
      price: "۲,۴۰۰,۰۰۰ تومان",
      status: "upcoming",
    },
  ];

  // انواع ماساژ برای رزرو
  const massageTypes = [
    {
      id: 1,
      name: "ماساژ سوئدی",
      description: "ماساژ کلاسیک برای ریلکس شدن عضلات",
      duration: "60 دقیقه",
      price: "۱,۸۰۰,۰۰۰ تومان",
      category: "آرامش‌بخش",
    },
    {
      id: 2,
      name: "ماساژ تایلندی",
      description: "کشش یوگا و تکنیک‌های انرژی‌بخش",
      duration: "90 دقیقه",
      price: "۲,۲۰۰,۰۰۰ تومان",
      category: "انرژی‌بخش",
    },
    {
      id: 3,
      name: "ماساژ ورزشی",
      description: "مخصوص ورزشکاران حرفه‌ای",
      duration: "75 دقیقه",
      price: "۲,۰۰۰,۰۰۰ تومان",
      category: "درمانی",
    },
    {
      id: 4,
      name: "ماساژ آرام‌سازی",
      description: "ریلکسیشن عمیق با روغن‌های ارگانیک",
      duration: "60 دقیقه",
      price: "۱,۹۰۰,۰۰۰ تومان",
      category: "آرامش‌بخش",
    },
    {
      id: 5,
      name: "ماساژ درمانی",
      description: "درمان دردهای عضلانی و گرفتگی‌ها",
      duration: "90 دقیقه",
      price: "۲,۴۰۰,۰۰۰ تومان",
      category: "درمانی",
    },
  ];

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
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  const handleSubmitBooking = () => {
    console.log("Booking submitted:", bookingData);
    alert(
      `نوبت شما برای ${bookingData.selectedMassage.name} با موفقیت رزرو شد!`
    );
    setBookingStep(1);
    setBookingData({
      selectedMassage: null,
      selectedTherapist: null,
      selectedDate: "",
      selectedTime: "",
      notes: "",
    });
  };

  const handleLogout = () => {
    navigate("/");
  };

  // ============ کامپوننت‌های داخلی ============
  const Sidebar = () => (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h3 className={styles.userName}>{userData.fullName}</h3>
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
    const stats = [
      {
        icon: <FiCalendar />,
        label: "نوبت‌های آینده",
        value: "۱",
        color: "#4CAF50",
      },
      {
        icon: <FiTrendingUp />,
        label: "تعداد ماساژهای گذشته",
        value: massageHistory
          .filter((item) => item.status === "completed")
          .length.toString(),
        color: "#9C27B0",
      },
    ];

    const upcomingAppointment = massageHistory.find(
      (item) => item.status === "upcoming"
    ) || {
      date: "2024-02-01",
      time: "۱۵:۰۰",
      type: "ماساژ درمانی",
      duration: "۹۰ دقیقه",
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

    // تابع برای ثبت نظر
    const handleSubmitRating = () => {
      if (selectedSession && ratingValue > 0) {
        setUserRatings((prev) => ({
          ...prev,
          [selectedSession.id]: {
            rating: ratingValue,
            review: reviewText,
          },
        }));

        // به روزرسانی session با نظر کاربر
        const updatedSession = {
          ...selectedSession,
          userRating: ratingValue,
          userReview: reviewText,
        };

        // در اینجا می‌توانید اطلاعات را به سرور ارسال کنید
        console.log("Rating submitted:", updatedSession);

        // بستن مودال
        setShowRatingModal(false);
        setRatingValue(0);
        setReviewText("");
        setSelectedSession(null);

        alert("نظر و امتیاز شما با موفقیت ثبت شد!");
      }
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
            </div>
            <button className={styles.actionButtonSecondary}>لغو نوبت</button>
          </div>
        </div>

        {/* Recent Massage History - زیر بخش نوبت بعدی */}
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
    const [formData, setFormData] = useState(userData);

    const handleEdit = () => {
      setIsEditingProfile(true);
    };

    const handleSave = () => {
      setIsEditingProfile(false);
      console.log("Profile saved:", formData);
    };

    const handleCancel = () => {
      setFormData(userData);
      setIsEditingProfile(false);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
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
                <button onClick={handleSave} className={styles.saveButton}>
                  <FiSave />
                  ذخیره تغییرات
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

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    نام و نام خانوادگی
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <p className={styles.formValue}>{formData.fullName}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    ایمیل
                  </label>
                  <p className={styles.formValue}>{formData.email}</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    شماره موبایل
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <p className={styles.formValue}>{formData.phone}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <FiUser />
                    تاریخ تولد
                  </label>
                  <p className={styles.formValue}>
                    {formatDate(formData.birthDate)}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>جنسیت</label>
                  <p className={styles.formValue}>
                    {formData.gender === "male" ? "آقا" : "خانم"}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>تاریخ عضویت</label>
                  <p className={styles.formValue}>
                    {formatDate(formData.membershipDate)}
                  </p>
                </div>
              </div>
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
                  <div className={styles.medicalItem}>
                    <span className={styles.medicalLabel}>آلرژی‌ها:</span>
                    <span className={styles.medicalValue}>
                      {formData.medicalInfo.allergies}
                    </span>
                  </div>

                  <div className={styles.medicalItem}>
                    <span className={styles.medicalLabel}>شرایط خاص:</span>
                    <div className={styles.conditionsList}>
                      {formData.medicalInfo.conditions.map(
                        (condition, index) => (
                          <span key={index} className={styles.conditionTag}>
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className={styles.medicalItem}>
                    <span className={styles.medicalLabel}>یادداشت:</span>
                    <p className={styles.medicalNote}>
                      {formData.medicalInfo.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Booking = () => {
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
              <h2 className={styles.stepTitle}>نوع ماساژ را انتخاب کنید</h2>
              <p className={styles.stepDescription}>
                بر اساس نیاز خود، یکی از انواع ماساژ را انتخاب نمایید
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
                  <FiChevronRight className={styles.buttonIcon} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {bookingStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>تاریخ و ساعت را انتخاب کنید</h2>
              <p className={styles.stepDescription}>
                زمان مناسب خود را برای دریافت ماساژ انتخاب نمایید
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
                          onClick={() =>
                            handleBookingChange("selectedTime", time)
                          }
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
                  placeholder="هرگونه نکته خاص یا درخواست ویژه برای ماساژتراپیست (اختیاری)..."
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
                  <FiChevronRight className={styles.buttonIcon} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {bookingStep === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>تأیید نهایی</h2>
              <p className={styles.stepDescription}>
                لطفا اطلاعات رزرو خود را بررسی و تأیید کنید
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
