const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbName = process.env.MONGO_DB_NAME;
    const connection = await mongoose.connect(
      `${process.env.MONGO_URI}/${dbName}`
    );
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
