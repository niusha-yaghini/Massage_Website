const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Appointment = sequelize.define(
  "Appointment",
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
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "services",
        key: "id",
      },
      field: "service_id",
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "appointment_date",
    },
    appointment_time: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "appointment_time",
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    therapist_notes: {
      type: DataTypes.TEXT,
      defaultValue: "",
      field: "therapist_notes",
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5,
      },
      defaultValue: null,
    },
    user_review: {
      type: DataTypes.TEXT,
      defaultValue: "",
      field: "user_review",
    },
    therapist_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      field: "therapist_id",
    },
  },
  {
    tableName: "appointments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// تعریف رابطه‌ها
Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  Appointment.belongsTo(models.Service, {
    foreignKey: "service_id",
    as: "service",
  });
  Appointment.belongsTo(models.User, {
    foreignKey: "therapist_id",
    as: "therapist",
  });
};

module.exports = Appointment;
