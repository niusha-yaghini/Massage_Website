const { sequelize } = require("../config/database");

// Import مدل‌ها
const User = require("./User");
const Service = require("./Service");
const Appointment = require("./Appointment");
const Review = require("./Review");

// تعریف رابطه‌ها
if (Appointment.associate) {
  Appointment.associate({ User, Service });
}

if (Review.associate) {
  Review.associate({ User });
}

// sync کردن دیتابیس
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

module.exports = {
  sequelize,
  User,
  Service,
  Appointment,
  Review,
  syncDatabase,
};
