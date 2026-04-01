const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import دیتابیس و مدل‌ها
const { sequelize, testConnection } = require("./config/database");
const {
  User,
  Service,
  Appointment,
  Review,
  Notification,
} = require("./models");
const { Op } = require("sequelize");

// process.env.TZ = "Asia/Tehran";

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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "دسترسی غیرمجاز. لطفاً وارد شوید.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );

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

const updatePastAppointments = async () => {
  console.log("🔄 ===== updatePastAppointments START ===== 🔄");

  try {
    // استفاده از تاریخ ایران
    const iranDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
    );
    iranDate.setHours(0, 0, 0, 0);
    const year = iranDate.getFullYear();
    const month = String(iranDate.getMonth() + 1).padStart(2, "0");
    const day = String(iranDate.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    console.log(`📅 Today date (Iran): ${todayStr}`);

    // پیدا کردن نوبت‌های در انتظار که تاریخ آنها گذشته است
    const pastPendingAppointments = await Appointment.findAll({
      where: {
        status: "pending",
        appointment_date: {
          [Op.lt]: todayStr,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name"],
        },
      ],
    });

    console.log(
      `📊 Found ${pastPendingAppointments.length} past pending appointments`
    );

    if (pastPendingAppointments.length > 0) {
      for (const appointment of pastPendingAppointments) {
        console.log(`🔄 Updating appointment ${appointment.id}...`);

        // تغییر وضعیت به expired
        await appointment.update({ status: "expired" });
        console.log(`✅ Appointment ${appointment.id} updated to expired`);

        // ============ ارسال نوتیفیکیشن به مشتری ============
        if (appointment.user_id) {
          await Notification.create({
            user_id: appointment.user_id,
            title: "انقضای زمان نوبت",
            message: `نوبت شما در تاریخ ${appointment.appointment_date} ساعت ${appointment.appointment_time} به دلیل عدم تأیید به موقع منقضی شد.`,
            type: "appointment_cancelled",
            related_id: appointment.id,
          });
          console.log(
            `📧 Notification sent to customer (user ${appointment.user_id})`
          );
        }

        // ============ ارسال نوتیفیکیشن به ادمین (ماساژور) ============
        const adminUsers = await User.findAll({
          where: { role: "admin" },
          attributes: ["id"],
        });

        for (const admin of adminUsers) {
          await Notification.create({
            user_id: admin.id,
            title: "نوبت منقضی شد",
            message: `نوبت مشتری ${
              appointment.user?.full_name || "نامشخص"
            } در تاریخ ${appointment.appointment_date} ساعت ${
              appointment.appointment_time
            } به دلیل عدم تأیید منقضی شد.`,
            type: "appointment_cancelled",
            related_id: appointment.id,
          });
        }
        if (adminUsers.length > 0) {
          console.log(`📧 Notification sent to ${adminUsers.length} admin(s)`);
        }
      }
    } else {
      console.log("✅ No past pending appointments found");
    }

    console.log("🔄 ===== updatePastAppointments END ===== 🔄");
    return pastPendingAppointments.length;
  } catch (error) {
    console.error("❌ Error updating past appointments:", error);
    return 0;
  }
};

// تابع برای بررسی نوبت‌های انجام نشده که تاریخ آنها گذشته است
const checkUncompletedAppointments = async () => {
  console.log("🔄 ===== checkUncompletedAppointments START ===== 🔄");

  try {
    // استفاده از تاریخ ایران
    const iranDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
    );
    iranDate.setHours(0, 0, 0, 0);
    const year = iranDate.getFullYear();
    const month = String(iranDate.getMonth() + 1).padStart(2, "0");
    const day = String(iranDate.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    console.log(`📅 Today date (Iran): ${todayStr}`);

    // پیدا کردن نوبت‌های تأیید شده که تاریخ آنها گذشته است
    const pastConfirmedAppointments = await Appointment.findAll({
      where: {
        status: "confirmed",
        appointment_date: {
          [Op.lt]: todayStr,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["name", "duration_minutes", "price"],
        },
      ],
    });

    console.log(
      `📊 Found ${pastConfirmedAppointments.length} past confirmed appointments`
    );

    if (pastConfirmedAppointments.length > 0) {
      for (const appointment of pastConfirmedAppointments) {
        console.log(
          `⚠️ Appointment ${appointment.id} (${appointment.appointment_date}) is past due but still confirmed`
        );

        // ارسال نوتیفیکیشن به ادمین (ماساژور)
        const adminUsers = await User.findAll({
          where: { role: "admin" },
          attributes: ["id"],
        });

        for (const admin of adminUsers) {
          await Notification.create({
            user_id: admin.id,
            title: "⚠️ نوبت انجام نشده",
            message: `نوبت مشتری ${appointment.user.full_name} در تاریخ ${appointment.appointment_date} ساعت ${appointment.appointment_time} (${appointment.service.name}) انجام نشده است. لطفاً وضعیت را بررسی کنید.`,
            type: "appointment_reminder",
            related_id: appointment.id,
          });
        }

        // ارسال نوتیفیکیشن به مشتری
        await Notification.create({
          user_id: appointment.user_id,
          title: "یادآوری نوبت انجام نشده",
          message: `نوبت شما در تاریخ ${appointment.appointment_date} ساعت ${appointment.appointment_time} (${appointment.service.name}) انجام نشده است. در صورت نیاز با کلینیک تماس بگیرید.`,
          type: "appointment_reminder",
          related_id: appointment.id,
        });

        console.log(
          `📧 Reminder notifications sent for appointment ${appointment.id}`
        );
      }
    } else {
      console.log("✅ No past confirmed appointments found");
    }

    console.log("🔄 ===== checkUncompletedAppointments END ===== 🔄");
    return pastConfirmedAppointments.length;
  } catch (error) {
    console.error("❌ Error checking uncompleted appointments:", error);
    return 0;
  }
};

