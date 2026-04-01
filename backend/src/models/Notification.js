// backend/src/models/Notification.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "Notification",
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "appointment_cancelled",
        "appointment_changed",
        "review_received",
        "review_approved",
        "therapist_note",
        "appointment_reminder"
      ),
      defaultValue: "appointment_cancelled",
    },
    related_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID نوبت یا نظر مرتبط",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

module.exports = Notification;
