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
      allowNull: true, // اضافه شد
    },
    user_review: {
      type: DataTypes.TEXT,
      defaultValue: "",
      field: "user_review",
    },
    therapist_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // اضافه شد
      references: {
        model: "users",
        key: "id",
      },
      field: "therapist_id",
    },
    appointment_code: {
      // اضافه شد: کد یکتا برای نوبت
      type: DataTypes.STRING(20),
      unique: true,
      field: "appointment_code",
    },
  },
  {
    tableName: "appointments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (appointment) => {
        // ایجاد کد یکتا برای نوبت
        if (!appointment.appointment_code) {
          const date = new Date();
          const timestamp = date.getTime().toString().slice(-6);
          const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
          appointment.appointment_code = `SPA-${timestamp}${random}`;
        }
      },
    },
  }
);

// تعریف رابطه‌ها
Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  Appointment.belongsTo(models.Service, {
    foreignKey: "service_id",
    as: "service",
  });
  Appointment.belongsTo(models.User, {
    foreignKey: "therapist_id",
    as: "therapist",
  });
};

// متدهای کمکی
Appointment.prototype.getStatusText = function () {
  const statusMap = {
    pending: "در انتظار تأیید",
    confirmed: "تأیید شده",
    completed: "انجام شده",
    cancelled: "لغو شده",
  };
  return statusMap[this.status] || this.status;
};

Appointment.prototype.getDateTime = function () {
  const date = new Date(this.appointment_date);
  const persianDate = date.toLocaleDateString("fa-IR");
  return `${persianDate} ساعت ${this.appointment_time}`;
};

module.exports = Appointment;