// تابع برای بررسی نوبت‌های انجام نشده که تاریخ آنها گذشته است
// const checkUncompletedAppointments = async () => {
//   console.log("🔄 ===== checkUncompletedAppointments START ===== 🔄");

//   try {
//     // استفاده از تاریخ ایران
//     const iranDate = new Date(
//       new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })
//     );
//     iranDate.setHours(0, 0, 0, 0);
//     const year = iranDate.getFullYear();
//     const month = String(iranDate.getMonth() + 1).padStart(2, "0");
//     const day = String(iranDate.getDate()).padStart(2, "0");
//     const todayStr = `${year}-${month}-${day}`;

//     console.log(`📅 Today date (Iran): ${todayStr}`);

//     // پیدا کردن نوبت‌های تأیید شده که تاریخ آنها گذشته است
//     const pastConfirmedAppointments = await Appointment.findAll({
//       where: {
//         status: "confirmed",
//         appointment_date: {
//           [Op.lt]: todayStr, // تاریخ کمتر از امروز
//         },
//       },
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "full_name", "phone"],
//         },
//         {
//           model: Service,
//           as: "service",
//           attributes: ["name", "duration_minutes", "price"],
//         },
//       ],
//     });

//     console.log(
//       `📊 Found ${pastConfirmedAppointments.length} past confirmed appointments`
//     );

//     if (pastConfirmedAppointments.length > 0) {
//       for (const appointment of pastConfirmedAppointments) {
//         console.log(
//           `⚠️ Appointment ${appointment.id} (${appointment.appointment_date}) is past due but still confirmed`
//         );

//         // ارسال نوتیفیکیشن به ادمین (ماساژور)
//         const adminUsers = await User.findAll({
//           where: { role: "admin" },
//           attributes: ["id"],
//         });

//         for (const admin of adminUsers) {
//           await Notification.create({
//             user_id: admin.id,
//             title: "⚠️ نوبت انجام نشده",
//             message: `نوبت مشتری ${appointment.user.full_name} در تاریخ ${appointment.appointment_date} ساعت ${appointment.appointment_time} (${appointment.service.name}) انجام نشده است. لطفاً وضعیت را بررسی کنید.`,
//             type: "appointment_reminder",
//             related_id: appointment.id,
//           });
//         }

//         // ارسال نوتیفیکیشن به مشتری
//         await Notification.create({
//           user_id: appointment.user_id,
//           title: "یادآوری نوبت انجام نشده",
//           message: `نوبت شما در تاریخ ${appointment.appointment_date} ساعت ${appointment.appointment_time} (${appointment.service.name}) انجام نشده است. در صورت نیاز با کلینیک تماس بگیرید.`,
//           type: "appointment_reminder",
//           related_id: appointment.id,
//         });

//         console.log(
//           `📧 Reminder notifications sent for appointment ${appointment.id}`
//         );
//       }
//     } else {
//       console.log("✅ No past confirmed appointments found");
//     }

//     console.log("🔄 ===== checkUncompletedAppointments END ===== 🔄");
//     return pastConfirmedAppointments.length;
//   } catch (error) {
//     console.error("❌ Error checking uncompleted appointments:", error);
//     return 0;
//   }
// };

// Middleware برای بررسی نقش ادمین
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, async () => {
    try {
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "کاربر پیدا نشد.",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "دسترسی غیرمجاز. فقط مدیران سیستم می‌توانند از این بخش استفاده کنند.",
        });
      }

      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({
        success: false,
        error: "خطا در بررسی دسترسی ادمین",
      });
    }
  });
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

// ============ Routes عمومی ============

app.get("/api/test", (req, res) => {
  res.json({
    message: "backend works with MySQL! 🎉",
    time: new Date().toLocaleTimeString("fa-IR"),
  });
});

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

// ============ Routes احراز هویت ============

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

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: "این ایمیل قبلاً ثبت شده است.",
        });
      }
    }

    let processedMedicalInfo = null;
    if (medical_info) {
      try {
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

    const user = await User.create({
      full_name,
      email: email || null,
      phone,
      password,
      birth_date: birth_date || null,
      gender: gender || null,
      medical_info: processedMedicalInfo,
      created_at: new Date(),
      is_verified: false,
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "ثبت‌نام موفقیت‌آمیز بود.",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        medical_info: user.medical_info,
        role: user.role,
      },
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

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;

    if (!phone || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "لطفاً همه فیلدها را پر کنید.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "رمز عبور و تأیید آن یکسان نیستند.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
      });
    }

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

    user.password = newPassword;
    await user.save();

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
        stats: {
          upcoming_appointments: upcomingAppointments,
          past_appointments: pastAppointments,
          total_appointments: upcomingAppointments + pastAppointments,
        },
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

// ============ Appointment Routes (کاربران عادی) ============

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
      price: apt.price,
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

app.post("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const { service_id, appointment_date, appointment_time, notes, price } =
      req.body;

    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "سرویس مورد نظر یافت نشد",
      });
    }

    if (price && service.price) {
      const priceDiff = Math.abs(price - service.price);
      if (priceDiff > 0) {
        console.warn("⚠️ Price difference detected:", {
          sent_price: price,
          actual_price: service.price,
          diff: priceDiff,
        });
      }
    }

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

    const appointment = await Appointment.create({
      user_id: req.userId,
      service_id,
      appointment_date,
      appointment_time,
      notes: notes || "",
      status: "pending",
      price: price || service.price,
    });

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
        price: fullAppointment.price,
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

