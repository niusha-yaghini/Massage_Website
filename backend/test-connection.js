// backend/test-connection.js
require("dotenv").config();
const mysql = require("mysql2/promise");

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME, // massage_db
    });

    console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);

    // تست query
    const [result] = await conn.execute('SELECT "Massage SPA DB" as test');
    console.log("Test query result:", result[0].test);

    // اطلاعات دیتابیس
    const [dbs] = await conn.execute("SHOW DATABASES");
    console.log("\n📊 Available databases:");
    dbs.forEach((db) => {
      const mark = db.Database === process.env.DB_NAME ? "✅" : "  ";
      console.log(`${mark} ${db.Database}`);
    });

    await conn.end();
    console.log("\n🎉 Ready to build the massage website!");
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.code === "ER_BAD_DB_ERROR") {
      console.log(`\n🔧 Database "${process.env.DB_NAME}" not found.`);
      console.log("Run in MySQL:");
      console.log(`  CREATE DATABASE ${process.env.DB_NAME};`);
    }
  }
}

test();
