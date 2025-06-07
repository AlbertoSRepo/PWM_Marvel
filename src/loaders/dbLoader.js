// src/loaders/dbLoader.js
import { MongoClient } from 'mongodb';
import config from '../config/database.js';

let db = null;
let client = null;

const dbConnectionLoader = async () => {
  try {
    client = new MongoClient(config.mongoURI);
    await client.connect();
    db = client.db('marvel_cards'); // Nome del database
    console.log('MongoDB connected');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Funzione per ottenere l'istanza del database
export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call dbConnectionLoader first.');
  }
  return db;
};

// Funzione per chiudere la connessione
export const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
};

export default dbConnectionLoader;