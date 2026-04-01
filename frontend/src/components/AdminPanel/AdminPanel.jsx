import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminPanel.module.css";
import moment from "moment-jalaali";
import { adminService, notificationService } from "../../services/userService";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiStar,
  FiLogOut,
  FiBell,
  FiCreditCard,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiMessageSquare,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiPlus,
  FiSave,
  FiX,
  FiMail,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import { userService } from "../../services/userService";

// import moment from "moment-jalaali";

// تبدیل تاریخ میلادی به شمسی
const formatGregorianToPersian = (gregorianDate) => {
  if (!gregorianDate) return "نامشخص";

  try {
    // تبدیل تاریخ میلادی به moment
    const m = moment(gregorianDate);
    // بررسی معتبر بودن تاریخ
    if (!m.isValid()) return gregorianDate;

    // تبدیل به شمسی با فرمت دلخواه
    return m.format("jYYYY/jMM/jDD");
  } catch (error) {
    console.error("Error formatting date:", error);
    return gregorianDate;
  }
};

// استخراج روز شمسی
const getPersianDayNumber = (gregorianDate) => {
  if (!gregorianDate) return "";

  try {
    const m = moment(gregorianDate);
    if (!m.isValid()) return "";
    return m.format("jD");
  } catch (error) {
    return "";
  }
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // ============ State برای بخش‌های مختلف ============
  // Dashboard
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [appointmentsTotal, setAppointmentsTotal] = useState(0);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsStatusFilter, setAppointmentsStatusFilter] =
    useState("all");
  const [appointmentsDateFilter, setAppointmentsDateFilter] = useState("");

  // Appointments Management Section
  const [appointmentsSearch, setAppointmentsSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [therapistNotes, setTherapistNotes] = useState("");

  // Services
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    category: "آرامش‌بخش",
    icon: "FiUser",
    is_active: true,
  });

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsStatus, setReviewsStatus] = useState("pending");

  // Clients (مراجعین)
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // Calendar (تقویم)
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Reviews
  const [reviewCounts, setReviewCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  // ============ دریافت اطلاعات کاربر جاری ============
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getCurrentUser();
        setUserData(response.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.message.includes("توکن")) {
          navigate("/login");
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  // ============ دریافت داده‌ها بر اساس تب فعال ============
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "appointments") {
      fetchAppointments();
    } else if (activeTab === "services") {
      fetchServices();
      // } else if (activeTab === "reviews") {
      //   fetchReviews();
    } else if (activeTab === "clients") {
      fetchClients();
    } else if (activeTab === "calendar") {
      fetchCalendar();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviewsWithStatus(reviewsStatus, reviewsPage);
      fetchReviewCounts(); // اضافه کنید
    }
  }, [activeTab, reviewsStatus, reviewsPage]);

  // دریافت داده‌های نوتیفیکیشن
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // اضافه کردن useEffect برای دریافت مجدد تقویم وقتی selectedDate تغییر می‌کند
  useEffect(() => {
    if (activeTab === "calendar") {
      fetchCalendar();
    }
  }, [selectedDate, activeTab]);

  // ============ توابع دریافت داده‌ها ============
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, overviewData] = await Promise.all([
        adminService.getStats(),
        adminService.getOverview(),
      ]);
      setStats(statsData);
      setOverview(overviewData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page: usersPage,
        search: usersSearch,
        role: usersRoleFilter,
      });
      setUsers(data.users);
      setUsersTotal(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAppointments({
        page: appointmentsPage,
        status: appointmentsStatusFilter,
        date: appointmentsDateFilter,
      });
      setAppointments(data.appointments);
      setAppointmentsTotal(data.total);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await adminService.getServices();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews({
        page: reviewsPage,
        status: reviewsStatus,
      });
      setReviews(data.reviews);
      setReviewsTotal(data.total);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsWithStatus = async (status, page) => {
    setLoading(true);
    try {
      const data = await adminService.getReviews({
        page: page,
        status: status,
      });
      setReviews(data.reviews);
      setReviewsTotal(data.total);
      setReviewsPage(page);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewCounts = async () => {
    try {
      // دریافت تعداد نظرات در انتظار
      const pendingData = await adminService.getReviews({
        status: "pending",
        page: 1,
        limit: 1,
      });
      // دریافت تعداد نظرات تایید شده
      const approvedData = await adminService.getReviews({
        status: "approved",
        page: 1,
        limit: 1,
      });
      // دریافت تعداد نظرات رد شده
      const rejectedData = await adminService.getReviews({
        status: "rejected",
        page: 1,
        limit: 1,
      });
      // دریافت تعداد کل نظرات
      const allData = await adminService.getReviews({
        status: "all",
        page: 1,
        limit: 1,
      });

      setReviewCounts({
        pending: pendingData.total || 0,
        approved: approvedData.total || 0,
        rejected: rejectedData.total || 0,
        all: allData.total || 0,
      });
    } catch (error) {
      console.error("Error fetching review counts:", error);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await adminService.getClients();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30);

      const data = await adminService.getCalendar(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      console.log("📅 Calendar data received:", data);
      console.log("First appointment date:", data[0]?.date);

      setCalendarAppointments(data);
    } catch (error) {
      console.error("Error fetching calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(1, 50);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // ============ توابع مدیریتی ============
  const handleLogout = () => {
    userService.logout();
    navigate("/");
  };

  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      await adminService.updateUser(userId, { is_active: isActive });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await adminService.updateAppointmentStatus(appointmentId, status);
      fetchAppointments();
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("آیا مطمئن هستید می‌خواهید این نوبت را لغو کنید؟")) {
      try {
        await adminService.cancelAppointmentByAdmin(appointmentId);
        fetchAppointments();
        fetchDashboardData();
        fetchCalendar();
      } catch (error) {
        console.error("Error cancelling appointment:", error);
      }
    }
  };

  const handleAddTherapistNotes = async (appointmentId, notes) => {
    try {
      await adminService.addTherapistNotes(appointmentId, notes);
      fetchAppointments();
    } catch (error) {
      console.error("Error adding therapist notes:", error);
    }
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await adminService.updateService(editingService.id, serviceForm);
      } else {
        await adminService.createService(serviceForm);
      }
      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({
        name: "",
        description: "",
        duration_minutes: 60,
        price: 0,
        category: "آرامش‌بخش",
        icon: "FiUser",
        is_active: true,
      });
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm("آیا مطمئن هستید می‌خواهید این سرویس را حذف کنید؟")) {
      try {
        await adminService.deleteService(serviceId);
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleApproveReview = async (
    reviewId,
    isApproved,
    isRejected = false
  ) => {
    try {
      await adminService.approveReview(reviewId, isApproved, isRejected);
      fetchReviewsWithStatus(reviewsStatus, reviewsPage);
      fetchReviewCounts(); // اضافه کنید - برای به‌روزرسانی تعدادها
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  // const handleApproveReview = async (
  //   reviewId,
  //   isApproved,
  //   isRejected = false
  // ) => {
  //   console.log("🔄 ===== handleApproveReview START =====");
  //   console.log("📝 reviewId:", reviewId);
  //   console.log("📝 isApproved:", isApproved);
  //   console.log("📝 isRejected:", isRejected);

  //   try {
  //     const result = await adminService.approveReview(
  //       reviewId,
  //       isApproved,
  //       isRejected
  //     );
  //     console.log("✅ Response from server:", result);
  //     console.log("🔄 Fetching reviews again...");
  //     await fetchReviewsWithStatus(reviewsStatus, reviewsPage);
  //     console.log("✅ Reviews updated");
  //   } catch (error) {
  //     console.error("❌ Error approving review:", error);
  //     alert("خطا در تایید/رد نظر: " + (error.message || "خطای ناشناخته"));
  //   }
  //   console.log("🔄 ===== handleApproveReview END =====");
  // };

  const handleViewClient = async (clientId) => {
    try {
      const client = await adminService.getClientDetails(clientId);
      setSelectedClient(client);
      setShowClientModal(true);
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications read:", error);
    }
  };

  const getNextAppointment = () => {
    if (!overview?.today_appointments) return null;

    const today = new Date().toISOString().split("T")[0];
    const futureAppointments = overview.today_appointments.filter(
      (apt) => apt.date > today
    );

    if (futureAppointments.length === 0) return null;

    // مرتب‌سازی بر اساس تاریخ
    futureAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    return futureAppointments[0];
  };

  // ============ وضعیت‌های نوبت ============
  const statusConfig = {
    pending: {
      label: "در انتظار",
      color: "#f59e0b",
      bg: "#fef3c7",
      icon: FiClock,
    },
    confirmed: {
      label: "تأیید شده",
      color: "#10b981",
      bg: "#d1fae5",
      icon: FiCheckCircle,
    },
    completed: {
      label: "انجام شده",
      color: "#3b82f6",
      bg: "#dbeafe",
      icon: FiCheck,
    },
    cancelled: {
      label: "لغو شده",
      color: "#ef4444",
      bg: "#fee2e2",
      icon: FiXCircle,
    },
    expired: {
      label: "تأیید نشده - منقضی شده",
      color: "#6b7280",
      bg: "#f3f4f6",
      icon: FiAlertCircle,
    },
  };

  // ============ کامپوننت‌های داخلی ============

  // سایدبار
  const Sidebar = () => (
    <div
      className={`${styles.sidebar} ${
        sidebarCollapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.logo}>
        <h2>{sidebarCollapsed ? "FM" : "فرشاد ماساژ"}</h2>
        <button
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className={styles.nav}>
        {[
          { id: "dashboard", label: "داشبورد", icon: FiHome },
          { id: "calendar", label: "تقویم کاری", icon: FiCalendar },
          { id: "clients", label: "مراجعین", icon: FiUsers },
          { id: "appointments", label: "نوبت‌ها", icon: FiClock },
          { id: "services", label: "خدمات", icon: FiStar },
          { id: "reviews", label: "نظرات", icon: FiMessageSquare },
          { id: "users", label: "کاربران", icon: FiUserCheck },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`${styles.navItem} ${
              activeTab === item.id ? styles.active : ""
            }`}
          >
            <item.icon className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {userData?.full_name?.charAt(0) || "A"}
          </div>
          {!sidebarCollapsed && (
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {userData?.full_name || "ادمین"}
              </span>
              <span className={styles.userRole}>مدیر سیستم</span>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <FiLogOut />
          {!sidebarCollapsed && <span>خروج</span>}
        </button>
      </div>
    </div>
  );

  // هدر با نوتیفیکیشن
  const Header = () => (
    <div className={styles.header}>
      <h1 className={styles.pageTitle}>
        {activeTab === "dashboard" && "داشبورد مدیریت"}
        {activeTab === "calendar" && "تقویم کاری"}
        {activeTab === "clients" && "لیست مراجعین"}
        {activeTab === "appointments" && "مدیریت نوبت‌ها"}
        {activeTab === "services" && "مدیریت خدمات"}
        {activeTab === "reviews" && "مدیریت نظرات"}
        {activeTab === "users" && "مدیریت کاربران"}
      </h1>

      <div className={styles.headerActions}>
        <div className={styles.notificationWrapper}>
          <button
            className={styles.notificationBtn}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <span>نوتیفیکیشن‌ها</span>
                {notifications.some((n) => !n.is_read) && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className={styles.markAllRead}
                  >
                    همه پیام ها خوانده شدند.
                  </button>
                )}
              </div>
              <div className={styles.dropdownList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    نوتیفیکیشنی وجود ندارد.
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`${styles.notificationItem} ${
                        !notif.is_read ? styles.unread : ""
                      }`}
                      onClick={() => handleMarkNotificationRead(notif.id)}
                    >
                      <div className={styles.notificationTitle}>
                        {notif.title}
                      </div>
                      <div className={styles.notificationMessage}>
                        {notif.message}
                      </div>
                      <div className={styles.notificationTime}>
                        {new Date(notif.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // لودینگ
  if (loading && !stats && !users.length && !services.length) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال بارگذاری ...</p>
      </div>
    );
  }

  // تابع تولید روزهای هفته
  const generateWeekDays = (currentDate) => {
    const weekDays = [];
    const startOfWeek = new Date(currentDate);

    // تنظیم به اولین روز هفته (شنبه در تقویم ایران)
    const dayOfWeek = startOfWeek.getDay();
    const daysToSaturday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToSaturday);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // دریافت روز شمسی با moment
      const persianDay = moment(dateStr).format("jD");

      weekDays.push({
        dateStr: dateStr,
        dayName: date.toLocaleDateString("fa-IR", { weekday: "long" }),
        dayNumber: parseInt(persianDay),
        month: date.toLocaleDateString("fa-IR", { month: "long" }),
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    return weekDays;
  };

  return (
    <div className={styles.adminPanel}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Header />
        <div className={styles.content}>
          {/* Dashboard Section */}
          {activeTab === "dashboard" && (
            <div className={styles.dashboard}>
              {/* کارت‌های آماری */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div
                    className={styles.statIcon}
                    style={{ backgroundColor: "#e6f7e6", color: "#10b981" }}
                  >
                    <FiUsers />
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.total_users || 0}</h3>
                    <p>کاربران فعال</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div
                    className={styles.statIcon}
                    style={{ backgroundColor: "#e6f0ff", color: "#3b82f6" }}
                  >
                    <FiCalendar />
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.total_appointments || 0}</h3>
                    <p>کل نوبت‌های گذشته</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div
                    className={styles.statIcon}
                    style={{ backgroundColor: "#fff3e0", color: "#f59e0b" }}
                  >
                    <FiClock />
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.pending_appointments || 0}</h3>
                    <p>نوبت‌های در انتظار</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div
                    className={styles.statIcon}
                    style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
                  >
                    <FiCreditCard />
                  </div>
                  <div className={styles.statInfo}>
                    <h3>
                      {stats?.monthly_revenue?.toLocaleString("fa-IR") || 0}{" "}
                      تومان
                    </h3>
                    <p>درآمد ماه جاری</p>
                  </div>
                </div>
              </div>

              {/* بخش نوبت‌ها */}
              {overview?.today_appointments?.length > 0 ? (
                // حالت 1: امروز نوبت دارد
                <div className={styles.todayAppointments}>
                  <h2 className={styles.sectionTitle}>
                    <FiCalendar className={styles.sectionIcon} />
                    نوبت‌های امروز
                  </h2>
                  <div className={styles.appointmentsList}>
                    {overview.today_appointments.map((apt) => (
                      <div key={apt.id} className={styles.appointmentCard}>
                        <div className={styles.appointmentTime}>{apt.time}</div>
                        <div className={styles.appointmentInfo}>
                          <strong>{apt.client_name}</strong>
                          <span className={styles.appointmentService}>
                            {apt.service}
                          </span>
                        </div>
                        <div
                          className={styles.appointmentStatus}
                          style={{
                            backgroundColor: statusConfig[apt.status]?.bg,
                            color: statusConfig[apt.status]?.color,
                          }}
                        >
                          {statusConfig[apt.status]?.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // حالت 2: امروز نوبت ندارد
                <div className={styles.noAppointmentsCard}>
                  <FiCalendar className={styles.noAppointmentsIcon} />
                  <p>برای امروز نوبتی وجود ندارد.</p>

                  {/* بررسی نوبت‌های آینده */}
                  {overview?.future_appointments &&
                  Object.keys(overview.future_appointments).length > 0 ? (
                    // حالت 2-1: نوبت آینده وجود دارد
                    (() => {
                      const nextDate = Object.keys(
                        overview.future_appointments
                      ).sort()[0];
                      const nextAppointments =
                        overview.future_appointments[nextDate];
                      return (
                        <div className={styles.futureAppointmentsCard}>
                          <h3 className={styles.futureTitle}>
                            <FiClock className={styles.futureIcon} />
                            نزدیک‌ترین روز بعدی با نوبت:
                          </h3>
                          <div className={styles.futureDate}>
                            {formatGregorianToPersian(nextDate)}
                          </div>
                          <div className={styles.appointmentsList}>
                            {nextAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className={styles.appointmentCard}
                              >
                                <div className={styles.appointmentTime}>
                                  {apt.time}
                                </div>
                                <div className={styles.appointmentInfo}>
                                  <strong>{apt.client_name}</strong>
                                  <span className={styles.appointmentService}>
                                    {apt.service}
                                  </span>
                                </div>
                                <div
                                  className={styles.appointmentStatus}
                                  style={{
                                    backgroundColor:
                                      statusConfig[apt.status]?.bg,
                                    color: statusConfig[apt.status]?.color,
                                  }}
                                >
                                  {statusConfig[apt.status]?.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // حالت 3: هیچ نوبتی در آینده وجود ندارد
                    <div className={styles.noFutureAppointmentsCard}>
                      <FiCalendar className={styles.noAppointmentsIcon} />
                      <p>نوبت آینده‌ای وجود ندارد.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Calendare Section */}
          {activeTab === "calendar" && (
            <div className={styles.calendarSection}>
              {/* کنترل‌های تقویم */}
              <div className={styles.calendarControls}>
                <div className={styles.calendarNav}>
                  <button
                    className={styles.calendarNavBtn}
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(selectedDate.getDate() - 7);
                      setSelectedDate(newDate);
                    }}
                  >
                    <FiChevronRight />
                    هفته قبل
                  </button>

                  <button
                    className={styles.calendarNavBtn}
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(selectedDate.getDate() + 7);
                      setSelectedDate(newDate);
                    }}
                  >
                    هفته بعد
                    <FiChevronLeft />
                  </button>

                  <button
                    className={styles.calendarTodayBtn}
                    onClick={() => setSelectedDate(new Date())}
                  >
                    امروز
                  </button>
                </div>

                <div className={styles.calendarMonth}>
                  {selectedDate.toLocaleDateString("fa-IR", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>
              </div>

              {/* تقویم هفتگی */}
              <div className={styles.calendarWeek}>
                {generateWeekDays(selectedDate).map((day) => {
                  // فیلتر کردن نوبت‌ها بر اساس تاریخ (مقایسه به صورت string)
                  const dayAppointments = calendarAppointments.filter(
                    (apt) => apt.date === day.dateStr
                  );

                  console.log(
                    `Day ${day.dateStr} has ${dayAppointments.length} appointments`
                  );

                  const isToday = day.isToday;

                  return (
                    <div
                      key={day.dateStr}
                      className={`${styles.calendarDay} ${
                        isToday ? styles.today : ""
                      }`}
                    >
                      <div className={styles.calendarDayHeader}>
                        <div className={styles.calendarDayName}>
                          {day.dayName}
                        </div>
                        <div className={styles.calendarDayNumber}>
                          {day.dayNumber}
                        </div>
                      </div>

                      <div className={styles.calendarAppointments}>
                        {dayAppointments.length === 0 ? (
                          <div className={styles.calendarEmpty}>
                            <FiCalendar />
                            <span>بدون نوبت</span>
                          </div>
                        ) : (
                          dayAppointments.map((apt) => {
                            const status =
                              statusConfig[apt.status] || statusConfig.pending;
                            const StatusIcon = status.icon;

                            return (
                              <div
                                key={apt.id}
                                className={`${styles.calendarAppointment} ${
                                  styles[apt.status]
                                }`}
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setShowNotesModal(true);
                                }}
                              >
                                <div className={styles.calendarAppointmentTime}>
                                  <FiClock className={styles.timeIcon} />
                                  {apt.time}
                                </div>
                                <div
                                  className={styles.calendarAppointmentClient}
                                >
                                  <strong>
                                    {apt.client?.name ||
                                      apt.client_name ||
                                      "نامشخص"}
                                  </strong>
                                  <span
                                    className={
                                      styles.calendarAppointmentService
                                    }
                                  >
                                    {apt.service?.name || "نامشخص"}
                                  </span>
                                </div>
                                <div
                                  className={styles.calendarAppointmentStatus}
                                  style={{
                                    backgroundColor: status.bg,
                                    color: status.color,
                                  }}
                                >
                                  <StatusIcon />
                                  {status.label}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* خلاصه وضعیت نوبت‌ها */}
              <div className={styles.calendarSummary}>
                <div className={styles.summaryTitle}>وضعیت نوبت‌ها</div>
                <div className={styles.summaryStats}>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const count = calendarAppointments.filter(
                      (apt) => apt.status === key
                    ).length;
                    return (
                      <div key={key} className={styles.summaryStat}>
                        <div
                          className={styles.summaryDot}
                          style={{ backgroundColor: config.color }}
                        />
                        <span>{config.label}</span>
                        <span className={styles.summaryCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Clients section */}
          {activeTab === "clients" && (
            <div className={styles.clientsSection}>
              <div className={styles.clientsList}>
                {clients.map((client) => (
                  <div key={client.id} className={styles.clientCard}>
                    <div className={styles.clientAvatar}>
                      {client.full_name?.charAt(0) || "M"}
                    </div>
                    <div className={styles.clientInfo}>
                      <h3>{client.full_name}</h3>
                      <p className={styles.clientPhone}>{client.phone}</p>
                      <div className={styles.clientStats}>
                        <span>
                          <FiCalendar /> {client.total_appointments} نوبت
                        </span>
                        <span>
                          <FiCreditCard />{" "}
                          {client.total_spent?.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                    </div>
                    <button
                      className={styles.viewClientBtn}
                      onClick={() => handleViewClient(client.id)}
                    >
                      <FiEye />
                      مشاهده جزئیات
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointment Management Section */}
          {activeTab === "appointments" && (
            <div className={styles.appointmentsSection}>
              {/* فیلترها */}
              <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="جستجوی مشتری..."
                    value={appointmentsSearch}
                    onChange={(e) => setAppointmentsSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && fetchAppointments()}
                  />
                </div>

                <select
                  className={styles.filterSelect}
                  value={appointmentsStatusFilter}
                  onChange={(e) => {
                    setAppointmentsStatusFilter(e.target.value);
                    setAppointmentsPage(1);
                  }}
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار تأیید</option>
                  <option value="confirmed">تأیید شده</option>
                  <option value="completed">انجام شده</option>
                  <option value="cancelled">لغو شده</option>
                  <option value="expired">تأیید نشده - منقضی شده</option>
                </select>

                {/* 
                <input
                  type="date"
                  className={styles.dateFilter}
                  value={appointmentsDateFilter}
                  onChange={(e) => {
                    setAppointmentsDateFilter(e.target.value);
                    setAppointmentsPage(1);
                  }}
                /> */}

                <button
                  className={styles.searchBtn}
                  onClick={fetchAppointments}
                >
                  <FiRefreshCw />
                  <span> بروزرسانی</span>
                </button>
              </div>

              {/* جدول نوبت‌ها */}
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>ردیف</th>
                      <th>کد نوبت</th>
                      <th>تاریخ و ساعت</th>
                      <th>مشتری</th>
                      <th>خدمت</th>
                      <th>قیمت</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt, index) => {
                      const status =
                        statusConfig[apt.status] || statusConfig.pending;
                      const StatusIcon = status.icon;

                      return (
                        <tr key={apt.id}>
                          <td className={styles.rowNumber}>{index + 1}</td>
                          <td className={styles.appointmentCode}>
                            {apt.appointment_code || `#${apt.id}`}
                          </td>
                          <td>
                            <div className={styles.appointmentDateTime}>
                              <span className={styles.appointmentDate}>
                                {new Date(
                                  apt.appointment_date
                                ).toLocaleDateString("fa-IR")}
                              </span>
                              <span className={styles.appointmentTime}>
                                {apt.appointment_time}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.clientInfo}>
                              <strong>{apt.user?.full_name || "نامشخص"}</strong>
                              <span className={styles.clientPhone}>
                                {apt.user?.phone}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.serviceInfo}>
                              <span>{apt.service?.name || "نامشخص"}</span>
                              <span className={styles.serviceDuration}>
                                {apt.service?.duration_minutes} دقیقه
                              </span>
                            </div>
                          </td>
                          <td className={styles.priceCell}>
                            {apt.price?.toLocaleString("fa-IR")} تومان
                          </td>
                          <td>
                            <span
                              className={styles.statusBadge}
                              style={{
                                backgroundColor: status.bg,
                                color: status.color,
                              }}
                            >
                              <StatusIcon className={styles.statusIcon} />
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionButtons}>
                              {/* تغییر وضعیت */}
                              {apt.status === "pending" && (
                                <button
                                  className={styles.confirmBtn}
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      apt.id,
                                      "confirmed"
                                    )
                                  }
                                  title="تأیید نوبت"
                                >
                                  <FiCheckCircle />
                                </button>
                              )}

                              {apt.status === "confirmed" && (
                                <button
                                  className={styles.completeBtn}
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      apt.id,
                                      "completed"
                                    )
                                  }
                                  title="انجام شد"
                                >
                                  <FiCheck />
                                </button>
                              )}

                              {/* یادداشت تراپیست */}
                              <button
                                className={styles.noteBtn}
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setShowNotesModal(true);
                                }}
                                title="یادداشت تراپیست"
                              >
                                <FiMessageSquare />
                              </button>

                              {/* لغو نوبت */}
                              {(apt.status === "pending" ||
                                apt.status === "confirmed") && (
                                <button
                                  className={styles.cancelBtn}
                                  onClick={() =>
                                    handleCancelAppointment(apt.id)
                                  }
                                  title="لغو نوبت"
                                >
                                  <FiXCircle />
                                </button>
                              )}

                              {/* مشاهده جزئیات */}
                              <button
                                className={styles.viewBtn}
                                onClick={() => handleViewClient(apt.user?.id)}
                                title="مشاهده مشتری"
                              >
                                <FiEye />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {appointments.length === 0 && (
                  <div className={styles.emptyState}>
                    <FiCalendar className={styles.emptyIcon} />
                    <p>نوبتی یافت نشد</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {appointmentsTotal > 20 && (
                <div className={styles.pagination}>
                  <button
                    disabled={appointmentsPage === 1}
                    onClick={() => {
                      setAppointmentsPage(appointmentsPage - 1);
                      fetchAppointments();
                    }}
                  >
                    <FiChevronRight />
                  </button>
                  <span>صفحه {appointmentsPage}</span>
                  <button
                    disabled={appointmentsPage * 20 >= appointmentsTotal}
                    onClick={() => {
                      setAppointmentsPage(appointmentsPage + 1);
                      fetchAppointments();
                    }}
                  >
                    <FiChevronLeft />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* مودال یادداشت تراپیست */}
          {showNotesModal && selectedAppointment && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowNotesModal(false)}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3>
                    <FiMessageSquare />
                    <span> یادداشت تراپیست</span>
                  </h3>
                  <button
                    className={styles.closeModal}
                    onClick={() => setShowNotesModal(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.appointmentInfoBox}>
                    <p>
                      <strong>مشتری:</strong>{" "}
                      {selectedAppointment.user?.full_name ||
                        selectedAppointment.client?.name ||
                        "نامشخص"}
                    </p>
                    <p>
                      <strong>خدمت:</strong>{" "}
                      {selectedAppointment.service?.name || "نامشخص"}
                    </p>
                    <p>
                      <strong>تاریخ و ساعت:</strong>{" "}
                      {selectedAppointment.date
                        ? formatGregorianToPersian(selectedAppointment.date)
                        : selectedAppointment.appointment_date
                        ? formatGregorianToPersian(
                            selectedAppointment.appointment_date
                          )
                        : "نامشخص"}{" "}
                      -{" "}
                      {selectedAppointment.time ||
                        selectedAppointment.appointment_time}
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label>یادداشت تراپیست</label>
                    <textarea
                      value={therapistNotes}
                      onChange={(e) => setTherapistNotes(e.target.value)}
                      rows="5"
                      placeholder="نکات مربوط به این جلسه، وضعیت مشتری، توصیه‌ها و ..."
                    />
                  </div>

                  {selectedAppointment.therapist_notes && (
                    <div className={styles.existingNotes}>
                      <strong>یادداشت قبلی:</strong>
                      <p>{selectedAppointment.therapist_notes}</p>
                    </div>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowNotesModal(false)}
                  >
                    انصراف
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={async () => {
                      await handleAddTherapistNotes(
                        selectedAppointment.id,
                        therapistNotes
                      );
                      setShowNotesModal(false);
                      setTherapistNotes("");
                    }}
                  >
                    <FiSave />
                    ذخیره یادداشت
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services Section */}
          {activeTab === "services" && (
            <div className={styles.servicesSection}>
              <div className={styles.sectionHeader}>
                <button
                  className={styles.addBtn}
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      name: "",
                      description: "",
                      duration_minutes: 60,
                      price: 0,
                      category: "آرامش‌بخش",
                      icon: "FiUser",
                      is_active: true,
                    });
                    setShowServiceModal(true);
                  }}
                >
                  <FiPlus />
                  افزودن سرویس جدید
                </button>
              </div>

              <div className={styles.servicesGrid}>
                {services.map((service) => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceHeader}>
                      <div
                        className={`${styles.serviceStatus} ${
                          service.is_active
                            ? styles.activeStatus
                            : styles.inactiveStatus
                        }`}
                      >
                        {service.is_active ? "فعال" : "غیرفعال"}
                      </div>
                    </div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <div className={styles.serviceDetails}>
                      <span>
                        <FiClock /> {service.duration_minutes} دقیقه
                      </span>
                      {"."}
                      <span>
                        {service.price?.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className={styles.serviceActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => {
                          setEditingService(service);
                          setServiceForm({
                            name: service.name,
                            description: service.description,
                            duration_minutes: service.duration_minutes,
                            price: service.price,
                            category: service.category,
                            icon: service.icon,
                            is_active: service.is_active,
                          });
                          setShowServiceModal(true);
                        }}
                      >
                        <FiEdit />
                        ویرایش
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <FiTrash2 />
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* مودال سرویس */}
          {showServiceModal && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowServiceModal(false)}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3>
                    {editingService ? "ویرایش سرویس" : "افزودن سرویس جدید"}
                  </h3>
                  <button
                    className={styles.closeModal}
                    onClick={() => setShowServiceModal(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>نام سرویس</label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, name: e.target.value })
                      }
                      placeholder="مثلاً: ماساژ سوئدی"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>توضیحات</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>مدت زمان (دقیقه)</label>
                      <input
                        type="number"
                        value={serviceForm.duration_minutes}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            duration_minutes: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>قیمت (تومان)</label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            price: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>دسته‌بندی</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="آرامش‌بخش">آرامش‌بخش</option>
                      <option value="انرژی‌بخش">انرژی‌بخش</option>
                      <option value="درمانی">درمانی</option>
                      <option value="ویژه">ویژه</option>
                    </select>
                  </div>
                  <div className={styles.isActive}>
                    <label>
                      فعال بودن سرویس
                      <input
                        type="checkbox"
                        checked={serviceForm.is_active}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            is_active: e.target.checked,
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowServiceModal(false)}
                  >
                    انصراف
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveService}
                  >
                    <FiSave />
                    ذخیره
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* مودال جزئیات مشتری */}
          {showClientModal && selectedClient && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowClientModal(false)}
            >
              <div
                className={`${styles.modal} ${styles.clientModal}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3>جزئیات مشتری</h3>
                  <button
                    className={styles.closeModal}
                    onClick={() => setShowClientModal(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.clientProfile}>
                    <div className={styles.clientAvatarLarge}>
                      {selectedClient.full_name?.charAt(0) || "M"}
                    </div>
                    <div className={styles.clientBasicInfo}>
                      <h2>{selectedClient.full_name}</h2>
                      <p>
                        <FiCalendar /> تاریخ تولد:{" "}
                        {new Date(selectedClient.birth_date).toLocaleDateString(
                          "fa-IR"
                        )}
                      </p>
                      <p>
                        <FiBriefcase /> شغل: {selectedClient.job}
                      </p>
                      <p>
                        <FiUser /> {selectedClient.phone}
                      </p>
                      <p>
                        <FiMail /> {selectedClient.email || "ثبت نشده"}
                      </p>
                      <p>
                        <FiCalendar /> تاریخ عضویت:{" "}
                        {new Date(
                          selectedClient.joined_date
                        ).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>

                  <div className={styles.clientStatsBox}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>
                        {selectedClient.stats?.total_appointments || 0}
                      </span>
                      <span className={styles.statLabel}>کل نوبت‌ها</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>
                        {selectedClient.stats?.completed_appointments || 0}
                      </span>
                      <span className={styles.statLabel}>انجام شده</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>
                        {selectedClient.stats?.total_spent?.toLocaleString(
                          "fa-IR"
                        ) || 0}{" "}
                        تومان
                      </span>
                      <span className={styles.statLabel}>کل هزینه</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>
                        {selectedClient.stats?.avg_rating?.toFixed(1) || 0}
                      </span>
                      <span className={styles.statLabel}>میانگین امتیاز</span>
                    </div>
                  </div>

                  <h4 className={styles.sectionSubtitle}>تاریخچه نوبت‌ها</h4>
                  <div className={styles.clientAppointments}>
                    {selectedClient.appointments?.map((apt) => (
                      <div key={apt.id} className={styles.historyItem}>
                        <div className={styles.historyDate}>
                          {apt.date} - {apt.time}
                        </div>
                        <div className={styles.historyService}>
                          {apt.service?.name || "سرویس"}
                        </div>
                        <div
                          className={styles.historyStatus}
                          style={{
                            backgroundColor: statusConfig[apt.status]?.bg,
                            color: statusConfig[apt.status]?.color,
                          }}
                        >
                          {statusConfig[apt.status]?.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedClient.medical_info &&
                    Object.keys(selectedClient.medical_info).length > 0 && (
                      <div className={styles.medicalInfo}>
                        <h4 className={styles.sectionSubtitle}>
                          اطلاعات پزشکی
                        </h4>
                        {selectedClient.medical_info.allergies && (
                          <p>
                            <strong>آلرژی‌ها:</strong>{" "}
                            {selectedClient.medical_info.allergies}
                          </p>
                        )}
                        {selectedClient.medical_info.conditions?.length > 0 && (
                          <p>
                            <strong>شرایط خاص:</strong>{" "}
                            {selectedClient.medical_info.conditions.join(", ")}
                          </p>
                        )}
                        {selectedClient.medical_info.notes && (
                          <p>
                            <strong>یادداشت:</strong>{" "}
                            {selectedClient.medical_info.notes}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {activeTab === "reviews" && (
            <div className={styles.reviewsSection}>
              <div className={styles.filtersBar}>
                {/* <div className={styles.filterCards}>
                  <button
                    className={`${styles.filterCard} ${styles.pendingCard} ${
                      reviewsStatus === "pending" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("pending");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("pending", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiClock />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>
                        در انتظار تایید
                      </span>
                      <span className={styles.filterCardCount}>
                        {reviewsTotal || 0}
                      </span>
                    </div>
                  </button>

                  <button
                    className={`${styles.filterCard} ${styles.approvedCard} ${
                      reviewsStatus === "approved" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("approved");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("approved", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiCheckCircle />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>تایید شده</span>
                      <span className={styles.filterCardCount}>
                        {reviews.filter((r) => r.is_approved).length}
                      </span>
                    </div>
                  </button>

                  <button
                    className={`${styles.filterCard} ${styles.rejectedCard} ${
                      reviewsStatus === "rejected" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("rejected");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("rejected", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiXCircle />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>رد شده</span>
                      <span className={styles.filterCardCount}>
                        {reviews.filter((r) => r.is_rejected).length}
                      </span>
                    </div>
                  </button>

                  <button
                    className={`${styles.filterCard} ${styles.allCard} ${
                      reviewsStatus === "all" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("all");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("all", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiStar />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>همه نظرات</span>
                      <span className={styles.filterCardCount}>
                        {reviewsTotal}
                      </span>
                    </div>
                  </button>
                </div> */}
                <div className={styles.filterCards}>
                  <button
                    className={`${styles.filterCard} ${styles.pendingCard} ${
                      reviewsStatus === "pending" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("pending");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("pending", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiClock />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>
                        در انتظار تایید
                      </span>
                      <span className={styles.filterCardCount}>
                        {reviewCounts.pending}{" "}
                        {/* ✅ استفاده از reviewCounts */}
                      </span>
                    </div>
                  </button>

                  <button
                    className={`${styles.filterCard} ${styles.approvedCard} ${
                      reviewsStatus === "approved" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("approved");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("approved", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiCheckCircle />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>تایید شده</span>
                      <span className={styles.filterCardCount}>
                        {reviewCounts.approved}{" "}
                        {/* ✅ استفاده از reviewCounts */}
                      </span>
                    </div>
                  </button>

                  <button
                    className={`${styles.filterCard} ${styles.rejectedCard} ${
                      reviewsStatus === "rejected" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("rejected");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("rejected", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiXCircle />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>رد شده</span>
                      <span className={styles.filterCardCount}>
                        {reviewCounts.rejected}{" "}
                        {/* ✅ استفاده از reviewCounts */}
                      </span>
                    </div>
                  </button>

                  <button
                    className={`${styles.filterCard} ${styles.allCard} ${
                      reviewsStatus === "all" ? styles.active : ""
                    }`}
                    onClick={() => {
                      setReviewsStatus("all");
                      setReviewsPage(1);
                      fetchReviewsWithStatus("all", 1);
                    }}
                  >
                    <div className={styles.filterCardIcon}>
                      <FiStar />
                    </div>
                    <div className={styles.filterCardInfo}>
                      <span className={styles.filterCardLabel}>همه نظرات</span>
                      <span className={styles.filterCardCount}>
                        {reviewCounts.all} {/* ✅ استفاده از reviewCounts */}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerAvatar}>
                          {review.user?.full_name?.charAt(0) ||
                            review.name?.charAt(0) ||
                            "ن"}
                        </div>
                        <div>
                          <div className={styles.reviewerName}>
                            {review.user?.full_name || review.name}
                          </div>
                          <div className={styles.reviewService}>
                            {review.service?.name || "خدمت"}
                          </div>
                        </div>
                      </div>
                      <div className={styles.reviewRating}>
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <FiStar
                              key={i}
                              className={
                                i < review.rating
                                  ? styles.starFilled
                                  : styles.starEmpty
                              }
                            />
                          ))}
                      </div>
                    </div>

                    <p className={styles.reviewText}>{review.text}</p>

                    {/* اطلاعات تکمیلی */}
                    <div className={styles.reviewDetails}>
                      {review.appointment && (
                        <>
                          <div className={styles.detailItem}>
                            <FiClock className={styles.detailIcon} />
                            <span>
                              مدت زمان: {review.service?.duration_minutes} دقیقه
                            </span>
                          </div>
                          <div className={styles.detailItem}>
                            <FiCreditCard className={styles.detailIcon} />
                            <span>
                              قیمت:{" "}
                              {review.appointment.price?.toLocaleString(
                                "fa-IR"
                              )}{" "}
                              تومان
                            </span>
                          </div>
                          <div className={styles.detailItem}>
                            <FiCalendar className={styles.detailIcon} />
                            <span>
                              تاریخ:{" "}
                              {formatGregorianToPersian(
                                review.appointment.appointment_date
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className={styles.reviewMeta}>
                      <span className={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString(
                          "fa-IR"
                        )}
                      </span>
                    </div>

                    <div className={styles.reviewActions}>
                      {/* {!review.is_approved && !review.is_rejected ? (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={async () => {
                              await handleApproveReview(review.id, true, false);
                              fetchReviewsWithStatus(
                                reviewsStatus,
                                reviewsPage
                              );
                            }}
                          >
                            <FiCheck />
                            تایید
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={async () => {
                              await handleApproveReview(review.id, false, true);
                              fetchReviewsWithStatus(
                                reviewsStatus,
                                reviewsPage
                              );
                            }}
                          >
                            <FiX />
                            رد
                          </button>
                        </>
                      ) : review.is_approved ? (
                        <div className={styles.reviewStatus}>
                          <span className={styles.approvedBadge}>
                            <FiCheckCircle />
                            تایید شده
                          </span>
                          <button
                            className={styles.rejectBtnSmall}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "آیا می‌خواهید این نظر را رد کنید؟"
                                )
                              ) {
                                await handleApproveReview(
                                  review.id,
                                  false,
                                  true
                                );
                                fetchReviewsWithStatus(
                                  reviewsStatus,
                                  reviewsPage
                                );
                              }
                            }}
                          >
                            لغو تایید
                          </button>
                        </div>
                      ) : review.is_rejected ? (
                        <div className={styles.reviewStatus}>
                          <span className={styles.rejectedBadge}>
                            <FiXCircle />
                            رد شده
                          </span>
                          <button
                            className={styles.approveBtnSmall}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "آیا می‌خواهید این نظر را تایید کنید؟"
                                )
                              ) {
                                await handleApproveReview(
                                  review.id,
                                  true,
                                  false
                                );
                                fetchReviewsWithStatus(
                                  reviewsStatus,
                                  reviewsPage
                                );
                              }
                            }}
                          >
                            تایید مجدد
                          </button>
                        </div>
                      ) : null} */}
                      {!review.is_approved && !review.is_rejected ? (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={async () => {
                              await handleApproveReview(review.id, true, false);
                            }}
                          >
                            <FiCheck />
                            تایید
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={async () => {
                              await handleApproveReview(review.id, false, true);
                            }}
                          >
                            <FiX />
                            رد
                          </button>
                        </>
                      ) : review.is_approved ? (
                        <div className={styles.reviewStatus}>
                          <span className={styles.approvedBadge}>
                            <FiCheckCircle />
                            تایید شده
                          </span>
                          <button
                            className={styles.rejectBtnSmall}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "آیا می‌خواهید این نظر را رد کنید؟"
                                )
                              ) {
                                await handleApproveReview(
                                  review.id,
                                  false,
                                  true
                                );
                              }
                            }}
                          >
                            لغو تایید
                          </button>
                        </div>
                      ) : review.is_rejected ? (
                        <div className={styles.reviewStatus}>
                          <span className={styles.rejectedBadge}>
                            <FiXCircle />
                            رد شده
                          </span>
                          <button
                            className={styles.approveBtnSmall}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "آیا می‌خواهید این نظر را تایید کنید؟"
                                )
                              ) {
                                await handleApproveReview(
                                  review.id,
                                  true,
                                  false
                                );
                              }
                            }}
                          >
                            تایید مجدد
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length === 0 && (
                <div className={styles.emptyState}>
                  <FiMessageSquare className={styles.emptyIcon} />
                  <p>نظری یافت نشد</p>
                </div>
              )}

              {reviewsTotal > 20 && (
                <div className={styles.pagination}>
                  <button
                    disabled={reviewsPage === 1}
                    onClick={() => {
                      const newPage = reviewsPage - 1;
                      setReviewsPage(newPage);
                      fetchReviewsWithStatus(reviewsStatus, newPage);
                    }}
                  >
                    <FiChevronRight />
                  </button>
                  <span>صفحه {reviewsPage}</span>
                  <button
                    disabled={reviewsPage * 20 >= reviewsTotal}
                    onClick={() => {
                      const newPage = reviewsPage + 1;
                      setReviewsPage(newPage);
                      fetchReviewsWithStatus(reviewsStatus, newPage);
                    }}
                  >
                    <FiChevronLeft />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Users Section */}
          {activeTab === "users" && (
            <div className={styles.usersSection}>
              <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="جستجوی کاربر..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && fetchUsers()}
                  />
                </div>
                <select
                  className={styles.filterSelect}
                  value={usersRoleFilter}
                  onChange={(e) => setUsersRoleFilter(e.target.value)}
                >
                  <option value="all">همه نقش‌ها</option>
                  <option value="user">کاربر عادی</option>
                  <option value="admin">ادمین</option>
                </select>
                <button className={styles.searchBtn} onClick={fetchUsers}>
                  جستجو
                </button>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>نام و نام خانوادگی</th>
                      <th>شماره تماس</th>
                      <th>ایمیل</th>
                      <th>نقش</th>
                      <th>تاریخ عضویت</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.phone}</td>
                        <td>{user.email || "-"}</td>
                        <td>
                          <span
                            className={`${styles.roleBadge} ${
                              user.role === "admin"
                                ? styles.adminRole
                                : styles.userRole
                            }`}
                          >
                            {user.role === "admin" ? "ادمین" : "کاربر"}
                          </span>
                        </td>
                        <td>
                          {new Date(user.created_at).toLocaleDateString(
                            "fa-IR"
                          )}
                        </td>
                        <td>
                          <button
                            className={`${styles.statusToggle} ${
                              user.is_active ? styles.active : styles.inactive
                            }`}
                            onClick={() =>
                              handleUpdateUserStatus(user.id, !user.is_active)
                            }
                          >
                            {user.is_active ? "فعال" : "غیرفعال"}
                          </button>
                        </td>
                        <td>
                          <button
                            className={styles.viewBtn}
                            onClick={() => handleViewClient(user.id)}
                          >
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usersTotal > 20 && (
                <div className={styles.pagination}>
                  <button
                    disabled={usersPage === 1}
                    onClick={() => setUsersPage(usersPage - 1)}
                  >
                    <FiChevronRight />
                  </button>
                  <span>صفحه {usersPage}</span>
                  <button
                    disabled={usersPage * 20 >= usersTotal}
                    onClick={() => setUsersPage(usersPage + 1)}
                  >
                    <FiChevronLeft />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
