const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const KEY = process.env.DB_KEY;

    await mongoose.connect(KEY, {
      dbName: "Database",
    });
    console.log("connected to mongoDB");
  } catch (err) {
    console.error("failed to connect to mongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;
