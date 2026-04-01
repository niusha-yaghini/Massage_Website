const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      field: "user_id",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5,
      },
      allowNull: false,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // تغییر به false - باید ادمین تایید کنه
      field: "is_approved",
    },
    service_id: {
      // اضافه شد: مربوط به کدام سرویس
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "services",
        key: "id",
      },
      field: "service_id",
    },
    appointment_id: {
      // اضافه شد: مربوط به کدام نوبت
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "appointments",
        key: "id",
      },
      field: "appointment_id",
    },
    is_rejected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_rejected",
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Review.associate = (models) => {
  Review.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  Review.belongsTo(models.Service, {
    foreignKey: "service_id",
    as: "service",
  });
  Review.belongsTo(models.Appointment, {
    foreignKey: "appointment_id",
    as: "appointment",
  });
};

module.exports = Review;
