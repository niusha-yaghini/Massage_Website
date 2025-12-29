import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
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

  // ============ اطلاعات ساختگی ============

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
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
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
      therapist: "سارا محمدی",
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
      therapist: "رضا کریمی",
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
      therapist: "محمد حسینی",
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
      therapist: "فاطمه رضایی",
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
      therapist: "امیر قاسمی",
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

  // ماساژ تراپیست‌ها
  const therapists = [
    {
      id: 1,
      name: "سارا محمدی",
      specialty: "ماساژ سوئدی و آرام‌سازی",
      experience: "8 سال",
      rating: 4.9,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "رضا کریمی",
      specialty: "ماساژ تایلندی و ورزشی",
      experience: "10 سال",
      rating: 4.8,
      image: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    {
      id: 3,
      name: "فاطمه رضایی",
      specialty: "ماساژ درمانی و رفلکسولوژی",
      experience: "12 سال",
      rating: 5.0,
      image: "https://randomuser.me/api/portraits/women/33.jpg",
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
    if (bookingStep < 4) {
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
    <div
      className={`${styles.sidebar} ${
        sidebarCollapsed ? styles.collapsed : ""
      }`}
    >
      <button
        className={styles.toggleButton}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? <FiMenu /> : <FiX />}
      </button>

      <div className={styles.logo}>
        <div className={styles.logoIcon}>🎐</div>
        {!sidebarCollapsed && (
          <span className={styles.logoText}>اسپا اکسیر</span>
        )}
      </div>

      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          <img src={userData.avatar} alt="User" />
        </div>
        {!sidebarCollapsed && (
          <>
            <h3 className={styles.userName}>{userData.fullName}</h3>
            <p className={styles.userLevel}>عضویت {userData.membershipLevel}</p>
          </>
        )}
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {[
            { id: "dashboard", label: "داشبورد", icon: <FiHome /> },
            { id: "profile", label: "پروفایل", icon: <FiUser /> },
            { id: "history", label: "تاریخچه ماساژ", icon: <FiClock /> },
            { id: "booking", label: "رزرو وقت", icon: <FiCalendar /> },
            { id: "favorites", label: "مورد علاقه‌ها", icon: <FiHeart /> },
            { id: "settings", label: "تنظیمات", icon: <FiSettings /> },
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
                {!sidebarCollapsed && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <FiLogOut className={styles.logoutIcon} />
          {!sidebarCollapsed && <span>خروج از حساب</span>}
        </button>

        {!sidebarCollapsed && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{massageHistory.length}</span>
              <span className={styles.statLabel}>ماساژ</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {userData.points.toLocaleString()}
              </span>
              <span className={styles.statLabel}>امتیاز</span>
            </div>
          </div>
        )}
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
        icon: <FiDollarSign />,
        label: "مجموع هزینه‌ها",
        value: "۹,۳۰۰,۰۰۰",
        color: "#2196F3",
      },
      {
        icon: <FiStar />,
        label: "میانگین امتیاز",
        value: "۴.۸",
        color: "#FFC107",
      },
      {
        icon: <FiTrendingUp />,
        label: "تعداد ماساژ",
        value: massageHistory.length.toString(),
        color: "#9C27B0",
      },
    ];

    const upcomingAppointment = massageHistory.find(
      (item) => item.status === "upcoming"
    ) || {
      date: "فردا - ۱۴۰۲/۱۱/۱۵",
      time: "۱۴:۳۰",
      type: "ماساژ درمانی",
      therapist: "امیر قاسمی",
      duration: "۹۰ دقیقه",
    };

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
                <span className={styles.infoLabel}>ماساژتراپیست:</span>
                <span className={styles.infoValue}>
                  {upcomingAppointment.therapist}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>مدت زمان:</span>
                <span className={styles.infoValue}>
                  {upcomingAppointment.duration}
                </span>
              </div>
            </div>
            <div className={styles.appointmentActions}>
              <button
                className={styles.actionButtonPrimary}
                onClick={() => setActiveTab("history")}
              >
                مشاهده جزئیات
              </button>
              <button className={styles.actionButtonSecondary}>لغو نوبت</button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>دسترسی سریع</h2>
          <div className={styles.actionGrid}>
            <button
              className={styles.quickActionButton}
              onClick={() => setActiveTab("booking")}
            >
              <FiCalendar className={styles.actionIcon} />
              <span>رزرو وقت جدید</span>
            </button>
            <button
              className={styles.quickActionButton}
              onClick={() => setActiveTab("profile")}
            >
              <FiUser className={styles.actionIcon} />
              <span>ویرایش پروفایل</span>
            </button>
            <button className={styles.quickActionButton}>
              <FiStar className={styles.actionIcon} />
              <span>ثبت نظر</span>
            </button>
          </div>
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
            {/* Avatar Section */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <img
                  src={formData.avatar}
                  alt={formData.fullName}
                  className={styles.avatar}
                />
                <div className={styles.avatarBadge}>
                  <FiStar />
                  <span>{formData.membershipLevel}</span>
                </div>
              </div>

              <div className={styles.avatarInfo}>
                <h2 className={styles.userName}>{formData.fullName}</h2>
                <div className={styles.userStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {formData.points.toLocaleString()}
                    </span>
                    <span className={styles.statLabel}>امتیاز</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {massageHistory.length}
                    </span>
                    <span className={styles.statLabel}>ماساژ</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>۸۵٪</span>
                    <span className={styles.statLabel}>رضایت</span>
                  </div>
                </div>
              </div>
            </div>

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

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Membership Card */}
            <div className={styles.membershipCard}>
              <div className={styles.membershipHeader}>
                <FiShield className={styles.membershipIcon} />
                <div>
                  <h3 className={styles.membershipTitle}>
                    عضویت {formData.membershipLevel}
                  </h3>
                  <p className={styles.membershipSubtitle}>
                    تا {formatDate("2024-12-31")} معتبر است
                  </p>
                </div>
              </div>

              <div className={styles.membershipBenefits}>
                <h4>مزایای عضویت:</h4>
                <ul className={styles.benefitsList}>
                  <li>۲۵٪ تخفیف روی تمام خدمات</li>
                  <li>هدیه تولد رایگان</li>
                  <li>اولویت در رزرو نوبت</li>
                  <li>مشاوره رایگان</li>
                  <li>تخفیف همراه</li>
                </ul>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>پیشرفت به سطح بعدی</span>
                  <span>۲۵۰ امتیاز دیگر</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(formData.points / 1500) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MassageHistory = () => {
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");

    const filteredHistory = massageHistory.filter((item) => {
      if (filter === "all") return true;
      if (filter === "completed") return item.status === "completed";
      if (filter === "upcoming") return item.status === "upcoming";
      return true;
    });

    const sortedHistory = [...filteredHistory].sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "price")
        return (
          parseInt(b.price.replace(/[^0-9]/g, "")) -
          parseInt(a.price.replace(/[^0-9]/g, ""))
        );
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    return (
      <div className={styles.historyPage}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <FiCalendar className={styles.titleIcon} />
            تاریخچه ماساژها
          </h1>

          <div className={styles.headerActions}>
            <div className={styles.filterControls}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">همه ماساژها</option>
                <option value="completed">انجام شده</option>
                <option value="upcoming">آینده</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="date">مرتب بر اساس تاریخ</option>
                <option value="price">مرتب بر اساس قیمت</option>
                <option value="rating">مرتب بر اساس امتیاز</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className={styles.statsSummary}>
          <div className={styles.statItem}>
            <div
              className={styles.statIcon}
              style={{ background: "#4CAF5020", color: "#4CAF50" }}
            >
              <FiCalendar />
            </div>
            <div className={styles.statContent}>
              <h3>{massageHistory.length}</h3>
              <p>کل ماساژها</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div
              className={styles.statIcon}
              style={{ background: "#2196F320", color: "#2196F3" }}
            >
              <FiDollarSign />
            </div>
            <div className={styles.statContent}>
              <h3>۹,۳۰۰,۰۰۰</h3>
              <p>مجموع هزینه‌ها</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div
              className={styles.statIcon}
              style={{ background: "#FFC10720", color: "#FFC107" }}
            >
              <FiStar />
            </div>
            <div className={styles.statContent}>
              <h3>۴.۸</h3>
              <p>میانگین امتیاز</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className={styles.historyList}>
          {sortedHistory.map((session) => (
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
                        <FiUser className={styles.metaIcon} />
                        {session.therapist}
                      </span>
                      <span className={styles.metaItem}>
                        <FiClock className={styles.metaIcon} />
                        {session.duration}
                      </span>
                      <span className={styles.metaItem}>
                        <FiDollarSign className={styles.metaIcon} />
                        {session.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.sessionStatus}>
                  <span
                    className={`${styles.statusBadge} ${
                      session.status === "completed"
                        ? styles.completed
                        : styles.upcoming
                    }`}
                  >
                    {session.status === "completed" ? "انجام شده" : "آینده"}
                  </span>

                  {session.rating && (
                    <div className={styles.ratingStars}>
                      {renderStars(session.rating)}
                    </div>
                  )}
                </div>
              </div>

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
                {session.status === "completed" ? (
                  <button
                    className={styles.primaryButton}
                    onClick={() => setActiveTab("booking")}
                  >
                    رزرو مجدد این سرویس
                  </button>
                ) : (
                  <>
                    <button className={styles.primaryButton}>
                      مشاهده جزئیات نوبت
                    </button>
                    <button className={styles.cancelButton}>لغو نوبت</button>
                  </>
                )}
              </div>
            </div>
          ))}
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
              <div className={styles.stepLabel}>انتخاب تراپیست</div>
            </div>

            <div
              className={`${styles.step} ${
                bookingStep >= 3 ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>۳</div>
              <div className={styles.stepLabel}>تاریخ و ساعت</div>
            </div>

            <div
              className={`${styles.step} ${
                bookingStep >= 4 ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>۴</div>
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
                        <FiClock className={styles.detailIcon} />
                        <span>{massage.duration}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <FiDollarSign className={styles.detailIcon} />
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

          {/* Step 2: Select Therapist */}
          {bookingStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>ماساژتراپیست را انتخاب کنید</h2>
              <p className={styles.stepDescription}>
                یکی از متخصصان ما را بر اساس تخصص و تجربه انتخاب نمایید
              </p>

              <div className={styles.therapistGrid}>
                {therapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className={`${styles.therapistCard} ${
                      bookingData.selectedTherapist?.id === therapist.id
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() =>
                      handleBookingChange("selectedTherapist", therapist)
                    }
                  >
                    <div className={styles.therapistImage}>
                      <img src={therapist.image} alt={therapist.name} />
                      {bookingData.selectedTherapist?.id === therapist.id && (
                        <div className={styles.selectedBadge}>
                          <FiCheck />
                        </div>
                      )}
                    </div>

                    <div className={styles.therapistInfo}>
                      <h3 className={styles.therapistName}>{therapist.name}</h3>
                      <p className={styles.therapistSpecialty}>
                        {therapist.specialty}
                      </p>

                      <div className={styles.therapistDetails}>
                        <div className={styles.detailItem}>
                          <FiStar className={styles.detailIcon} />
                          <span>{therapist.rating}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <FiUser className={styles.detailIcon} />
                          <span>{therapist.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                  disabled={!bookingData.selectedTherapist}
                  className={styles.nextButton}
                >
                  ادامه
                  <FiChevronRight className={styles.buttonIcon} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {bookingStep === 3 && (
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

          {/* Step 4: Confirmation */}
          {bookingStep === 4 && (
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
                    <span className={styles.detailLabel}>ماساژتراپیست:</span>
                    <span className={styles.detailValue}>
                      {bookingData.selectedTherapist?.name}
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

            {bookingData.selectedTherapist && (
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>ماساژتراپیست:</div>
                <div className={styles.summaryValue}>
                  {bookingData.selectedTherapist.name}
                </div>
                <div className={styles.summarySubtext}>
                  {renderStars(bookingData.selectedTherapist.rating)} •{" "}
                  {bookingData.selectedTherapist.experience}
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
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="جستجو..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.headerActions}>
            <button className={styles.notificationButton}>
              <FiBell />
            </button>

            <div className={styles.userQuickInfo}>
              <span className={styles.welcomeText}>
                خوش آمدید، {userData.fullName}!
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className={styles.contentArea}>
          {activeTab === "dashboard" && <DashboardHome />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "history" && <MassageHistory />}
          {activeTab === "booking" && <Booking />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