app.put("/api/appointments/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time, notes } = req.body;

    const appointment = await Appointment.findOne({
      where: {
        id: id,
        user_id: req.userId,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "نوبت مورد نظر یافت نشد.",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "نوبت‌های انجام شده قابل تغییر نیستند.",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: "نوبت‌های لغو شده قابل تغییر نیستند.",
      });
    }

    if (appointment_date && appointment_time) {
      const existingAppointment = await Appointment.findOne({
        where: {
          appointment_date,
          appointment_time,
          status: ["pending", "confirmed"],
          id: {
            [Op.ne]: parseInt(id),
          },
        },
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          error: "این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.",
        });
      }
    }

    if (appointment_date) appointment.appointment_date = appointment_date;
    if (appointment_time) appointment.appointment_time = appointment_time;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration_minutes", "price", "category"],
        },
      ],
    });

    res.json({
      success: true,
      message: "نوبت با موفقیت به‌روزرسانی شد.",
      appointment: {
        id: updatedAppointment.id,
        appointment_code: updatedAppointment.appointment_code,
        date: updatedAppointment.appointment_date,
        time: updatedAppointment.appointment_time,
        status: updatedAppointment.status,
        status_text: updatedAppointment.getStatusText(),
        notes: updatedAppointment.notes,
        price: updatedAppointment.price,
        service: updatedAppointment.service
          ? {
              id: updatedAppointment.service.id,
              name: updatedAppointment.service.name,
              duration: `${updatedAppointment.service.duration_minutes} دقیقه`,
              price:
                new Intl.NumberFormat("fa-IR").format(
                  updatedAppointment.service.price
                ) + " تومان",
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Update appointment error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در به‌روزرسانی نوبت: " + error.message,
    });
  }
});

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

app.put("/api/appointments/:id/rate", authMiddleware, async (req, res) => {
  try {
    const { rating, review } = req.body;

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
        status: "completed",
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "نوبت مورد نظر یافت نشد یا قابل امتیازدهی نیست.",
      });
    }

    if (appointment.rating) {
      return res.status(400).json({
        success: false,
        error: "شما قبلاً برای این نوبت امتیاز داده‌اید.",
      });
    }

    appointment.rating = rating;
    appointment.user_review = review || "";
    await appointment.save();

    const user = await User.findByPk(req.userId);
    await Review.create({
      user_id: req.userId,
      name: user.full_name,
      text: review || "تجربه خوبی بود..",
      rating: rating,
      is_approved: false,
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

app.get(
  "/api/appointments/available-slots",
  authMiddleware,
  async (req, res) => {
    try {
      const { date } = req.query;

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

      if (date) {
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

      const today = new Date();
      const availableDates = [];

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        const appointmentCount = await Appointment.count({
          where: {
            appointment_date: dateStr,
            status: ["pending", "confirmed"],
          },
        });

        if (appointmentCount < 11) {
          const bookedAppointments = await Appointment.findAll({
            where: {
              appointment_date: dateStr,
              status: ["pending", "confirmed"],
            },
            attributes: ["appointment_time"],
          });

          const bookedTimes = bookedAppointments.map(
            (apt) => apt.appointment_time
          );
          const availableSlots = allSlots.filter(
            (slot) => !bookedTimes.includes(slot)
          );

          availableDates.push({
            date: dateStr,
            display: date.toLocaleDateString("fa-IR", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            dayName: date.toLocaleDateString("fa-IR", { weekday: "long" }),
            all_slots: allSlots,
            available_slots: availableSlots,
            booked_slots: bookedTimes,
            total_available: availableSlots.length,
          });
        }
      }

      res.json({
        success: true,
        available_dates: availableDates,
        all_slots: allSlots,
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

app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, email, birth_date, gender, job, medical_info } =
      req.body;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربر پیدا نشد.",
      });
    }

    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (birth_date !== undefined) user.birth_date = birth_date;
    if (gender !== undefined) user.gender = gender;
    if (job !== undefined) user.job = job;

    if (medical_info !== undefined) {
      let processedMedicalInfo = medical_info;
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

app.put("/api/user/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "لطفاً همه فیلدها را پر کنید.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "رمز عبور جدید و تأیید آن یکسان نیستند.",
      });
    }

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربر پیدا نشد.",
      });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "رمز عبور فعلی اشتباه است.",
      });
    }

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

// ============ Notification Routes ============

app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.userId };
    if (unread_only === "true") {
      where.is_read = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      notifications: rows,
      total: count,
      unread_count: await Notification.count({
        where: { user_id: req.userId, is_read: false },
      }),
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت نوتیفیکیشن‌ها",
    });
  }
});

app.put("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "نوتیفیکیشن پیدا نشد.",
      });
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "نوتیفیکیشن به عنوان خوانده شده علامت خورد.",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در بروزرسانی نوتیفیکیشن",
    });
  }
});

app.put("/api/notifications/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.userId, is_read: false } }
    );

    res.json({
      success: true,
      message: "همه نوتیفیکیشن‌ها به عنوان خوانده شده علامت خوردند.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در بروزرسانی نوتیفیکیشن‌ها",
    });
  }
});

// ============ ADMIN ROUTES (همان ماساژتراپیست) ============

app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalServices,
      totalAppointments,
      pendingAppointments,
      pendingReviews,
    ] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Service.count({ where: { is_active: true } }),
      Appointment.count(),
      Appointment.count({ where: { status: "pending" } }),
      Review.count({ where: { is_approved: false } }),
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Appointment.sum("price", {
      where: {
        status: "completed",
        created_at: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = await Appointment.count({
      where: {
        appointment_date: today,
        status: { [Op.ne]: "cancelled" },
      },
    });

    res.json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_services: totalServices,
        total_appointments: totalAppointments,
        pending_appointments: pendingAppointments,
        pending_reviews: pendingReviews,
        monthly_revenue: monthlyRevenue || 0,
        today_appointments: todayAppointments,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت آمار",
    });
  }
});

app.get("/api/admin/users", adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role = "all" } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role !== "all") {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت کاربران",
    });
  }
});

