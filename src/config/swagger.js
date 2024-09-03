// src/config/swagger.js

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marvel Trading Card API',
      version: '1.0.0',
      description: 'API documentation for the Marvel Trading Card application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/**/*.js'], // Files containing Swagger annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;