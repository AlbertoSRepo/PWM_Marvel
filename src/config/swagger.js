//src/config/swagger.js
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            favorite_superhero: {
              type: 'string',
            },
            credits: {
              type: 'integer',
            },
          },
          example: {
            _id: '60d5ec49b60e3f4d9c31a2b8',
            username: 'JohnDoe',
            email: 'johndoe@example.com',
            favorite_superhero: 'Spider-Man',
            credits: 10,
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Applies to all endpoints unless overridden
      },
    ],
  },
  apis: ['./src/api/**/*.js'], // Files containing Swagger annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