app.put("/api/admin/users/:userId", adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, is_active, is_verified } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "کاربر پیدا نشد.",
      });
    }

    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (is_verified !== undefined) user.is_verified = is_verified;

    await user.save();

    res.json({
      success: true,
      message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد.",
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در به‌روزرسانی کاربر",
    });
  }
});

app.get("/api/admin/appointments", adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "all", date = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (status !== "all") {
      where.status = status;
    }

    if (date) {
      where.appointment_date = date;
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "price", "duration_minutes"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
    });

    res.json({
      success: true,
      appointments: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت نوبت‌ها",
    });
  }
});

app.put(
  "/api/admin/appointments/:id/status",
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, therapist_notes } = req.body;

      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: "نوبت پیدا نشد.",
        });
      }

      if (status) appointment.status = status;
      if (therapist_notes !== undefined)
        appointment.therapist_notes = therapist_notes;

      await appointment.save();

      res.json({
        success: true,
        message: "وضعیت نوبت با موفقیت به‌روزرسانی شد.",
        appointment: {
          id: appointment.id,
          status: appointment.status,
          status_text: appointment.getStatusText(),
          therapist_notes: appointment.therapist_notes,
        },
      });
    } catch (error) {
      console.error("Update appointment status error:", error);
      res.status(500).json({
        success: false,
        error: "خطا در به‌روزرسانی وضعیت نوبت",
      });
    }
  }
);

app.get("/api/admin/services", adminMiddleware, async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت خدمات",
    });
  }
});

app.post("/api/admin/services", adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      duration_minutes,
      price,
      category,
      icon,
      is_active,
    } = req.body;

    const service = await Service.create({
      name,
      description,
      duration_minutes,
      price,
      category,
      icon: icon || "FiUser",
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({
      success: true,
      message: "خدمت با موفقیت ایجاد شد.",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در ایجاد خدمت",
    });
  }
});

app.put("/api/admin/services/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      duration_minutes,
      price,
      category,
      icon,
      is_active,
    } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "خدمت پیدا نشد.",
      });
    }

    await service.update({
      name,
      description,
      duration_minutes,
      price,
      category,
      icon,
      is_active,
    });

    res.json({
      success: true,
      message: "خدمت با موفقیت به‌روزرسانی شد.",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در به‌روزرسانی خدمت",
    });
  }
});

app.delete("/api/admin/services/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "خدمت پیدا نشد.",
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: "خدمت با موفقیت حذف شد.",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در حذف خدمت",
    });
  }
});

app.get("/api/admin/reviews", adminMiddleware, async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = {};

    if (status === "pending") {
      where = {
        is_approved: false,
        is_rejected: false,
      };
    } else if (status === "approved") {
      where = { is_approved: true };
    } else if (status === "rejected") {
      where = { is_rejected: true };
    } else if (status === "all") {
      where = {};
    }

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "price", "duration_minutes"],
        },
        {
          model: Appointment,
          as: "appointment",
          attributes: ["price", "appointment_date", "appointment_time"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      reviews: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت نظرات",
    });
  }
});

app.put("/api/admin/reviews/:id/approve", adminMiddleware, async (req, res) => {
  console.log("🔧 ===== APPROVE REVIEW API CALLED =====");
  console.log("🔧 req.params:", req.params);
  console.log("🔧 req.body:", req.body);

  try {
    const { id } = req.params;
    const { is_approved, is_rejected } = req.body;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name"],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "نظر پیدا نشد.",
      });
    }

    // اگر is_approved = true باشد، نظر تایید می‌شود و is_rejected false می‌شود
    if (is_approved === true) {
      review.is_approved = true;
      review.is_rejected = false;
    }
    // اگر is_rejected = true باشد، نظر رد می‌شود و is_approved false می‌شود
    else if (is_rejected === true) {
      review.is_approved = false;
      review.is_rejected = true;
    }
    // اگر هر دو false باشند، یعنی عملیات لغو (برای reset کردن)
    else if (is_approved === false && is_rejected === false) {
      review.is_approved = false;
      review.is_rejected = false;
    }

    await review.save();

    // ارسال نوتیفیکیشن به کاربر
    if (review.user_id && (is_approved || is_rejected)) {
      await Notification.create({
        user_id: review.user_id,
        title: is_approved ? "نظر شما تایید شد" : "نظر شما رد شد",
        message: is_approved
          ? `نظر شما برای خدمت "${
              review.service?.name || ""
            }" با موفقیت تایید شد و در صفحه اصلی نمایش داده خواهد شد.`
          : `متاسفانه نظر شما برای خدمت "${
              review.service?.name || ""
            }" تایید نشد.`,
        type: "review_approved",
        related_id: review.id,
      });
    }

    res.json({
      success: true,
      message: is_approved
        ? "نظر با موفقیت تایید شد."
        : is_rejected
        ? "نظر رد شد."
        : "وضعیت نظر به روزرسانی شد.",
      review: {
        id: review.id,
        is_approved: review.is_approved,
        is_rejected: review.is_rejected,
      },
    });
  } catch (error) {
    console.error("Approve review error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در تایید نظر: " + error.message,
    });
  }
});

