const API_URL = "http://localhost:5000/api";

// Utility function برای هندل کردن errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "خطا در ارتباط با سرور");
  }
  return response.json();
};

// ذخیره توکن در localStorage
const setToken = (token) => {
  localStorage.setItem("spa_token", token);
};

// دریافت توکن از localStorage
const getToken = () => {
  return localStorage.getItem("spa_token");
};

// حذف توکن (برای logout)
const removeToken = () => {
  localStorage.removeItem("spa_token");
};

export const userService = {
  // ==================== ثبت‌نام کاربر جدید - احراز هویت ====================
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await handleResponse(response);

      if (data.token) {
        setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error("خطا در ثبت‌نام:", error);
      throw error;
    }
  },

  // ورود کاربر با شماره تماس
  async loginWithPhone(phone, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ phone, password }), // phone به جای email
      });

      const data = await response.json();
      console.log("پاسخ API:", data);

      if (response.ok) {
        if (data.token) {
          setToken(data.token);
        }
        return data;
      } else {
        throw new Error(data.error || "خطا در ورود");
      }
    } catch (error) {
      console.error("خطا در ورود:", error);
      throw error;
    }
  },

  // دریافت اطلاعات کاربر جاری
  async getCurrentUser() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات کاربر:", error);
      throw error;
    }
  },

  // خروج از حساب
  logout() {
    removeToken();
    // همچنین می‌توانید API logout را هم صدا بزنید
    return Promise.resolve({ success: true, message: "با موفقیت خارج شدید" });
  },

  // ==================== پروفایل کاربر ====================
  async updateProfile(profileData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در ویرایش پروفایل:", error);
      throw error;
    }
  },

  // دریافت اطلاعات پزشکی
  async getMedicalInfo() {
    try {
      const user = await this.getCurrentUser();
      return user.medicalInfo || {};
    } catch (error) {
      console.error("خطا در دریافت اطلاعات پزشکی:", error);
      throw error;
    }
  },

  // ==================== خدمات (Services) ====================
  async getAllServices() {
    try {
      const response = await fetch(`${API_URL}/services`);
      return handleResponse(response);
    } catch (error) {
      console.error("خطا در دریافت خدمات:", error);
      throw error;
    }
  },

  // دریافت خدمت بر اساس ID
  async getServiceById(serviceId) {
    try {
      const response = await fetch(`${API_URL}/services/${serviceId}`);
      return handleResponse(response);
    } catch (error) {
      console.error("خطا در دریافت خدمت:", error);
      throw error;
    }
  },

  // ==================== نوبت‌ها (Appointments) ====================
  async getAppointments() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در دریافت نوبت‌ها:", error);
      throw error;
    }
  },

  // رزرو نوبت جدید
  async bookAppointment(appointmentData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در رزرو نوبت:", error);
      throw error;
    }
  },

  // لغو نوبت
  async cancelAppointment(appointmentId) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در لغو نوبت:", error);
      throw error;
    }
  },

  // ثبت امتیاز و نظر برای نوبت
  async rateAppointment(appointmentId, rating, review) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/rate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, review }),
        }
      );

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در ثبت امتیاز:", error);
      throw error;
    }
  },

  // ==================== نظرات (Reviews) ====================
  async getAllReviews() {
    try {
      const response = await fetch(`${API_URL}/reviews`);
      return handleResponse(response);
    } catch (error) {
      console.error("خطا در دریافت نظرات:", error);
      throw error;
    }
  },

  // ارسال نظر جدید
  async submitReview(reviewData) {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("توکن احراز هویت یافت نشد");
      }

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error("خطا در ثبت نظر:", error);
      throw error;
    }
  },

  // ==================== Utility Functions ====================
  // بررسی اینکه کاربر لاگین کرده یا نه
  isAuthenticated() {
    return !!getToken();
  },

  // دریافت توکن (برای استفاده در سایر درخواست‌ها)
  getAuthToken() {
    return getToken();
  },

  // پاک کردن همه داده‌های کاربر
  clearUserData() {
    removeToken();
    // می‌توانید دیگر داده‌ها را هم پاک کنید
  },
};

// یک instance از سرویس export می‌کنیم
export default userService;
