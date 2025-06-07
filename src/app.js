// src/app.js
import express from 'express';
import expressApp from './loaders/expressLoader.js';
import dbConnection from './loaders/dbLoader.js';
import { createIndexes, checkDatabaseHealth } from './api/shared/database/indexes.js';

const startServer = async () => {
  const app = express();

  try {
    // 1. Connessione al database
    console.log('Connecting to database...');
    await dbConnection();

    // 2. Verifica salute del database
    console.log('Checking database health...');
    const healthCheck = await checkDatabaseHealth();
    if (healthCheck.status !== 'healthy') {
      throw new Error(`Database health check failed: ${healthCheck.error}`);
    }

    // 3. Crea indici (se non esistono)
    console.log('Creating database indexes...');
    await createIndexes();

    // 4. Carica Express app
    console.log('Loading Express application...');
    await expressApp({ app });

    console.log('Server setup completed successfully');
    return app;

  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
};

export default startServer;