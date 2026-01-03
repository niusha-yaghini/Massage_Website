const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import دیتابیس و مدل‌ها
const { sequelize, testConnection } = require("./config/database");
const { User, Service, Appointment, Review } = require("./models");

// Import routes (بعداً می‌سازیم)
// const authRoutes = require("./routes/auth");
// const serviceRoutes = require("./routes/services");
// const appointmentRoutes = require("./routes/appointments");
// const userRoutes = require("./routes/users");

const app = express();

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

// Routes اصلی (بعداً جایگزین می‌شوند)
// ============ Routes موقت (تا routes جدید رو بسازیم) ============

// دریافت لیست خدمات از دیتابیس
app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.findAll();
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
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "خطا در دریافت نظرات" });
  }
});

// احراز هویت - ورود
// به جای email، با phone لاگین کن
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body; // تغییر: phone به جای email

    const user = await User.findOne({
      where: {
        phone, // جستجو با شماره تلفن
        is_active: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "شماره تماس یا رمز عبور اشتباه است" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res
        .status(401)
        .json({ error: "شماره تماس یا رمز عبور اشتباه است" });
    }

    res.json({
      success: true,
      message: "ورود موفقیت‌آمیز بود",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        medical_info: user.medical_info,
        role: user.role,
      },
      token: `fake-jwt-token-${user.id}`,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "خطا در سرور" });
  }
});

// احراز هویت - ثبت‌نام (موقت)
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

    // بررسی وجود کاربر
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "این ایمیل قبلاً ثبت شده است" });
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      full_name,
      email,
      phone,
      password,
      birth_date,
      gender,
      medical_info: medical_info || {
        allergies: "ندارد",
        conditions: [],
        notes: "",
      },
    });

    const userResponse = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      medical_info: user.medical_info,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      message: "ثبت‌نام موفقیت‌آمیز بود",
      user: userResponse,
      token: `fake-jwt-token-${user.id}`,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "خطا در سرور" });
  }
});

// ============ سرور ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync دیتابیس
    await sequelize.sync({ alter: true }); // alter به جای force تا داده‌ها پاک نشن
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
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
