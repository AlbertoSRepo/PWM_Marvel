// src/loaders/mongooseLoader.js
import mongoose from 'mongoose';
import config from '../config/database.js';

const dbConnectionLoader = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default dbConnectionLoader;