app.get("/api/admin/clients", adminMiddleware, async (req, res) => {
  try {
    const clients = await User.findAll({
      attributes: [
        "id",
        "full_name",
        "phone",
        "email",
        "birth_date",
        "gender",
        "job",
        "medical_info",
        "created_at",
      ],
      include: [
        {
          model: Appointment,
          as: "appointments",
          where: {
            status: ["completed", "confirmed", "pending"],
          },
          required: true,
          attributes: [
            "id",
            "appointment_date",
            "appointment_time",
            "status",
            "rating",
            "user_review",
            "price",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const clientsWithStats = clients.map((client) => {
      const appointments = client.appointments || [];
      const completedAppointments = appointments.filter(
        (a) => a.status === "completed"
      );

      const totalSpent = completedAppointments.reduce((sum, apt) => {
        const price = apt.price ? Number(apt.price) : 0;
        return sum + price;
      }, 0);

      return {
        id: client.id,
        full_name: client.full_name,
        phone: client.phone,
        email: client.email,
        birth_date: client.birth_date,
        gender: client.gender,
        job: client.job,
        medical_info: client.medical_info,
        joined_date: client.created_at,
        total_appointments: appointments.length,
        completed_appointments: completedAppointments.length,
        total_spent: totalSpent,
        last_visit:
          appointments.length > 0 ? appointments[0].appointment_date : null,
        avg_rating:
          completedAppointments.length > 0
            ? completedAppointments.reduce(
                (sum, apt) => sum + (apt.rating || 0),
                0
              ) / completedAppointments.length
            : 0,
      };
    });

    res.json({
      success: true,
      clients: clientsWithStats,
    });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت لیست مراجعین",
    });
  }
});

app.get("/api/admin/clients/:clientId", adminMiddleware, async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await User.findByPk(clientId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Appointment,
          as: "appointments",
          required: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: [
                "id",
                "name",
                "duration_minutes",
                "price",
                "category",
              ],
            },
          ],
          order: [["appointment_date", "DESC"]],
        },
      ],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "مشتری پیدا نشد.",
      });
    }

    const appointments = client.appointments || [];
    const completedAppointments = appointments.filter(
      (a) => a.status === "completed"
    );

    // اصلاح: استفاده از Number() و مقدار پیش‌فرض 0
    const totalSpent = completedAppointments.reduce((sum, apt) => {
      const price = apt.price
        ? Number(apt.price)
        : apt.service?.price
        ? Number(apt.service.price)
        : 0;
      return sum + price;
    }, 0);

    res.json({
      success: true,
      client: {
        id: client.id,
        full_name: client.full_name,
        phone: client.phone,
        email: client.email,
        birth_date: client.birth_date,
        gender: client.gender,
        job: client.job,
        medical_info: client.medical_info,
        joined_date: client.created_at,
        appointments: appointments.map((apt) => ({
          id: apt.id,
          date: apt.appointment_date,
          time: apt.appointment_time,
          status: apt.status,
          status_text: apt.getStatusText ? apt.getStatusText() : apt.status,
          service: apt.service
            ? {
                name: apt.service.name,
                duration: apt.service.duration_minutes,
                price: apt.service.price,
              }
            : null,
          price: apt.price
            ? Number(apt.price)
            : apt.service?.price
            ? Number(apt.service.price)
            : 0,
          rating: apt.rating,
          user_review: apt.user_review,
          therapist_notes: apt.therapist_notes,
          created_at: apt.created_at,
        })),
        stats: {
          total_appointments: appointments.length,
          completed_appointments: completedAppointments.length,
          total_spent: totalSpent,
          avg_rating:
            completedAppointments.length > 0
              ? completedAppointments.reduce(
                  (sum, apt) => sum + (apt.rating || 0),
                  0
                ) / completedAppointments.length
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get client details error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات مشتری: " + error.message,
    });
  }
});

app.get("/api/admin/calendar", adminMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {
      status: ["pending", "confirmed", "completed"],
    };

    if (start_date) {
      where.appointment_date = {
        [Op.gte]: start_date,
      };
    }

    if (end_date) {
      where.appointment_date = {
        ...where.appointment_date,
        [Op.lte]: end_date,
      };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration_minutes", "price"],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        ["appointment_time", "ASC"],
      ],
    });

    res.json({
      success: true,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        title: `${apt.user.full_name} - ${apt.service.name}`,
        date: apt.appointment_date,
        time: apt.appointment_time,
        status: apt.status,
        status_text: apt.getStatusText(),
        client: {
          id: apt.user.id,
          name: apt.user.full_name,
          phone: apt.user.phone,
        },
        service: {
          name: apt.service.name,
          duration: apt.service.duration_minutes,
          price: apt.service.price,
        },
        notes: apt.notes,
        therapist_notes: apt.therapist_notes,
      })),
    });
  } catch (error) {
    console.error("Get calendar error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات تقویم",
    });
  }
});

app.put(
  "/api/admin/appointments/:id/notes",
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { therapist_notes } = req.body;

      const appointment = await Appointment.findOne({
        where: {
          id,
          status: "completed",
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "full_name"],
          },
        ],
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: "نوبت انجام شده پیدا نشد.",
        });
      }

      appointment.therapist_notes = therapist_notes;
      await appointment.save();

      await Notification.create({
        user_id: appointment.user_id,
        title: "نظر ماساژتراپیست ثبت شد",
        message: `ماساژتراپیست برای جلسه ${appointment.appointment_date} نظر خود را ثبت کرد. می‌توانید در پنل خود مشاهده کنید.`,
        type: "therapist_note",
        related_id: appointment.id,
      });

      res.json({
        success: true,
        message: "نظر ماساژتراپیست با موفقیت ثبت شد.",
        appointment: {
          id: appointment.id,
          therapist_notes: appointment.therapist_notes,
        },
      });
    } catch (error) {
      console.error("Save therapist notes error:", error);
      res.status(500).json({
        success: false,
        error: "خطا در ثبت نظر ماساژتراپیست",
      });
    }
  }
);

app.delete("/api/admin/appointments/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: {
        id,
        status: ["pending", "confirmed"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "phone"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "نوبت پیدا نشد یا قابل لغو نیست.",
      });
    }

    const oldDate = appointment.appointment_date;
    const oldTime = appointment.appointment_time;

    await appointment.update({ status: "cancelled" });

    await Notification.create({
      user_id: appointment.user_id,
      title: "لغو نوبت توسط ماساژتراپیست",
      message: `نوبت شما در تاریخ ${oldDate} ساعت ${oldTime} توسط ماساژتراپیست لغو شد. در صورت تمایل می‌توانید نوبت جدیدی رزرو کنید.`,
      type: "appointment_cancelled",
      related_id: appointment.id,
    });

    res.json({
      success: true,
      message: "نوبت با موفقیت لغو شد و به مشتری اطلاع داده شد.",
    });
  } catch (error) {
    console.error("Admin cancel appointment error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در لغو نوبت",
    });
  }
});

