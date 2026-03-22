const { sequelize } = require("../config/database");

// Import مدل‌ها
const User = require("./User");
const Service = require("./Service");
const Appointment = require("./Appointment");
const Review = require("./Review");
const Notification = require("./Notification");

// تعریف رابطه‌ها
const models = {
  User,
  Service,
  Appointment,
  Review,
  Notification,
};

// تعریف همه associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

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
  Notification,
  syncDatabase,
};
