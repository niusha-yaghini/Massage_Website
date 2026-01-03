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

    // ایجاد خدمات (همون داده‌های فرانت)
    const services = await Service.bulkCreate([
      {
        name: "ماساژ سوئدی",
        description: "ماساژ کلاسیک برای ریلکس شدن عضلات",
        duration: "60 دقیقه",
        price: 1800000,
        category: "آرامش‌بخش",
        icon: "FiUser",
      },
      {
        name: "ماساژ تایلندی",
        description: "کشش یوگا و تکنیک‌های انرژی‌بخش",
        duration: "90 دقیقه",
        price: 2200000,
        category: "انرژی‌بخش",
        icon: "FiActivity",
      },
      {
        name: "ماساژ ورزشی",
        description: "مخصوص ورزشکاران حرفه‌ای",
        duration: "75 دقیقه",
        price: 2000000,
        category: "درمانی",
        icon: "FiActivity",
      },
      {
        name: "ماساژ آرام‌سازی",
        description: "ریلکسیشن عمیق با روغن‌های ارگانیک",
        duration: "60 دقیقه",
        price: 1900000,
        category: "آرامش‌بخش",
        icon: "FiUser",
      },
      {
        name: "ماساژ درمانی",
        description: "درمان دردهای عضلانی و گرفتگی‌ها",
        duration: "90 دقیقه",
        price: 2400000,
        category: "درمانی",
        icon: "FiStar",
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
      role: "admin",
      medical_info: JSON.stringify({
        allergies: "ندارد",
        conditions: [],
        notes: "",
      }),
    });

    // ایجاد کاربر تست
    const testUser = await User.create({
      full_name: "کاربر تست",
      email: "test@spa.com",
      phone: "09129876543",
      password: "123456",
      birth_date: "1995-05-15",
      gender: "male",
      medical_info: JSON.stringify({
        allergies: "گل محمدی",
        conditions: ["میگرن"],
        notes: "ترجیح می‌دهم ماساژ ملایم باشد",
      }),
    });
    console.log("✅ 2 users created (admin@spa.com / test@spa.com)");

    // ایجاد نوبت تست
    await Appointment.create({
      user_id: testUser.id,
      service_id: services[0].id,
      appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 روز بعد
      appointment_time: "15:00",
      status: "confirmed",
      notes: "اولین نوبت تست",
    });
    console.log("✅ Test appointment created");

    // ایجاد نظرات
    await Review.bulkCreate([
      {
        user_id: testUser.id,
        name: "کاربر تست",
        text: "تجربه عالی! من بعد از ماساژ تایلندی احساس خیلی بهتری داشتم.",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        rating: 5,
      },
      {
        user_id: admin.id,
        name: "ادمین اسپا",
        text: "عالی بود! خدمات بسیار حرفه‌ای و محیطی آرام.",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        rating: 5,
      },
    ]);
    console.log("✅ 2 reviews created");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("👤 Login with:");
    console.log("   Email: admin@spa.com / Password: 123456");
    console.log("   Email: test@spa.com  / Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