app.get("/api/admin/overview", adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = now.toISOString().split("T")[0];

    // نوبت‌های امروز
    const todayAppointments = await Appointment.findAll({
      where: {
        appointment_date: today,
        status: ["pending", "confirmed"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["full_name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["name"],
        },
      ],
      order: [["appointment_time", "ASC"]],
    });

    // نوبت‌های آینده (بعد از امروز)
    const futureAppointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.gt]: today,
        },
        status: ["pending", "confirmed"],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["full_name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["name"],
        },
      ],
      order: [
        ["appointment_date", "ASC"],
        ["appointment_time", "ASC"],
      ],
    });

    // گروه‌بندی نوبت‌های آینده بر اساس تاریخ
    const groupedFutureAppointments = {};
    futureAppointments.forEach((apt) => {
      const date = apt.appointment_date;
      if (!groupedFutureAppointments[date]) {
        groupedFutureAppointments[date] = [];
      }
      groupedFutureAppointments[date].push({
        id: apt.id,
        time: apt.appointment_time,
        client_name: apt.user.full_name,
        client_phone: apt.user.phone,
        service: apt.service.name,
        status: apt.status,
        date: apt.appointment_date,
      });
    });

    // نوبت‌های ماه جاری برای درآمد
    const monthlyAppointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.gte]: startOfMonth.toISOString().split("T")[0],
        },
        status: "completed",
      },
    });

    const monthlyRevenue = monthlyAppointments.reduce(
      (sum, apt) => sum + (apt.price || 0),
      0
    );

    const uniqueClients = await Appointment.count({
      where: {
        status: "completed",
      },
      distinct: true,
      col: "user_id",
    });

    const pendingReviews = await Review.findAll({
      where: {
        is_approved: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["full_name"],
        },
      ],
      limit: 10,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      overview: {
        monthly_revenue: monthlyRevenue,
        monthly_appointments: monthlyAppointments.length,
        total_clients: uniqueClients,
        today_appointments: todayAppointments.map((apt) => ({
          id: apt.id,
          time: apt.appointment_time,
          client_name: apt.user.full_name,
          client_phone: apt.user.phone,
          service: apt.service?.name,
          status: apt.status,
          date: apt.appointment_date,
        })),
        future_appointments: groupedFutureAppointments,
        pending_reviews: pendingReviews.map((review) => ({
          id: review.id,
          client_name: review.user?.full_name || review.name,
          rating: review.rating,
          text: review.text,
          created_at: review.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("Get admin overview error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت آمار",
    });
  }
});

// ============ REPORTS ROUTES ============
app.get("/api/admin/reports/financial", adminMiddleware, async (req, res) => {
  console.log("🔧 ===== FINANCIAL REPORTS API CALLED =====");

  try {
    // 1. آمار کلی
    const totalRevenue = await Appointment.sum("price", {
      where: { status: "completed" },
    });
    console.log("💰 Total revenue:", totalRevenue);

    const totalAppointments = await Appointment.count({
      where: { status: "completed" },
    });
    console.log("📊 Total appointments:", totalAppointments);

    const averageRevenue =
      totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    // 2. درآمد ماهانه (۱۲ ماه اخیر)
    // const monthlyData = [];
    // const now = new Date();
    // for (let i = 11; i >= 0; i--) {
    //   const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    //   const startOfMonth = date.toISOString().split("T")[0];
    //   const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    //     .toISOString()
    //     .split("T")[0];

    //   const revenue = await Appointment.sum("price", {
    //     where: {
    //       status: "completed",
    //       appointment_date: {
    //         [Op.between]: [startOfMonth, endOfMonth],
    //       },
    //     },
    //   });

    //   monthlyData.push({
    //     month: date.toLocaleDateString("fa-IR", {
    //       month: "long",
    //       year: "numeric",
    //     }),
    //     revenue: revenue || 0,
    //     count: await Appointment.count({
    //       where: {
    //         status: "completed",
    //         appointment_date: { [Op.between]: [startOfMonth, endOfMonth] },
    //       },
    //     }),
    //   });
    // }

    // پیدا کردن اولین نوبت انجام شده
    const firstAppointment = await Appointment.findOne({
      where: { status: "completed" },
      order: [["appointment_date", "ASC"]],
      attributes: ["appointment_date"],
    });

    // اگر هیچ نوبتی وجود نداشت، از ۱۲ ماه قبل شروع کن
    let startDate;
    if (firstAppointment) {
      startDate = new Date(firstAppointment.appointment_date);
      startDate.setDate(1); // اولین روز ماه
      startDate.setHours(0, 0, 0, 0);

      // ✅ اضافه کردن یک ماه قبل از اولین نوبت
      startDate.setMonth(startDate.getMonth() - 1);

      console.log(`📅 First appointment: ${firstAppointment.appointment_date}`);
      console.log(
        `📅 Start month (one month before first): ${startDate.toLocaleDateString(
          "fa-IR"
        )}`
      );
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      console.log(`📅 No appointments found, showing last 12 months`);
    }

    const endDate = new Date();
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    // محاسبه تعداد ماه‌ها بین شروع و پایان
    const monthsDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;

    console.log(`📅 Start month: ${startDate.toLocaleDateString("fa-IR")}`);
    console.log(`📅 End month: ${endDate.toLocaleDateString("fa-IR")}`);
    console.log(`📅 Total months to show: ${monthsDiff}`);

    const monthlyData = [];

    // حلقه از ماه شروع تا ماه جاری
    for (let i = 0; i < monthsDiff; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);

      const startOfMonth = date.toISOString().split("T")[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      // محاسبه درآمد این ماه
      const revenue = await Appointment.sum("price", {
        where: {
          status: "completed",
          appointment_date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      });

      // محاسبه تعداد نوبت‌های این ماه
      const count = await Appointment.count({
        where: {
          status: "completed",
          appointment_date: { [Op.between]: [startOfMonth, endOfMonth] },
        },
      });

      monthlyData.push({
        month: date.toLocaleDateString("fa-IR", {
          month: "long",
          year: "numeric",
        }),
        revenue: revenue || 0,
        count: count || 0,
      });
    }

    console.log(`📊 Generated ${monthlyData.length} months of data`);

    // اگر هیچ نوبتی وجود نداشت، از ۱۲ ماه قبل شروع کن
    // let startDate;
    // if (firstAppointment) {
    //   startDate = new Date(firstAppointment.appointment_date);
    //   startDate.setDate(1); // اولین روز ماه
    //   startDate.setHours(0, 0, 0, 0);
    // } else {
    //   startDate = new Date();
    //   startDate.setMonth(startDate.getMonth() - 11);
    //   startDate.setDate(1);
    //   startDate.setHours(0, 0, 0, 0);
    // }

    // const endDate = new Date();
    // endDate.setDate(1);
    // endDate.setHours(0, 0, 0, 0);

    // محاسبه تعداد ماه‌ها بین شروع و پایان
    // const monthsDiff =
    //   (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    //   (endDate.getMonth() - startDate.getMonth()) +
    //   1;

    // console.log(
    //   `📅 First appointment date: ${
    //     firstAppointment?.appointment_date || "none"
    //   }`
    // );
    // console.log(`📅 Start month: ${startDate.toLocaleDateString("fa-IR")}`);
    // console.log(`📅 End month: ${endDate.toLocaleDateString("fa-IR")}`);
    // console.log(`📅 Total months to show: ${monthsDiff}`);

    // const monthlyData = [];

    // حلقه از ماه شروع تا ماه جاری
    // for (let i = 0; i < monthsDiff; i++) {
    //   const date = new Date(startDate);
    //   date.setMonth(startDate.getMonth() + i);

    //   const startOfMonth = date.toISOString().split("T")[0];
    //   const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    //     .toISOString()
    //     .split("T")[0];

    //   // محاسبه درآمد این ماه
    //   const revenue = await Appointment.sum("price", {
    //     where: {
    //       status: "completed",
    //       appointment_date: {
    //         [Op.between]: [startOfMonth, endOfMonth],
    //       },
    //     },
    //   });

    //   // محاسبه تعداد نوبت‌های این ماه
    //   const count = await Appointment.count({
    //     where: {
    //       status: "completed",
    //       appointment_date: { [Op.between]: [startOfMonth, endOfMonth] },
    //     },
    //   });

    //   monthlyData.push({
    //     month: date.toLocaleDateString("fa-IR", {
    //       month: "long",
    //       year: "numeric",
    //     }),
    //     revenue: revenue || 0,
    //     count: count || 0,
    //   });
    // }

    // console.log(`📊 Generated ${monthlyData.length} months of data`);

    // 3. آمار خدمات
    const services = await Service.findAll({
      attributes: ["id", "name", "price"],
    });

    const serviceStats = [];
    for (const service of services) {
      const appointments = await Appointment.findAll({
        where: {
          service_id: service.id,
          status: "completed",
        },
        attributes: ["price"],
      });

      const count = appointments.length;
      const revenue = appointments.reduce(
        (sum, apt) => sum + (apt.price || 0),
        0
      );

      serviceStats.push({
        id: service.id,
        name: service.name,
        count: count,
        revenue: revenue,
        percentage:
          totalAppointments > 0
            ? ((count / totalAppointments) * 100).toFixed(1)
            : 0,
      });
    }
    serviceStats.sort((a, b) => b.revenue - a.revenue);

    // 4. مشتریان برتر
    const topClientsRaw = await Appointment.findAll({
      where: { status: "completed" },
      attributes: [
        "user_id",
        [sequelize.fn("SUM", sequelize.col("price")), "total_spent"],
        [sequelize.fn("COUNT", sequelize.col("id")), "appointment_count"],
      ],
      group: ["user_id"],
      order: [[sequelize.literal("total_spent"), "DESC"]],
      limit: 10,
    });

    const topClients = [];
    for (const client of topClientsRaw) {
      const user = await User.findByPk(client.user_id, {
        attributes: ["id", "full_name", "phone"],
      });
      if (user) {
        topClients.push({
          id: user.id,
          name: user.full_name,
          phone: user.phone,
          total_spent: client.dataValues.total_spent || 0,
          appointment_count: client.dataValues.appointment_count || 0,
        });
      }
    }

    // 5. تحلیل زمانی
    const allAppointments = await Appointment.findAll({
      where: { status: "completed" },
      attributes: ["appointment_time", "appointment_date"],
    });

    // تحلیل ساعتی
    const hourlyStats = {};
    for (let i = 8; i <= 19; i++) {
      hourlyStats[`${i}:00`] = 0;
    }
    allAppointments.forEach((apt) => {
      const hour = apt.appointment_time.split(":")[0];
      if (hourlyStats[`${hour}:00`] !== undefined) {
        hourlyStats[`${hour}:00`]++;
      }
    });

    // تحلیل روزانه
    const weeklyStats = {
      شنبه: 0,
      یکشنبه: 0,
      دوشنبه: 0,
      سه‌شنبه: 0,
      چهارشنبه: 0,
      پنج‌شنبه: 0,
      جمعه: 0,
    };
    allAppointments.forEach((apt) => {
      const date = new Date(apt.appointment_date);
      const dayName = date.toLocaleDateString("fa-IR", { weekday: "long" });
      if (weeklyStats[dayName] !== undefined) weeklyStats[dayName]++;
    });

    // تحلیل ماهانه
    const monthlyStats = {};
    allAppointments.forEach((apt) => {
      const date = new Date(apt.appointment_date);
      const monthName = date.toLocaleDateString("fa-IR", { month: "long" });
      monthlyStats[monthName] = (monthlyStats[monthName] || 0) + 1;
    });

    const responseData = {
      success: true,
      data: {
        total_revenue: totalRevenue || 0,
        total_appointments: totalAppointments,
        average_revenue: averageRevenue,
        monthly_revenue: monthlyData,
        service_stats: serviceStats,
        top_clients: topClients,
        time_analysis: {
          hourly: Object.entries(hourlyStats).map(([hour, count]) => ({
            hour,
            count,
          })),
          weekly: Object.entries(weeklyStats).map(([day, count]) => ({
            day,
            count,
          })),
          monthly: Object.entries(monthlyStats).map(([month, count]) => ({
            month,
            count,
          })),
        },
      },
    };

    console.log("✅ Financial reports generated successfully");
    res.json(responseData);
  } catch (error) {
    console.error("❌ Error in financial reports API:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت گزارشات مالی: " + error.message,
    });
  }
});

// API برای بررسی دستی نوبت‌های انجام نشده
app.post("/api/admin/check-uncompleted", adminMiddleware, async (req, res) => {
  try {
    const count = await checkUncompletedAppointments();
    res.json({
      success: true,
      message: `${count} نوبت انجام نشده بررسی شدند.`,
      count: count,
    });
  } catch (error) {
    console.error("Error in check-uncompleted API:", error);
    res.status(500).json({
      success: false,
      error: "خطا در بررسی نوبت‌های انجام نشده",
    });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");

    // اجرای اولیه برای به‌روزرسانی نوبت‌های گذشته (pending -> expired)
    const expiredCount = await updatePastAppointments();
    if (expiredCount > 0) {
      console.log(
        `📅 Updated ${expiredCount} past pending appointments to expired`
      );
    }

    // اجرای اولیه برای بررسی نوبت‌های انجام نشده (confirmed -> reminder)
    const uncompletedCount = await checkUncompletedAppointments();
    if (uncompletedCount > 0) {
      console.log(
        `⚠️ Found ${uncompletedCount} uncompleted past confirmed appointments`
      );
    }

    // اجرای هر ساعت یکبار
    setInterval(async () => {
      // 1. به‌روزرسانی نوبت‌های pending با تاریخ گذشته
      const expiredCount = await updatePastAppointments();
      if (expiredCount > 0) {
        console.log(
          `📅 [Auto] Updated ${expiredCount} past pending appointments to expired`
        );
      }

      // 2. بررسی نوبت‌های confirmed با تاریخ گذشته و ارسال نوتیفیکیشن
      const uncompletedCount = await checkUncompletedAppointments();
      if (uncompletedCount > 0) {
        console.log(
          `⚠️ [Auto] Found ${uncompletedCount} uncompleted past confirmed appointments`
        );
      }
    }, 60 * 60 * 1000); // هر 1 ساعت

    app.listen(PORT, () => {
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`📡 Available APIs:`);
      console.log(`   Public Routes:`);
      console.log(`     GET  /api/services`);
      console.log(`     GET  /api/reviews`);
      console.log(`   Auth Routes:`);
      console.log(`     POST /api/auth/login`);
      console.log(`     POST /api/auth/register`);
      console.log(`     POST /api/auth/reset-password`);
      console.log(`     GET  /api/auth/me`);
      console.log(`   Admin Routes (same as therapist):`);
      console.log(`     GET  /api/admin/stats`);
      console.log(`     GET  /api/admin/users`);
      console.log(`     GET  /api/admin/appointments`);
      console.log(`     GET  /api/admin/services`);
      console.log(`     GET  /api/admin/reviews`);
      console.log(`     GET  /api/admin/clients`);
      console.log(`     GET  /api/admin/calendar`);
      console.log(`     GET  /api/admin/overview`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// const startServer = async () => {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log("✅ Database synchronized");

//     // اجرای اولیه برای به‌روزرسانی نوبت‌های گذشته
//     const updatedCount = await updatePastAppointments();
//     if (updatedCount > 0) {
//       console.log(`📅 Updated ${updatedCount} past pending appointments`);
//     }

//     // اجرای هر ساعت یکبار
//     setInterval(async () => {
//       const count = await updatePastAppointments();
//       if (count > 0) {
//         console.log(`📅 [Auto] Updated ${count} past pending appointments`);
//       }
//     }, 60 * 60 * 1000); // هر 1 ساعت

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on: http://localhost:${PORT}`);
//       console.log(`📡 Available APIs:`);
//       console.log(`   Public Routes:`);
//       console.log(`     GET  /api/services`);
//       console.log(`     GET  /api/reviews`);
//       console.log(`   Auth Routes:`);
//       console.log(`     POST /api/auth/login`);
//       console.log(`     POST /api/auth/register`);
//       console.log(`     POST /api/auth/reset-password`);
//       console.log(`     GET  /api/auth/me`);
//       console.log(`   Admin Routes (same as therapist):`);
//       console.log(`     GET  /api/admin/stats`);
//       console.log(`     GET  /api/admin/users`);
//       console.log(`     GET  /api/admin/appointments`);
//       console.log(`     GET  /api/admin/services`);
//       console.log(`     GET  /api/admin/reviews`);
//       console.log(`     GET  /api/admin/clients`);
//       console.log(`     GET  /api/admin/calendar`);
//       console.log(`     GET  /api/admin/overview`);
//     });
//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// };

startServer();
