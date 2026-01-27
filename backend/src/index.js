const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import دیتابیس و مدل‌ها
const { sequelize, testConnection } = require("./config/database");
const { User, Service, Appointment, Review } = require("./models");

const app = express();

// تابع ساخت JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    { expiresIn: "7d" }
  );
};

// ============ Middlewareها ============
const authMiddleware = (req, res, next) => {
  try {
    // دریافت token از header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "دسترسی غیرمجاز. لطفاً وارد شوید.",
      });
    }

    const token = authHeader.split(" ")[1];

    // verify کردن token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

    // ذخیره user id در request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "توکن منقضی شده. لطفاً مجدداً وارد شوید.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "توکن نامعتبر است.",
    });
  }
};

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// تست اتصال دیتابیس
testConnection();

// Routes موقت برای تست
app.get("/api/test", (req, res) => {
  res.json({
    message: "backend works with MySQL! 🎉",
    time: new Date().toLocaleTimeString("fa-IR"),
  });
});

// ============ Routes موقت (تا routes جدید رو بسازیم) ============
app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "duration_minutes",
        "price",
        "category",
        "icon",
      ],
    });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "خطا در دریافت خدمات" });
  }
});

app.get("/api/services/:id", async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ error: "Service not found" });
    }
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: "خطا در دریافت خدمت" });
  }
});

// دریافت نظرات از دیتابیس
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { is_approved: true },
      limit: 10,
      attributes: ["id", "name", "text", "avatar", "rating", "created_at"],
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "خطا در دریافت نظرات" });
  }
});

// احراز هویت - ورود
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({
      where: {
        phone,
        is_active: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "شماره تماس یا رمز عبور اشتباه است.",
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "شماره تماس یا رمز عبور اشتباه است.",
      });
    }

    // ساخت JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "ورود موفقیت‌آمیز بود.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        birth_date: user.birth_date,
        gender: user.gender,
        job: user.job,
        medical_info: user.medical_info,
        role: user.role,
        // membership_level: user.membership_level,
        // points: user.points,
        is_verified: user.is_verified,
      },
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در سرور",
    });
  }
});

// احراز هویت - ثبت‌نام
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      birth_date,
      gender,
      medical_info,
    } = req.body;

    console.log("Register request received:", req.body); // برای دیباگ

    // بررسی وجود کاربر با شماره تلفن
    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "این شماره تماس قبلاً ثبت شده است.",
      });
    }

    // اگر ایمیل ارسال شده، چک کن تکراری نباشه
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: "این ایمیل قبلاً ثبت شده است.",
        });
      }
    }

    // پردازش medical_info
    let processedMedicalInfo = null;
    if (medical_info) {
      try {
        // اگر medical_info string هست (JSON.stringify شده)، parse کن
        if (typeof medical_info === "string") {
          processedMedicalInfo = JSON.parse(medical_info);
        } else {
          processedMedicalInfo = medical_info;
        }
      } catch (parseError) {
        console.error("Error parsing medical_info:", parseError);
        processedMedicalInfo = {
          conditions: [],
          allergies: "ندارد",
          notes: "",
        };
      }
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      full_name,
      email: email || null,
      phone,
      password,
      birth_date: birth_date || null,
      gender: gender || null,
      medical_info: processedMedicalInfo, // استفاده از processed version
      // membership_date: new Date(),
      created_at: new Date(),
      // membership_level: "regular",
      // points: 0,
      is_verified: false,
    });

    // ساخت JWT token
    const token = generateToken(user.id);

    const userResponse = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      medical_info: user.medical_info,
      role: user.role,
      // membership_level: user.membership_level,
      // points: user.points,
    };

    console.log("User created successfully:", userResponse); // برای دیباگ

    res.status(201).json({
      success: true,
      message: "ثبت‌نام موفقیت‌آمیز بود.",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    console.error("Register error details:", error);
    res.status(500).json({
      success: false,
      error: "خطا در ثبت‌نام: " + error.message,
    });
  }
});

