// backend/seed.js
require("dotenv").config();
const { sequelize } = require("./src/config/database");

// Import مدل‌ها
const User = require("./src/models/User");
const Service = require("./src/models/Service");
const Appointment = require("./src/models/Appointment");
const Review = require("./src/models/Review");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Sync دیتابیس (ایجاد جداول)
    await sequelize.sync({ force: true });
    console.log("✅ Tables created successfully");

    // ایجاد خدمات (اصلاح شده)
    const services = await Service.bulkCreate([
      {
        name: "ماساژ سوئدی",
        description: "ماساژ کلاسیک برای ریلکس شدن عضلات",
        duration_minutes: 60,
        price: 1800000,
        category: "آرامش‌بخش",
        icon: "FiUser",
        image_url: "",
        is_active: true,
      },
      {
        name: "ماساژ تایلندی",
        description: "کشش یوگا و تکنیک‌های انرژی‌بخش",
        duration_minutes: 60,
        price: 2200000,
        category: "انرژی‌بخش",
        icon: "FiActivity",
        image_url: "",
        is_active: true,
      },
      {
        name: "ماساژ ورزشی",
        description: "مخصوص ورزشکاران حرفه‌ای",
        duration_minutes: 60,
        price: 2000000,
        category: "درمانی",
        icon: "FiActivity",
        image_url: "",
        is_active: true,
      },
      {
        name: "ماساژ آرام‌سازی",
        description: "ریلکسیشن عمیق با روغن‌های ارگانیک",
        duration_minutes: 60,
        price: 1900000,
        category: "آرامش‌بخش",
        icon: "FiUser",
        image_url: "",
        is_active: true,
      },
      {
        name: "ماساژ درمانی",
        description: "درمان دردهای عضلانی و گرفتگی‌ها",
        duration_minutes: 60,
        price: 2400000,
        category: "درمانی",
        icon: "FiStar",
        image_url: "",
        is_active: true,
      },
      {
        name: "ماساژ VIP",
        description: "لوکس‌ترین پکیج همراه با رایحه‌درمانی",
        duration_minutes: 60,
        price: 3000000,
        category: "ویژه",
        icon: "FiShield",
        image_url: "",
        is_active: true,
      },
    ]);
    console.log(`✅ ${services.length} services created`);

    // ایجاد کاربر ادمین
    const admin = await User.create({
      full_name: "ادمین اسپا",
      email: "admin@spa.com",
      phone: "09123456789",
      password: "123456",
      birth_date: "1990-01-01",
      gender: "male",
      job: "مدیر",
      medical_info: {
        allergies: "ندارد",
        conditions: [],
        notes: "",
      },
      role: "admin",
      // membership_level: "premium",
      // points: 100,
      is_verified: true,
    });

    // ایجاد کاربر تست
    const testUser = await User.create({
      full_name: "کاربر تست",
      email: "test@spa.com",
      phone: "09129876543",
      password: "123456",
      birth_date: "1995-05-15",
      gender: "male",
      job: "مهندس نرم‌افزار",
      medical_info: {
        allergies: "گل محمدی",
        conditions: ["میگرن", "آرتروز"],
        notes: "ترجیح می‌دهم ماساژ ملایم باشد",
      },
      role: "user",
      // membership_level: "regular",
      // points: 50,
      is_verified: true,
    });
    console.log("✅ 2 users created (admin@spa.com / test@spa.com)");

    // ایجاد نوبت تست
    const appointments = await Appointment.bulkCreate([
      {
        user_id: testUser.id,
        service_id: services[0].id,
        appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 روز بعد
        appointment_time: "15:00",
        status: "confirmed",
        notes: "اولین نوبت تست",
      },
      {
        user_id: testUser.id,
        service_id: services[1].id,
        appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 روز قبل
        appointment_time: "10:00",
        status: "completed",
        notes: "نوبت انجام شده",
        rating: 5,
        user_review: "تجربه بسیار خوبی بود، حتماً تکرار می‌کنم",
      },
      {
        user_id: testUser.id,
        service_id: services[2].id,
        appointment_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 روز قبل
        appointment_time: "14:00",
        status: "completed",
        notes: "نوبت قدیمی",
        rating: 4,
        user_review: "قیمت مناسب، خدمات خوب",
      },
    ]);
    console.log(`✅ ${appointments.length} appointments created`);

    // ایجاد نظرات برای نمایش در Landing
    await Review.bulkCreate([
      {
        user_id: testUser.id,
        name: "علی احمدی",
        text: "تجربه عالی! من بعد از ماساژ تایلندی احساس خیلی بهتری داشتم. قطعا دوباره مراجعه می‌کنم.",
        rating: 5,
        is_approved: true,
        service_id: services[1].id,
        appointment_id: appointments[1].id,
      },
      {
        user_id: admin.id,
        name: "حسین رحمانی",
        text: "عالی بود! خدمات بسیار حرفه‌ای و محیطی آرام. ماساژ آرام‌سازی واقعا تاثیرگذار بود.",
        rating: 5,
        is_approved: true,
        service_id: services[3].id,
      },
      {
        user_id: testUser.id,
        name: "رضا رحیمی",
        text: "تجربه فوق‌العاده‌ای بود. احساس آرامش و ریلکسیشن بعد از ماساژ سوئدی خیلی ماندگار بود.",
        rating: 4,
        is_approved: true,
        service_id: services[0].id,
      },
    ]);
    console.log("✅ 3 reviews created for landing page");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("👤 Login with:");
    console.log("   Phone: 09123456789 / Password: 123456 (Admin)");
    console.log("   Phone: 09129876543 / Password: 123456 (Test User)");
    console.log("\n📱 Use these phone numbers in frontend login");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
