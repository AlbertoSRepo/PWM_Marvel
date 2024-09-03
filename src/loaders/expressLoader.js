// src/loaders/expressLoader.js

import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';
import userRoutes from '../api/users/route.js';
import albumRoutes from '../api/album/route.js';
import errorHandler from '../middlewares/errorHandler.js';

export default async ({ app }) => {
  app.use(cors());
  app.use(bodyParser.json());

  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Load API routes
  app.use('/api/users', userRoutes);

  app.use('/api/album', albumRoutes)

  // Error Handler (should be the last middleware)
  app.use(errorHandler);
};