// ============ فراموشی رمز عبور ============
// تغییر رمز عبور (بدون نیاز به لاگین)
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;

    console.log("Reset password request:", { phone }); // برای دیباگ

    // اعتبارسنجی داده‌ها
    if (!phone || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "لطفاً همه فیلدها را پر کنید.",
      });
    }

    // بررسی مطابقت رمزها
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "رمز عبور و تأیید آن یکسان نیستند.",
      });
    }

    // بررسی طول رمز
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
      });
    }

    // پیدا کردن کاربر (فقط کاربران active)
    const user = await User.findOne({
      where: {
        phone,
        is_active: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربری با این شماره تلفن یافت نشد.",
      });
    }

    console.log("User found for password reset:", user.id); // برای دیباگ

    // تغییر رمز عبور
    user.password = newPassword;
    await user.save();

    console.log("Password reset successful for user:", user.id); // برای دیباگ

    res.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در تغییر رمز عبور: " + error.message,
    });
  }
});

// ============ Routes جدید ============
// دریافت اطلاعات کاربر جاری
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: [
        "id",
        "full_name",
        "email",
        "phone",
        "birth_date",
        "gender",
        "job",
        "medical_info",
        "role",
        "is_verified",
        "created_at",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربر پیدا نشد.",
      });
    }

    // تبدیل medical_info از string به object
    let medicalInfo = {};
    if (user.medical_info) {
      try {
        medicalInfo =
          typeof user.medical_info === "string"
            ? JSON.parse(user.medical_info)
            : user.medical_info;
      } catch (error) {
        console.error("Error parsing medical_info:", error);
        medicalInfo = {};
      }
    }

    // محاسبه آمار کاربر
    const upcomingAppointments = await Appointment.count({
      where: {
        user_id: req.userId,
        status: ["pending", "confirmed"],
      },
    });

    const pastAppointments = await Appointment.count({
      where: {
        user_id: req.userId,
        status: "completed",
      },
    });

    const userStats = {
      upcoming_appointments: upcomingAppointments,
      past_appointments: pastAppointments,
      total_appointments: upcomingAppointments + pastAppointments,
      membership_days: Math.floor(
        (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
      ),
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        birth_date: user.birth_date,
        gender: user.gender,
        job: user.job,
        medical_info: medicalInfo,
        created_at: user.created_at,
        role: user.role,
        is_verified: user.is_verified,
        stats: userStats,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات کاربر",
    });
  }
});

// ============ Appointment Routes ============
app.get("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration_minutes", "price", "category"],
        },
      ],
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
    });

    // تبدیل به فرمت مناسب برای فرانت
    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      appointment_code: apt.appointment_code,
      date: apt.appointment_date,
      time: apt.appointment_time,
      status: apt.status,
      status_text: apt.getStatusText(),
      notes: apt.notes,
      therapist_notes: apt.therapist_notes,
      rating: apt.rating,
      user_review: apt.user_review,
      service: apt.service
        ? {
            id: apt.service.id,
            name: apt.service.name,
            duration: `${apt.service.duration_minutes} دقیقه`,
            price:
              new Intl.NumberFormat("fa-IR").format(apt.service.price) +
              " تومان",
            category: apt.service.category,
          }
        : null,
      created_at: apt.created_at,
    }));

    res.json({
      success: true,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت نوبت‌ها",
    });
  }
});

// رزرو نوبت جدید
app.post("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const { service_id, appointment_date, appointment_time, notes } = req.body;

    // بررسی وجود سرویس
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "سرویس مورد نظر یافت نشد",
      });
    }

    // بررسی اینکه آیا نوبت برای این زمان قبلاً رزرو شده
    const existingAppointment = await Appointment.findOne({
      where: {
        appointment_date,
        appointment_time,
        status: ["pending", "confirmed"],
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: "این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.",
      });
    }

    // ایجاد نوبت جدید
    const appointment = await Appointment.create({
      user_id: req.userId,
      service_id,
      appointment_date,
      appointment_time,
      notes: notes || "",
      status: "pending",
    });

    // گرفتن اطلاعات کامل نوبت
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration_minutes", "price", "category"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "نوبت با موفقیت رزرو شد.",
      appointment: {
        id: fullAppointment.id,
        appointment_code: fullAppointment.appointment_code,
        date: fullAppointment.appointment_date,
        time: fullAppointment.appointment_time,
        status: fullAppointment.status,
        status_text: fullAppointment.getStatusText(),
        service: {
          id: fullAppointment.service.id,
          name: fullAppointment.service.name,
          duration: `${fullAppointment.service.duration_minutes} دقیقه`,
          price:
            new Intl.NumberFormat("fa-IR").format(
              fullAppointment.service.price
            ) + " تومان",
        },
      },
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در رزرو نوبت",
    });
  }
});

