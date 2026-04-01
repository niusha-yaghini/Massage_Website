"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ============ ایجاد جدول users ============
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: "full_name",
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field: "birth_date",
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: true,
      },
      job: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      medical_info: {
        type: Sequelize.TEXT,
        defaultValue: "{}",
        field: "medical_info",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "updated_at",
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: "is_verified",
      },
      verification_code: {
        type: Sequelize.STRING(6),
        allowNull: true,
        field: "verification_code",
      },
      verification_code_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "verification_code_expires",
      },
      role: {
        type: Sequelize.ENUM("user", "admin", "therapist"),
        defaultValue: "user",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
    });

    // ایجاد ایندکس‌ها برای users
    await queryInterface.addIndex("users", ["phone"], {
      unique: true,
      name: "users_phone_unique",
    });
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "users_email_unique",
      where: { email: { [Sequelize.Op.not]: null } },
    });

    // ============ ایجاد جدول services ============
    await queryInterface.createTable("services", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "duration_minutes",
      },
      price: {
        type: Sequelize.DECIMAL(10, 0),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM("آرامش‌بخش", "انرژی‌بخش", "درمانی", "ویژه"),
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING(50),
        defaultValue: "FiUser",
      },
      image_url: {
        type: Sequelize.STRING(255),
        defaultValue: "",
        field: "image_url",
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "updated_at",
      },
    });

    // ============ ایجاد جدول appointments ============
    await queryInterface.createTable("appointments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "user_id",
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "service_id",
      },
      appointment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        field: "appointment_date",
      },
      appointment_time: {
        type: Sequelize.STRING(10),
        allowNull: false,
        field: "appointment_time",
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "confirmed",
          "completed",
          "cancelled",
          "expired"
        ),
        defaultValue: "pending",
      },
      notes: {
        type: Sequelize.TEXT,
        defaultValue: "",
      },
      therapist_notes: {
        type: Sequelize.TEXT,
        defaultValue: "",
        field: "therapist_notes",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 },
      },
      user_review: {
        type: Sequelize.TEXT,
        defaultValue: "",
        field: "user_review",
      },
      therapist_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "therapist_id",
      },
      appointment_code: {
        type: Sequelize.STRING(20),
        unique: true,
        field: "appointment_code",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "updated_at",
      },
    });

    // ایجاد ایندکس‌ها برای appointments
    await queryInterface.addIndex(
      "appointments",
      ["appointment_date", "appointment_time"],
      {
        name: "appointments_date_time_idx",
      }
    );
    await queryInterface.addIndex("appointments", ["user_id"], {
      name: "appointments_user_id_idx",
    });
    await queryInterface.addIndex("appointments", ["status"], {
      name: "appointments_status_idx",
    });

    // ============ ایجاد جدول reviews ============
    await queryInterface.createTable("reviews", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "user_id",
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING(255),
        defaultValue: "",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: "is_approved",
      },
      is_rejected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: "is_rejected",
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "services",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "service_id",
      },
      appointment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "appointments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        field: "appointment_id",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "updated_at",
      },
    });

    // ایجاد ایندکس‌ها برای reviews
    await queryInterface.addIndex("reviews", ["user_id"], {
      name: "reviews_user_id_idx",
    });
    await queryInterface.addIndex("reviews", ["is_approved"], {
      name: "reviews_is_approved_idx",
    });

    // ============ ایجاد جدول notifications ============
    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        field: "user_id",
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          "appointment_cancelled",
          "appointment_changed",
          "review_received",
          "review_approved",
          "therapist_note",
          "appointment_reminder",
          "new_appointment_request",
          "appointment_confirmation"
        ),
        defaultValue: "appointment_cancelled",
      },
      related_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: "is_read",
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "read_at",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "updated_at",
      },
    });

    // ایجاد ایندکس‌ها برای notifications
    await queryInterface.addIndex("notifications", ["user_id"], {
      name: "notifications_user_id_idx",
    });
    await queryInterface.addIndex("notifications", ["is_read"], {
      name: "notifications_is_read_idx",
    });
    await queryInterface.addIndex("notifications", ["type"], {
      name: "notifications_type_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    // حذف جداول به ترتیب معکوس (به دلیل foreign key constraints)
    await queryInterface.dropTable("notifications");
    await queryInterface.dropTable("reviews");
    await queryInterface.dropTable("appointments");
    await queryInterface.dropTable("services");
    await queryInterface.dropTable("users");
  },
};
