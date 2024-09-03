// src/app.js
import express from 'express';
import expressLoader from './loaders/expressLoader.js';
import mongooseLoader from './loaders/mongooseLoader.js';

const startServer = async () => {
  const app = express();

  // Loaders
  await mongooseLoader();
  await expressLoader({ app });

  return app;
};

export default startServer;
