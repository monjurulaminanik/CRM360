const mongoose = require('mongoose');
const logger = require('./logger');

const dbState = {
  isOffline: false
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    dbState.isOffline = false;
  } catch (error) {
    logger.error('MongoDB connection error (starting in offline/fallback mode):', error);
    dbState.isOffline = true;
  }
};

module.exports = { connectDB, dbState };
