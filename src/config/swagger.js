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
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            favorite_superhero: { type: 'string' },
            credits: { type: 'integer' },
          },
          example: {
            _id: '60d5ec49b60e3f4d9c31a2b8',
            username: 'JohnDoe',
            email: 'johndoe@example.com',
            favorite_superhero: 'Spider-Man',
            credits: 10,
          },
        },
        Trade: {  // Add the Trade schema
          type: 'object',
          properties: {
            _id: { type: 'string' },
            proposer_id: { type: 'string' },
            receiver_id: { type: 'string' },
            proposed_cards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  card_id: { type: 'number' },
                  quantity: { type: 'number' }
                }
              }
            },
            requested_cards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  card_id: { type: 'number' },
                  quantity: { type: 'number' }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected']
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          example: {
            _id: '60d5ec49b60e3f4d9c31a2b8',
            proposer_id: '60d5ec49b60e3f4d9c31a2b7',
            receiver_id: '60d5ec49b60e3f4d9c31a2b9',
            proposed_cards: [
              { card_id: 123, quantity: 2 }
            ],
            requested_cards: [
              { card_id: 456, quantity: 1 }
            ],
            status: 'pending',
            created_at: '2024-09-10T08:00:00.000Z',
            updated_at: '2024-09-10T09:00:00.000Z'
          }
        }
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
