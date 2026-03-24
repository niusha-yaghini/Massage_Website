// backend/seed.js
require("dotenv").config();
const { sequelize } = require("./src/config/database");

// Import مدل‌ها
const User = require("./src/models/User");
const Service = require("./src/models/Service");
const Appointment = require("./src/models/Appointment");
const Review = require("./src/models/Review");
const Notification = require("./src/models/Notification");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Sync دیتابیس (ایجاد جداول)
    await sequelize.sync({ force: true });
    console.log("✅ Tables created successfully");

    // ایجاد خدمات
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

    // ایجاد کاربر ادمین (همان ماساژتراپیست)
    const admin = await User.create({
      full_name: "احمد رضایی",
      email: "admin@spa.com",
      phone: "09123456789",
      password: "123456",
      birth_date: "1985-05-15",
      gender: "male",
      job: "ماساژتراپیست ارشد و مدیر",
      medical_info: {
        allergies: "ندارد",
        conditions: [],
        notes: "دارای ۱۰ سال سابقه در ماساژ درمانی",
      },
      role: "admin",
      is_verified: true,
      is_active: true,
    });
    console.log(
      "✅ Admin user created (admin@spa.com) - این کاربر مدیر و ماساژتراپیست است"
    );

    // ایجاد کاربر تست عادی
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
      is_verified: true,
      is_active: true,
    });
    console.log("✅ Test user created (test@spa.com)");

    // ایجاد کاربر تست دوم
    const testUser2 = await User.create({
      full_name: "سارا محمدی",
      email: "sara@test.com",
      phone: "09123456788",
      password: "123456",
      birth_date: "1992-08-20",
      gender: "female",
      job: "معلم",
      medical_info: {
        allergies: "ندارد",
        conditions: [],
        notes: "",
      },
      role: "user",
      is_verified: true,
      is_active: true,
    });
    console.log("✅ Second test user created (sara@test.com)");

    // ایجاد نوبت تست برای کاربر تست
    const appointments = await Appointment.bulkCreate([
      {
        user_id: testUser.id,
        service_id: services[0].id,
        appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        appointment_time: "15:00",
        status: "confirmed",
        notes: "اولین نوبت تست",
        price: services[0].price,
      },
      {
        user_id: testUser.id,
        service_id: services[1].id,
        appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        appointment_time: "10:00",
        status: "completed",
        notes: "نوبت انجام شده",
        rating: 5,
        user_review: "تجربه بسیار خوبی بود، حتماً تکرار می‌کنم",
        price: services[1].price,
        therapist_notes: "مشتری بسیار راضی بود، کشش عضلات خوب انجام شد.",
      },
      {
        user_id: testUser.id,
        service_id: services[2].id,
        appointment_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        appointment_time: "14:00",
        status: "completed",
        notes: "نوبت قدیمی",
        rating: 4,
        user_review: "قیمت مناسب، خدمات خوب",
        price: services[2].price,
        therapist_notes: "مشکل کمر داشت، ماساژ ورزشی مناسب بود.",
      },
      {
        user_id: testUser2.id,
        service_id: services[3].id,
        appointment_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        appointment_time: "11:00",
        status: "pending",
        notes: "درخواست ماساژ آرام‌بخش",
        price: services[3].price,
      },
      {
        user_id: testUser2.id,
        service_id: services[4].id,
        appointment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        appointment_time: "16:00",
        status: "completed",
        notes: "ماساژ درمانی برای گردن",
        rating: 5,
        user_review: "عالی بود، درد گردنم کاملاً برطرف شد",
        price: services[4].price,
        therapist_notes: "مشکل دیسک گردن داشت، تمرکز روی نقاط فشار بود.",
      },
    ]);
    console.log(`✅ ${appointments.length} appointments created`);

    // ایجاد نظرات تایید شده برای نمایش در لندینگ
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
        user_id: testUser2.id,
        name: "سارا محمدی",
        text: "محیط بسیار آرام و دلنشین. ماساژ درمانی واقعا کمک کرد.",
        rating: 5,
        is_approved: true,
        service_id: services[4].id,
        appointment_id: appointments[4].id,
      },
      {
        user_id: testUser.id,
        name: "رضا رحیمی",
        text: "تجربه فوق‌العاده‌ای بود. احساس آرامش و ریلکسیشن بعد از ماساژ سوئدی خیلی ماندگار بود.",
        rating: 4,
        is_approved: true,
        service_id: services[0].id,
        appointment_id: appointments[0].id,
      },
      {
        user_id: testUser2.id,
        name: "مریم کریمی",
        text: "ماساژ آرام‌سازی عالی بود. حتماً دوباره میام.",
        rating: 5,
        is_approved: false,
        service_id: services[3].id,
      },
      {
        user_id: testUser.id,
        name: "حسین رحمانی",
        text: "خدمات بسیار حرفه‌ای. پیشنهاد می‌کنم حتماً امتحان کنید.",
        rating: 5,
        is_approved: false,
        service_id: services[5].id,
      },
    ]);
    console.log("✅ 5 reviews created (3 approved, 2 pending)");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("👤 Login with:");
    console.log(
      "   Phone: 09123456789 / Password: 123456 (Admin - مدیر و ماساژتراپیست)"
    );
    console.log("   Phone: 09129876543 / Password: 123456 (Test User)");
    console.log("   Phone: 09123456788 / Password: 123456 (Sara - Test User)");
    console.log("\n📱 Use these phone numbers in frontend login");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
