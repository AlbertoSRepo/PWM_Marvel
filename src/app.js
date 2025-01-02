// src/app.js
import express from 'express';
import expressApp from './loaders/expressLoader.js';
import dbConnection from './loaders/dbLoader.js';

const startServer = async () => {
  const app = express();

  // Loaders
  await dbConnection();
  await expressApp({ app });

  return app;
};

export default startServer;