// لغو نوبت
app.put("/api/appointments/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "نوبت مورد نظر یافت نشد.",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: "این نوبت قبلاً لغو شده است.",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "نوبت‌های انجام شده قابل لغو نیستند.",
      });
    }

    // لغو نوبت
    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "نوبت با موفقیت لغو شد.",
      appointment: {
        id: appointment.id,
        status: appointment.status,
        status_text: appointment.getStatusText(),
      },
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در لغو نوبت",
    });
  }
});

// ثبت امتیاز و نظر برای نوبت
app.put("/api/appointments/:id/rate", authMiddleware, async (req, res) => {
  try {
    const { rating, review } = req.body;

    // بررسی محدوده امتیاز
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "امتیاز باید بین ۱ تا ۵ باشد.",
      });
    }

    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
        status: "completed", // فقط برای نوبت‌های انجام شده
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "نوبت مورد نظر یافت نشد یا قابل امتیازدهی نیست.",
      });
    }

    // بررسی اینکه آیا قبلاً امتیاز داده شده
    if (appointment.rating) {
      return res.status(400).json({
        success: false,
        error: "شما قبلاً برای این نوبت امتیاز داده‌اید.",
      });
    }

    // ثبت امتیاز و نظر
    appointment.rating = rating;
    appointment.user_review = review || "";
    await appointment.save();

    // همچنین یک رکورد در جدول reviews برای نمایش عمومی ایجاد کن
    const user = await User.findByPk(req.userId);
    await Review.create({
      user_id: req.userId,
      name: user.full_name,
      text: review || "تجربه خوبی بود..",
      rating: rating,
      is_approved: false, // نیاز به تایید ادمین
      service_id: appointment.service_id,
      appointment_id: appointment.id,
    });

    res.json({
      success: true,
      message: "امتیاز و نظر شما با موفقیت ثبت شد.",
      appointment: {
        id: appointment.id,
        rating: appointment.rating,
        user_review: appointment.user_review,
      },
    });
  } catch (error) {
    console.error("Rate appointment error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در ثبت امتیاز",
    });
  }
});

// دریافت آمار نوبت‌های کاربر
app.get("/api/user/stats", authMiddleware, async (req, res) => {
  try {
    const stats = {
      upcoming: await Appointment.count({
        where: {
          user_id: req.userId,
          status: ["pending", "confirmed"],
        },
      }),
      past: await Appointment.count({
        where: {
          user_id: req.userId,
          status: "completed",
        },
      }),
      cancelled: await Appointment.count({
        where: {
          user_id: req.userId,
          status: "cancelled",
        },
      }),
      total: await Appointment.count({
        where: { user_id: req.userId },
      }),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت آمار",
    });
  }
});

