// src/loaders/expressLoader.js
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';
import userRoutes from '../api/users/route.js';
import albumRoutes from '../api/album/route.js';
import tradeRoutes from '../api/trade/route.js';
import errorHandler from '../middlewares/errorHandler.js';

// Helper to get the current directory for serving HTML files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async ({ app }) => {
  app.use(cors());
  app.use(express.json());

  // Serve static HTML files from the 'public' folder
  app.use(express.static(path.join(__dirname, '../../client')));

  // API documentation setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Load API routes
  app.use('/api/users', userRoutes);
  app.use('/api/album', albumRoutes);
  app.use('/api/trade', tradeRoutes);

  // HTML routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/home/home.html'));
  });

  app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/home/home.html'));
  });

  app.get('/buy', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/buy/buy.html'));
  });

  app.get('/album', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/album/album.html'));
  });

  app.get('/trade', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/trade/trade.html'));
  });

  // Error Handler (should be the last middleware)
  app.use(errorHandler);
};