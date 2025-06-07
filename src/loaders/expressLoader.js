// src/loaders/expressLoader.js
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';
import userRoutes from '../api/users/route.js';
import albumRoutes from '../api/album/route.js';
import tradeRoutes from '../api/trade/route.js';
import errorHandlerMiddleware from '../middlewares/errorHandler.js';
import authenticateJWTMiddleware  from '../middlewares/auth.js';
import dbService from '../api/shared/database/dbService.js';

// Helper to get the current directory for serving HTML files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressAppLoader = async ({ app }) => {
  // Inizializza il database service
  try {
    dbService.init();
    console.log('Database service initialized');
  } catch (error) {
    console.error('Failed to initialize database service:', error);
    throw error;
  }

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, '../../client')));

  // Swagger configuration con migliore gestione
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      requestSnippetsEnabled: true,
      requestSnippets: {
        generators: {
          curl_bash: {
            title: "cURL (bash)",
            syntax: "bash"
          },
          curl_powershell: {
            title: "cURL (PowerShell)",
            syntax: "powershell"
          },
          curl_cmd: {
            title: "cURL (CMD)",
            syntax: "cmd"
          }
        },
        defaultExpanded: true,
        languages: null
      }
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1976d2 }
    `,
    customSiteTitle: "Marvel Trading Card API Documentation"
  };

  // Swagger UI setup con opzioni personalizzate
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

  // Endpoint per ottenere lo schema JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use('/api/users', userRoutes);  
  app.use('/api/album', albumRoutes);
  app.use('/api/trade', tradeRoutes);

  app.get('/',authenticateJWTMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/home/home.html'));
  });

  app.get('/buy', authenticateJWTMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/buy/buy.html'));
  });

  app.get('/album', authenticateJWTMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/album/album.html'));
  });

  app.get('/trade', authenticateJWTMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/trade/trade.html'));
  });

  // Pagina per gli utenti non autenticati
  app.get('/homeNoLogin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/home/homeNoLogin.html'));
  });

  // Error Handler (should be the last middleware)
  app.use(errorHandlerMiddleware);
};

export default expressAppLoader;