const mongoose = require("mongoose");

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      family: 4,
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    await mongoose
      .connect(DATABASE_URL, DB_OPTIONS)
      .then(() => console.log("Database connected successfully!!"))
      .catch((error) => console.log(error));
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
