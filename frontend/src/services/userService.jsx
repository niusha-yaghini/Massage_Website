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

  // اگر توکن منقضی شده، می‌توانید اینجا رفرش کنید (اختیاری)
  // if (response.status === 401 && getRefreshToken()) {
  //   await refreshAuthToken();
  //   return fetchWithAuth(url, options);
  // }

  return response;
};

// ==================== سرویس اصلی ====================
export const userService = {
  // async register(userData) {
  //   try {
  //     console.log("Registering user with data:", userData);
  //     const response = await fetch(`${API_URL}/auth/register`, {
  //       method: "POST",
  //       headers: getHeaders(false),
  //       body: JSON.stringify(userData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.error || errorData.message || "خطا در ثبت‌نام"
  //       );
  //     }

  //     const data = await response.json();

  //     if (data.token) {
  //       setToken(data.token);
  //     }
  //     if (data.refresh_token) {
  //       setRefreshToken(data.refresh_token);
  //     }

  //     return {
  //       success: true,
  //       user: data.user,
  //       message: data.message || "ثبت‌نام با موفقیت انجام شد",
  //     };
  //   } catch (error) {
  //     console.error("خطا در ثبت‌نام:", error);
  //     if (error.message.includes("Failed to fetch")) {
  //       throw new Error(
  //         "خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید."
  //       );
  //     }
  //     throw error;
  //   }
  // },

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
      // فرمت‌دهی داده‌ها برای بک‌اند
      const formattedData = {
        service_id:
          appointmentData.service_id || appointmentData.selectedMassage?.id,
        appointment_date:
          appointmentData.appointment_date || appointmentData.selectedDate,
        appointment_time:
          appointmentData.appointment_time || appointmentData.selectedTime,
        notes: appointmentData.notes,
      };

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

  // لغو نوبت
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
        message: data.message || "نوبت با موفقیت لغو شد",
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

  // دریافت زمان‌های موجود برای رزرو
  async getAvailableSlots(date = null) {
    try {
      const url = date
        ? `${API_URL}/appointments/available-slots?date=${date}`
        : `${API_URL}/appointments/available-slots`;

      const response = await fetchWithAuth(url);
      const data = await handleResponse(response);

      return {
        success: true,
        available_dates: data.available_dates || [],
        available_slots: data.available_slots || [],
      };
    } catch (error) {
      handleNetworkError(error);
      console.error("خطا در دریافت زمان‌های موجود:", error);
      throw error;
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

export default userService;