// دریافت تاریخ‌ها و ساعت‌های موجود برای رزرو
app.get(
  "/api/appointments/available-slots",
  authMiddleware,
  async (req, res) => {
    try {
      const { date } = req.query;

      // اگر تاریخ مشخص شده، ساعت‌های اون تاریخ رو برگردون
      if (date) {
        // ساعت‌های کاری کلینیک
        const allSlots = [
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

        // نوبت‌های رزرو شده برای این تاریخ
        const bookedAppointments = await Appointment.findAll({
          where: {
            appointment_date: date,
            status: ["pending", "confirmed"],
          },
          attributes: ["appointment_time"],
        });

        const bookedTimes = bookedAppointments.map(
          (apt) => apt.appointment_time
        );

        // فیلتر کردن ساعت‌های available
        const availableSlots = allSlots.filter(
          (slot) => !bookedTimes.includes(slot)
        );

        return res.json({
          success: true,
          date,
          available_slots: availableSlots,
          all_slots: allSlots,
          booked_slots: bookedTimes,
        });
      }

      // اگر تاریخ مشخص نشده، تاریخ‌های available برگردون (۷ روز آینده)
      const today = new Date();
      const availableDates = [];

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // فقط روزهای غیرجمعه (می‌تونی تغییر بدی)
        if (date.getDay() !== 5) {
          // 5 = جمعه
          const dateStr = date.toISOString().split("T")[0];

          // تعداد نوبت‌های این تاریخ
          const appointmentCount = await Appointment.count({
            where: {
              appointment_date: dateStr,
              status: ["pending", "confirmed"],
            },
          });

          // اگر کمتر از ۱۱ نوبت باشه (تعداد کل slots)، تاریخ available هست
          if (appointmentCount < 11) {
            availableDates.push({
              date: dateStr,
              display: date.toLocaleDateString("fa-IR", {
                weekday: "long",
                month: "long",
                day: "numeric",
              }),
              dayName: date.toLocaleDateString("fa-IR", { weekday: "long" }),
              available_slots: 11 - appointmentCount,
            });
          }
        }
      }

      res.json({
        success: true,
        available_dates: availableDates,
      });
    } catch (error) {
      console.error("Get available slots error:", error);
      res.status(500).json({
        success: false,
        error: "خطا در دریافت زمان‌های موجود",
      });
    }
  }
);

// آپدیت پروفایل کاربر
app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, email, birth_date, gender, job, medical_info } =
      req.body;

    console.log("Update profile request:", {
      full_name,
      phone,
      email,
      birth_date,
      gender,
      job,
      medical_info,
    }); // برای دیباگ

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربر پیدا نشد.",
      });
    }

    // آپدیت فیلدها
    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (birth_date !== undefined) user.birth_date = birth_date;
    if (gender !== undefined) user.gender = gender;
    if (job !== undefined) user.job = job;

    // اضافه کردن medical_info
    if (medical_info !== undefined) {
      let processedMedicalInfo = medical_info;

      // اگر medical_info object هست، JSON.stringify کن
      if (medical_info && typeof medical_info === "object") {
        try {
          processedMedicalInfo = JSON.stringify(medical_info);
        } catch (stringifyError) {
          console.error("Error stringifying medical_info:", stringifyError);
          processedMedicalInfo = "{}";
        }
      }

      user.medical_info = processedMedicalInfo;
    }

    await user.save();

    // برای response، medical_info رو parse کن
    let medicalInfoForResponse = user.medical_info;
    if (medicalInfoForResponse && typeof medicalInfoForResponse === "string") {
      try {
        medicalInfoForResponse = JSON.parse(medicalInfoForResponse);
      } catch (parseError) {
        console.error("Error parsing medical_info for response:", parseError);
        medicalInfoForResponse = {};
      }
    }

    res.json({
      success: true,
      message: "پروفایل با موفقیت به‌روزرسانی شد.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        birth_date: user.birth_date,
        gender: user.gender,
        job: user.job,

        medical_info: medicalInfoForResponse,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در به‌روزرسانی پروفایل: " + error.message,
    });
  }
});

// تغییر رمز عبور از طریق پروفایل (برای کاربر لاگین کرده)
app.put("/api/user/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // اعتبارسنجی داده‌ها
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "لطفاً همه فیلدها را پر کنید.",
      });
    }

    // بررسی مطابقت رمزها
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "رمز عبور جدید و تأیید آن یکسان نیستند.",
      });
    }

    // پیدا کردن کاربر
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربر پیدا نشد.",
      });
    }

    // بررسی رمز عبور فعلی
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "رمز عبور فعلی اشتباه است.",
      });
    }

    // تغییر رمز عبور
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر یافت.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در تغییر رمز عبور",
    });
  }
});

// ============ سرور ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync دیتابیس
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");

    // شروع سرور
    app.listen(PORT, () => {
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`📡 Available APIs:`);
      console.log(`   GET  /api/test`);
      console.log(`   GET  /api/services`);
      console.log(`   GET  /api/reviews`);
      console.log(`   POST /api/auth/login`);
      console.log(`   POST /api/auth/register`);
      console.log(`   GET  /api/auth/me (protected)`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
