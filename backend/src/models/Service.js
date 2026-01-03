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
    duration: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
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

module.exports = Service;
