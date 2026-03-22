const API_URL = "http://localhost:5000/api";

// ==================== Utility Functions ====================
// ذخیره توکن در localStorage
const setToken = (token) => {
  localStorage.setItem("spa_token", token);
};

// دریافت توکن از localStorage
const getToken = () => {
  return localStorage.getItem("spa_token");
};

// ذخیره refresh token (اگر استفاده می‌کنید)
const setRefreshToken = (refreshToken) => {
  localStorage.setItem("spa_refresh_token", refreshToken);
};

// دریافت refresh token
const getRefreshToken = () => {
  return localStorage.getItem("spa_refresh_token");
};

// حذف توکن‌ها (برای logout)
const removeTokens = () => {
  localStorage.removeItem("spa_token");
  localStorage.removeItem("spa_refresh_token");
};

// هندل کردن response
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "خطا در ارتباط با سرور");
  }

  return data;
};

// هندل کردن خطاهای شبکه
const handleNetworkError = (error) => {
  if (error.message.includes("Failed to fetch")) {
    throw new Error(
      "خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید."
    );
  }
  throw error;
};

// ایجاد headers پیش‌فرض
const getHeaders = (includeAuth = true, customHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// fetch با مدیریت auth
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();

  if (!token && options.requireAuth !== false) {
    throw new Error("توکن احراز هویت یافت نشد. لطفاً مجدداً وارد شوید.");
  }

  const defaultOptions = {
    headers: getHeaders(
      !!token && options.requireAuth !== false,
      options.headers
    ),
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  return response;
};

// ==================== سرویس اصلی ====================
export const userService = {
  async register(userData) {
    try {
      console.log("Registering user with data:", userData);
      console.log("Sending to:", `${API_URL}/auth/register`);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify(userData),
      });

      console.log("Response status:", response.status, response.statusText);

      const contentType = response.headers.get("content-type");
      let errorData;

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = { error: (await response.text()) || "خطای سرور" };
        }

        throw new Error(
          errorData.error ||
            errorData.message ||
            `خطا در ثبت‌نام (${response.status})`
        );
      }

      // اگر response.ok بود
      const data = await response.json();
      console.log("Registration successful:", data);
      if (data.token) {
        setToken(data.token);
      }
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
      }
      return {
        success: true,
        user: data.user,
        message: data.message || "ثبت‌نام با موفقیت انجام شد",
      };
    } catch (error) {
      console.error("خطا در ثبت‌نام:", error);
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید."
        );
      }

      throw error;
    }
  },

  // ورود کاربر با شماره تماس
  async loginWithPhone(phone, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({ phone, password }),
      });

      const data = await handleResponse(response);

      if (data.token) {
        setToken(data.token);
      }
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
      }

      return {
        success: true,
        user: data.user,
        message: data.message || "ورود با موفقیت انجام شد",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در ورود:", error);
      throw error;
    }
  },

  // دریافت اطلاعات کاربر جاری
  async getCurrentUser() {
    try {
      const response = await fetchWithAuth(`${API_URL}/auth/me`);
      const data = await handleResponse(response);

      console.log("Raw user data from backend:", data.user); // برای دیباگ

      // تضمین ساختار یکسان برای فرانت‌اند
      return {
        success: true,
        user: {
          id: data.user?.id,
          full_name: data.user?.full_name || data.user?.fullName,
          phone: data.user?.phone,
          email: data.user?.email,
          birth_date: data.user?.birth_date || data.user?.birthDate,
          gender: data.user?.gender,
          created_at: data.user?.created_at || data.user?.membershipDate,
          job: data.user?.job || "",
          medical_info: data.user?.medical_info || null,
        },
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در دریافت اطلاعات کاربر:", error);
      throw error;
    }
  },

  // خروج از حساب
  logout() {
    removeTokens();
    return Promise.resolve({
      success: true,
      message: "با موفقیت خارج شدید",
    });
  },

  // ==================== پروفایل کاربر ====================
  // آپدیت پروفایل کاربر
  async updateProfile(profileData) {
    try {
      // تبدیل نام فیلدها به فرمت مورد انتظار بک‌اند
      const formattedData = {
        full_name: profileData.full_name || profileData.fullName,
        phone: profileData.phone,
        email: profileData.email,
        birth_date: profileData.birth_date || profileData.birthDate,
        gender: profileData.gender,
        job: profileData.job || "",
        medical_info: profileData.medical_info || profileData.medicalInfo,
      };

      console.log("Sending update profile:", formattedData); // برای دیباگ

      const response = await fetchWithAuth(`${API_URL}/user/profile`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });

      const data = await handleResponse(response);

      return {
        success: true,
        user: data.user,
        message: data.message || "پروفایل با موفقیت به‌روزرسانی شد",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در ویرایش پروفایل:", error);
      throw error;
    }
  },

  // دریافت اطلاعات پزشکی
  async getMedicalInfo() {
    try {
      const response = await this.getCurrentUser();
      return {
        success: true,
        medicalInfo: response.user?.medical_info || {},
      };
    } catch (error) {
      console.error("خطا در دریافت اطلاعات پزشکی:", error);
      throw error;
    }
  },

  // ==================== خدمات (Services) ====================
  // دریافت همه خدمات
  async getAllServices() {
    try {
      const response = await fetch(`${API_URL}/services`, {
        headers: getHeaders(false),
      });
      const data = await handleResponse(response);

      console.log("📦 Services from backend:", data); // ✅ این لاگ رو اضافه کن

      return data.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration_minutes: service.duration_minutes,
        duration: `${service.duration_minutes} دقیقه`,
        category: service.category || "آرامش‌بخش",
        icon: service.icon || "FiUser",
      }));
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در دریافت خدمات:", error);
      throw error;
    }
  },

  // دریافت خدمت بر اساس ID
  async getServiceById(serviceId) {
    try {
      const response = await fetch(`${API_URL}/services/${serviceId}`, {
        headers: getHeaders(false),
      });
      const data = await handleResponse(response);

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        duration_minutes: data.duration_minutes,
        price: data.price,
        category: data.category,
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در دریافت خدمت:", error);
      throw error;
    }
  },

  // ==================== نوبت‌ها (Appointments) ====================
  // دریافت نوبت‌های کاربر
  async getAppointments() {
    try {
      const response = await fetchWithAuth(`${API_URL}/appointments`);
      const data = await handleResponse(response);

      // تضمین ساختار یکسان برای فرانت‌اند
      return {
        success: true,
        appointments:
          data.appointments?.map((apt) => ({
            id: apt.id,
            date: apt.date || apt.appointment_date,
            time: apt.time || apt.appointment_time,
            status: apt.status,
            notes: apt.notes || "",
            price: apt.price || 0,
            service: apt.service
              ? {
                  id: apt.service.id,
                  name: apt.service.name,
                  duration_minutes: apt.service.duration_minutes,
                  price: apt.service.price,
                  duration: apt.service.duration_minutes
                    ? `${apt.service.duration_minutes} دقیقه`
                    : "۶۰ دقیقه",
                }
              : null,
            rating: apt.rating,
            user_review: apt.user_review || apt.review,
            therapist_notes: apt.therapist_notes || "",
          })) || [],
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در دریافت نوبت‌ها:", error);
      throw error;
    }
  },

  // رزرو نوبت جدید
  async bookAppointment(appointmentData) {
    try {
      const formattedData = {
        service_id:
          appointmentData.service_id || appointmentData.selectedMassage?.id,
        appointment_date:
          appointmentData.appointment_date || appointmentData.selectedDate,
        appointment_time:
          appointmentData.appointment_time || appointmentData.selectedTime,
        notes: appointmentData.notes,
        price: appointmentData.price, // ✅ اضافه کردن price به داده‌های ارسالی
      };

      console.log("📤 Booking payload:", formattedData); // برای دیباگ

      const response = await fetchWithAuth(`${API_URL}/appointments`, {
        method: "POST",
        body: JSON.stringify(formattedData),
      });

      const data = await handleResponse(response);

      return {
        success: true,
        appointment: data.appointment,
        message: data.message || "نوبت با موفقیت رزرو شد",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در رزرو نوبت:", error);
      throw error;
    }
  },

  // در userService.jsx، بعد از bookAppointment اضافه کن:

  // آپدیت نوبت (تغییر زمان)
  async updateAppointment(appointmentId, updateData) {
    try {
      const formattedData = {
        appointment_date:
          updateData.appointment_date || updateData.selectedDate,
        appointment_time:
          updateData.appointment_time || updateData.selectedTime,
        notes: updateData.notes,
      };

      console.log("🔄 Updating appointment:", appointmentId, formattedData);

      const response = await fetchWithAuth(
        `${API_URL}/appointments/${appointmentId}`,
        {
          method: "PUT",
          body: JSON.stringify(formattedData),
        }
      );

      const data = await handleResponse(response);

      return {
        success: true,
        appointment: data.appointment,
        message: data.message || "نوبت با موفقیت به‌روزرسانی شد",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در آپدیت نوبت:", error);
      throw error;
    }
  },

  async cancelAppointment(appointmentId) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {
          method: "PUT",
        }
      );

      const data = await handleResponse(response);

      return {
        success: true,
        message: data.message || "نوبت با موفقیت لغو شد.",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در لغو نوبت:", error);
      throw error;
    }
  },

  // ثبت امتیاز و نظر برای نوبت
  async rateAppointment(appointmentId, rating, review) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/appointments/${appointmentId}/rate`,
        {
          method: "PUT",
          body: JSON.stringify({
            rating,
            review: review || "",
          }),
        }
      );

      const data = await handleResponse(response);

      return {
        success: true,
        message: data.message || "امتیاز و نظر با موفقیت ثبت شد",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در ثبت امتیاز:", error);
      throw error;
    }
  },

  // دریافت زمان‌های موجود برای رزرو - نسخه نهایی
  async getAvailableSlots(date = null) {
    try {
      let url = `${API_URL}/appointments/available-slots`;

      if (date) {
        url += `?date=${date}`;
      }

      console.log("Fetching available slots from:", url);

      // استفاده از fetchWithAuth که خودت تعریف کردی
      const response = await fetchWithAuth(url, {
        requireAuth: true, // نیاز به احراز هویت داره
      });

      // استفاده از handleResponse که خودت تعریف کردی
      const data = await handleResponse(response);

      console.log("Available slots data received:", data);

      // اگر API موفق نبوده
      if (!data.success) {
        throw new Error(data.error || "خطا در دریافت زمان‌های موجود");
      }

      // برگرداندن تمام اطلاعات
      return {
        success: true,
        available_dates: data.available_dates || [],
        available_slots: data.available_slots || [],
        all_slots: data.all_slots || [
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
        ], // fallback
        booked_slots: data.booked_slots || [],
      };
    } catch (error) {
      console.error("Error fetching available slots:", error);

      // در صورت خطا، داده‌های پیش‌فرض برگردون
      return {
        success: false,
        available_dates: [],
        available_slots: [],
        all_slots: [
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
        ],
        error: error.message,
      };
    }
  },

  // ==================== نظرات (Reviews) ====================
  async getAllReviews() {
    try {
      console.log("Fetching reviews from:", `${API_URL}/reviews`);
      const response = await fetch(`${API_URL}/reviews`, {
        headers: getHeaders(false),
      });

      // بررسی status code
      if (!response.ok) {
        console.error("HTTP error:", response.status);
        return []; // آرایه خالی برگردون
      }

      const data = await response.json();
      console.log("Raw reviews data:", data);

      // بررسی چند حالت مختلف
      if (Array.isArray(data)) {
        return data.map((review) => ({
          id: review.id,
          name: review.name || "مشتری",
          text: review.text || "بدون متن",
          avatar: review.avatar,
          rating: review.rating || 5,
        }));
      } else if (data && data.reviews && Array.isArray(data.reviews)) {
        // اگر فرمت {reviews: [...]} بود
        return data.reviews.map((review) => ({
          id: review.id,
          name: review.name || "مشتری",
          text: review.text || "بدون متن",
          avatar: review.avatar,
          rating: review.rating || 5,
        }));
      }

      console.warn("Unexpected reviews format:", data);
      return [];
    } catch (error) {
      console.error("خطا در دریافت نظرات:", error);
      return []; // به جای throw error، آرایه خالی برگردون
    }
  },

  // ارسال نظر جدید
  async submitReview(reviewData) {
    try {
      const response = await fetchWithAuth(`${API_URL}/reviews`, {
        method: "POST",
        body: JSON.stringify(reviewData),
      });

      const data = await handleResponse(response);

      return {
        success: true,
        review: data.review,
        message: data.message || "نظر با موفقیت ثبت شد",
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در ثبت نظر:", error);
      throw error;
    }
  },

  // تغییر رمز عبور (فراموشی رمز)
  async resetPassword(phone, newPassword, confirmPassword) {
    try {
      console.log("Calling reset password API with:", { phone });

      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({
          phone,
          newPassword,
          confirmPassword,
        }),
      });

      console.log("Response status:", response.status);

      const data = await handleResponse(response);

      console.log("Reset password successful:", data);

      return {
        success: true,
        message: data.message || "رمز عبور با موفقیت تغییر یافت",
      };
    } catch (error) {
      console.error("خطا در تغییر رمز:", error);
      throw error;
    }
  },

  // تغییر رمز عبور از طریق پروفایل
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await fetchWithAuth(`${API_URL}/user/change-password`, {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await handleResponse(response);

      return {
        success: true,
        message: data.message || "رمز عبور با موفقیت تغییر یافت",
      };
    } catch (error) {
      console.error("خطا در تغییر رمز:", error);
      throw error;
    }
  },

  // ==================== Utility Functions ====================
  // بررسی اینکه کاربر لاگین کرده یا نه
  isAuthenticated() {
    return !!getToken();
  },

  // دریافت توکن
  getAuthToken() {
    return getToken();
  },

  // پاک کردن همه داده‌های کاربر
  clearUserData() {
    removeTokens();
  },

  // بررسی وضعیت اتصال
  async checkConnection() {
    try {
      const response = await fetch(`${API_URL}/health`, {
        headers: getHeaders(false),
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// frontend/src/services/userService.jsx
// در انتهای فایل، قبل از export default، این بخش رو اضافه کن:

// ==================== ADMIN SERVICES (همان ماساژتراپیست) ====================
export const adminService = {
  // دریافت آمار داشبورد
  async getStats() {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/stats`);
      const data = await handleResponse(response);
      return data.stats;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  // دریافت لیست کاربران
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetchWithAuth(
        `${API_URL}/admin/users?${queryParams}`
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // آپدیت کاربر (تغییر نقش، فعال/غیرفعال)
  async updateUser(userId, userData) {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // دریافت لیست نوبت‌ها
  async getAppointments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetchWithAuth(
        `${API_URL}/admin/appointments?${queryParams}`
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  // تغییر وضعیت نوبت
  async updateAppointmentStatus(appointmentId, status, therapist_notes = null) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status, therapist_notes }),
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },

  // دریافت لیست خدمات
  async getServices() {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/services`);
      const data = await handleResponse(response);
      return data.services;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching services:", error);
      throw error;
    }
  },

  // ایجاد سرویس جدید
  async createService(serviceData) {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/services`, {
        method: "POST",
        body: JSON.stringify(serviceData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error creating service:", error);
      throw error;
    }
  },

  // آپدیت سرویس
  async updateService(serviceId, serviceData) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/services/${serviceId}`,
        {
          method: "PUT",
          body: JSON.stringify(serviceData),
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error updating service:", error);
      throw error;
    }
  },

  // حذف سرویس
  async deleteService(serviceId) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/services/${serviceId}`,
        {
          method: "DELETE",
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error deleting service:", error);
      throw error;
    }
  },

  // دریافت نظرات
  async getReviews(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetchWithAuth(
        `${API_URL}/admin/reviews?${queryParams}`
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  // تایید/رد نظر
  async approveReview(reviewId, is_approved) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/reviews/${reviewId}/approve`,
        {
          method: "PUT",
          body: JSON.stringify({ is_approved }),
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error approving review:", error);
      throw error;
    }
  },

  // ============ کارهای ماساژتراپیست ============

  // دریافت لیست مراجعین
  async getClients() {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/clients`);
      const data = await handleResponse(response);
      return data.clients;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  // دریافت جزئیات یک مشتری
  async getClientDetails(clientId) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/clients/${clientId}`
      );
      const data = await handleResponse(response);
      return data.client;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching client details:", error);
      throw error;
    }
  },

  // دریافت نوبت‌های تقویم
  async getCalendar(start_date = null, end_date = null) {
    try {
      let url = `${API_URL}/admin/calendar`;
      const params = [];
      if (start_date) params.push(`start_date=${start_date}`);
      if (end_date) params.push(`end_date=${end_date}`);
      if (params.length) url += `?${params.join("&")}`;

      const response = await fetchWithAuth(url);
      const data = await handleResponse(response);
      return data.appointments;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching calendar:", error);
      throw error;
    }
  },

  // ثبت نظر تراپیست برای نوبت
  async addTherapistNotes(appointmentId, therapist_notes) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/appointments/${appointmentId}/notes`,
        {
          method: "PUT",
          body: JSON.stringify({ therapist_notes }),
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error adding therapist notes:", error);
      throw error;
    }
  },

  // حذف نوبت توسط ادمین (با ارسال نوتیفیکیشن)
  async cancelAppointmentByAdmin(appointmentId) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/admin/appointments/${appointmentId}`,
        {
          method: "DELETE",
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error cancelling appointment:", error);
      throw error;
    }
  },

  // دریافت آمار overview
  async getOverview() {
    try {
      const response = await fetchWithAuth(`${API_URL}/admin/overview`);
      const data = await handleResponse(response);
      return data.overview;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching overview:", error);
      throw error;
    }
  },
};

// ==================== NOTIFICATION SERVICES ====================
export const notificationService = {
  // دریافت لیست نوتیفیکیشن‌ها
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        unread_only: unreadOnly,
      }).toString();
      const response = await fetchWithAuth(
        `${API_URL}/notifications?${queryParams}`
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // علامت زدن یک نوتیفیکیشن به عنوان خوانده شده
  async markAsRead(notificationId) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // علامت زدن همه نوتیفیکیشن‌ها به عنوان خوانده شده
  async markAllAsRead() {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/notifications/read-all`,
        {
          method: "PUT",
        }
      );
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  // دریافت تعداد نوتیفیکیشن‌های خوانده نشده
  async getUnreadCount() {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/notifications?unread_only=true&limit=1`
      );
      const data = await handleResponse(response);
      return data.unread_count || 0;
    } catch (error) {
      handleNetworkError(error);
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },
};

export default {
  ...userService,
  admin: adminService,
  notifications: notificationService,
};

// export default userService;
