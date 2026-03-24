const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "full_name",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
      validate: {
        is: /^09[0-9]{9}$/,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "birth_date",
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    job: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    medical_info: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
      get() {
        const rawValue = this.getDataValue("medical_info");
        if (!rawValue || rawValue === "{}") return {};

        try {
          // اگر مقدار string هست، parse کن
          if (typeof rawValue === "string") {
            return JSON.parse(rawValue);
          }
          // اگر object هست، مستقیم برگردون
          return rawValue;
        } catch (error) {
          console.error("Error parsing medical_info:", error);
          return {};
        }
      },
      set(value) {
        try {
          // اگر مقدار null یا undefined هست، "{}" بذار
          if (!value) {
            this.setDataValue("medical_info", "{}");
          }
          // اگر مقدار string هست و از قبل JSON هست، مستقیم بذار
          else if (typeof value === "string") {
            // چک کن valid JSON هست
            JSON.parse(value); // فقط برای validation
            this.setDataValue("medical_info", value);
          }
          // اگر object هست، stringify کن
          else {
            this.setDataValue("medical_info", JSON.stringify(value));
          }
        } catch (error) {
          console.error("Error setting medical_info:", error);
          this.setDataValue("medical_info", "{}");
        }
      },
      field: "medical_info",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    is_verified: {
      // اضافه شد - برای تأیید شماره تلفن
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },
    verification_code: {
      // اضافه شد - کد SMS
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "verification_code",
    },
    verification_code_expires: {
      // اضافه شد - تاریخ انقضای کد
      type: DataTypes.DATE,
      allowNull: true,
      field: "verification_code_expires",
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "therapist"),
      defaultValue: "user",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// متد برای مقایسه پسورد
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// متد برای ایجاد verification code
User.prototype.generateVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 رقم
  this.verification_code = code;
  this.verification_code_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقیقه
  return code;
};

// متد برای بررسی verification code
User.prototype.verifyCode = function (code) {
  if (!this.verification_code || !this.verification_code_expires) {
    return false;
  }

  const now = new Date();
  if (now > this.verification_code_expires) {
    return false; // کد منقضی شده
  }

  return this.verification_code === code;
};

// در انتهای فایل User.js، قبل از module.exports، این کد را اضافه کنید:

// تعریف رابطه‌ها
User.associate = (models) => {
  User.hasMany(models.Appointment, {
    foreignKey: "user_id",
    as: "appointments",
  });
  User.hasMany(models.Appointment, {
    foreignKey: "therapist_id",
    as: "therapist_appointments",
  });
  User.hasMany(models.Review, {
    foreignKey: "user_id",
    as: "reviews",
  });
  User.hasMany(models.Notification, {
    foreignKey: "user_id",
    as: "notifications",
  });
};

module.exports = User;

module.exports = User;
