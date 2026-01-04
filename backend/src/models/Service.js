const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration_minutes: {
      // تغییر از STRING به INTEGER
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "duration_minutes",
      validate: {
        min: 15,
        max: 180,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    category: {
      type: DataTypes.ENUM("آرامش‌بخش", "انرژی‌بخش", "درمانی", "ویژه"),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: "FiUser",
    },
    image_url: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      field: "image_url",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "services",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// متد کمکی برای نمایش مدت زمان
Service.prototype.getDurationDisplay = function () {
  const hours = Math.floor(this.duration_minutes / 60);
  const minutes = this.duration_minutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} ساعت و ${minutes} دقیقه`;
  } else if (hours > 0) {
    return `${hours} ساعت`;
  } else {
    return `${minutes} دقیقه`;
  }
};

// متد کمکی برای نمایش قیمت
Service.prototype.getPriceDisplay = function () {
  return new Intl.NumberFormat("fa-IR").format(this.price) + " تومان";
};

module.exports = Service;
