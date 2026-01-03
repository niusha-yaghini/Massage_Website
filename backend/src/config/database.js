const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "massage_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// تست اتصال
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
