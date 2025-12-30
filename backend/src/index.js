const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // آدرس Vite
    credentials: true,
  })
);
app.use(express.json());

// ============ داده‌های موقت ============
let users = [
  {
    id: 1,
    fullName: "علی احمدی",
    email: "ali@example.com",
    phone: "09123456789",
    password: "123456",
    birthDate: "1990-05-15",
    gender: "male",
    medicalInfo: {
      allergies: "ندارد",
      conditions: ["میگرن خفیف"],
      notes: "ترجیح می‌دهم ماساژ آرام باشد",
    },
  },
];

let services = [
  {
    id: 1,
    name: "ماساژ سوئدی",
    description: "ماساژ کلاسیک برای ریلکس شدن عضلات",
    duration: "60 دقیقه",
    price: 1800000,
    category: "آرامش‌بخش",
    icon: "FiUser",
  },
  {
    id: 2,
    name: "ماساژ تایلندی",
    description: "کشش یوگا و تکنیک‌های انرژی‌بخش",
    duration: "90 دقیقه",
    price: 2200000,
    category: "انرژی‌بخش",
    icon: "FiActivity",
  },
  {
    id: 3,
    name: "ماساژ ورزشی",
    description: "مخصوص ورزشکاران حرفه‌ای",
    duration: "75 دقیقه",
    price: 2000000,
    category: "درمانی",
    icon: "FiActivity",
  },
];

let appointments = [
  {
    id: 1,
    userId: 1,
    serviceId: 1,
    date: "2024-02-01",
    time: "15:00",
    status: "upcoming",
    notes: "",
    therapistNotes: "عضلات گردن و شانه نیاز به توجه بیشتری دارند",
    rating: null,
    userReview: "",
    createdAt: new Date(),
  },
];

let reviews = [
  {
    id: 1,
    name: "علی احمدی",
    text: "تجربه عالی! من بعد از ماساژ تایلندی احساس خیلی بهتری داشتم.",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "حسین رحمانی",
    text: "عالی بود! خدمات بسیار حرفه‌ای و محیطی آرام.",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
  },
];

// ============ Routes ============

// 1. تست سرور
app.get("/api/test", (req, res) => {
  res.json({
    message: "backend works! 🎉",
    time: new Date().toLocaleTimeString("fa-IR"),
  });
});

// 2. دریافت لیست خدمات
app.get("/api/services", (req, res) => {
  res.json(services);
});

app.get("/api/services/:id", (req, res) => {
  const service = services.find((s) => s.id === parseInt(req.params.id));
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ error: "Service not found" });
  }
});

// 3. نظرات مشتریان
app.get("/api/reviews", (req, res) => {
  res.json(reviews);
});

// 4. احراز هویت - ثبت‌نام
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phone, password, birthDate, gender, medicalInfo } =
    req.body;

  // بررسی تکراری نبودن ایمیل
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "این ایمیل قبلاً ثبت شده است" });
  }

  const newUser = {
    id: users.length + 1,
    fullName,
    email,
    phone,
    password, // در پروژه واقعی باید hash بشه
    birthDate,
    gender,
    medicalInfo: medicalInfo || {
      allergies: "ندارد",
      conditions: [],
      notes: "",
    },
    createdAt: new Date(),
  };

  users.push(newUser);

  // برای امنیت، پسورد رو برنگردونیم
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    message: "signup was successful.",
    user: userWithoutPassword,
    token: "fake-jwt-token-" + Date.now(), // در پروژه واقعی JWT واقعی
  });
});

// 5. احراز هویت - ورود
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "email or password is wrong!" });
  }

  // برای امنیت، پسورد رو برنگردونیم
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: "Login was successful",
    user: userWithoutPassword,
    token: "fake-jwt-token-" + user.id,
  });
});

// 6. دریافت اطلاعات کاربر (با توکن)
app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token || !token.includes("fake-jwt-token-")) {
    return res.status(401).json({ error: "token isn't valid" });
  }

  const userId = parseInt(token.replace("fake-jwt-token-", ""));
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "user not found!" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// 7. مدیریت نوبت‌ها
app.get("/api/appointments", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = parseInt(token?.replace("fake-jwt-token-", "") || "1");

  const userAppointments = appointments
    .filter((apt) => apt.userId === userId)
    .map((apt) => {
      const service = services.find((s) => s.id === apt.serviceId);
      return {
        ...apt,
        serviceName: service?.name,
        serviceDuration: service?.duration,
        servicePrice: service?.price,
      };
    });

  res.json(userAppointments);
});

app.post("/api/appointments", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = parseInt(token?.replace("fake-jwt-token-", "") || "1");

  const { serviceId, date, time, notes } = req.body;

  const newAppointment = {
    id: appointments.length + 1,
    userId,
    serviceId,
    date,
    time,
    status: "upcoming",
    notes: notes || "",
    therapistNotes: "",
    rating: null,
    userReview: "",
    createdAt: new Date(),
  };

  appointments.push(newAppointment);

  const service = services.find((s) => s.id === serviceId);

  res.status(201).json({
    success: true,
    message: "Appoinment booked successfully",
    appointment: {
      ...newAppointment,
      serviceName: service?.name,
      serviceDuration: service?.duration,
      servicePrice: service?.price,
    },
  });
});

// 8. ثبت امتیاز و نظر
app.put("/api/appointments/:id/rate", (req, res) => {
  const { rating, review } = req.body;
  const appointmentId = parseInt(req.params.id);

  const appointment = appointments.find((a) => a.id === appointmentId);
  if (!appointment) {
    return res.status(404).json({ error: "Appoinment not found!" });
  }

  appointment.rating = rating;
  appointment.userReview = review;

  res.json({
    success: true,
    message: "Your rating and comment have been recorded.",
  });
});

// 9. ویرایش پروفایل
app.put("/api/users/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = parseInt(token?.replace("fake-jwt-token-", "") || "1");

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const { fullName, phone, medicalInfo } = req.body;

  users[userIndex] = {
    ...users[userIndex],
    fullName: fullName || users[userIndex].fullName,
    phone: phone || users[userIndex].phone,
    medicalInfo: medicalInfo || users[userIndex].medicalInfo,
  };

  const { password: _, ...updatedUser } = users[userIndex];

  res.json({
    success: true,
    message: "Profile Updated Successfully!",
    user: updatedUser,
  });
});

// ============ Server ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` backend server on: http://localhost:${PORT}`);
  console.log(` Available APIs:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/services`);
  console.log(`   GET  /api/reviews`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/appointments`);
  console.log(`   POST /api/appointments`);
});
