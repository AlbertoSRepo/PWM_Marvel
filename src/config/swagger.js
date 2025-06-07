// src/config/swagger.js

import swaggerJsdoc from 'swagger-jsdoc';
import { allValidationSchemas } from '../api/shared/validation/schemas.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marvel Trading Card API',
      version: '1.0.0',
      description: 'API documentation for the Marvel Trading Card application',
      contact: {
        name: 'Marvel Trading Card Team',
        email: 'support@marveltrading.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://production-domain.com/api',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwtToken'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { 
              type: 'string',
              description: 'Unique identifier for the user'
            },
            username: { 
              type: 'string',
              description: 'Unique username'
            },
            email: { 
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            favorite_superhero: { 
              type: 'string',
              description: 'User\'s favorite superhero'
            },
            credits: { 
              type: 'integer',
              minimum: 0,
              description: 'User\'s virtual credits'
            },
            album: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AlbumCard'
              },
              description: 'User\'s card collection'
            }
          },
          required: ['username', 'email', 'favorite_superhero'],
          example: {
            _id: '60d5ec49b60e3f4d9c31a2b8',
            username: 'JohnDoe',
            email: 'johndoe@example.com',
            favorite_superhero: 'Spider-Man',
            credits: 10,
            album: []
          }
        },
        AlbumCard: {
          type: 'object',
          properties: {
            card_id: {
              type: 'integer',
              description: 'Marvel character ID'
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Number of cards owned'
            },
            available_quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Number of cards available for trade'
            }
          },
          required: ['card_id', 'quantity', 'available_quantity'],
          example: {
            card_id: 1009368,
            quantity: 3,
            available_quantity: 1
          }
        },
        Card: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Marvel character ID'
            },
            name: {
              type: 'string',
              description: 'Character name'
            },
            description: {
              type: 'string',
              description: 'Character description'
            },
            thumbnail: {
              $ref: '#/components/schemas/Thumbnail'
            }
          },
          required: ['id', 'name'],
          example: {
            id: 1009368,
            name: 'Iron Man',
            description: 'Wounded, captured and forced to build a weapon by his enemies...',
            thumbnail: {
              path: 'http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55',
              extension: 'jpg'
            }
          }
        },
        Thumbnail: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              format: 'uri',
              description: 'Image path URL'
            },
            extension: {
              type: 'string',
              enum: ['jpg', 'jpeg', 'png', 'gif'],
              description: 'Image file extension'
            }
          },
          required: ['path', 'extension']
        },
        Trade: {
          type: 'object',
          properties: {
            _id: { 
              type: 'string',
              description: 'Unique trade identifier'
            },
            proposer_id: { 
              type: 'string',
              description: 'ID of user proposing the trade'
            },
            proposed_cards: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TradeCard'
              },
              description: 'Cards offered in the trade'
            },
            status: { 
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'cancelled'],
              description: 'Current status of the trade'
            },
            offers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Offer'
              },
              description: 'Offers received for this trade'
            },
            created_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Trade creation timestamp'
            },
            updated_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Trade last update timestamp'
            }
          },
          required: ['proposer_id', 'proposed_cards', 'status'],
          example: {
            _id: '60d5ec49b60e3f4d9c31a2b8',
            proposer_id: '60d5ec49b60e3f4d9c31a2b7',
            proposed_cards: [
              { card_id: 123, quantity: 2 }
            ],
            status: 'pending',
            offers: [],
            created_at: '2024-09-10T08:00:00.000Z',
            updated_at: '2024-09-10T09:00:00.000Z'
          }
        },
        TradeCard: {
          type: 'object',
          properties: {
            card_id: {
              type: 'integer',
              description: 'Marvel character ID'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Number of cards in the trade'
            }
          },
          required: ['card_id', 'quantity'],
          example: {
            card_id: 1009368,
            quantity: 2
          }
        },
        Offer: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique offer identifier'
            },
            user_id: {
              type: 'string',
              description: 'ID of user making the offer'
            },
            offered_cards: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TradeCard'
              },
              description: 'Cards offered by the user'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Offer creation timestamp'
            }
          },
          required: ['user_id', 'offered_cards'],
          example: {
            _id: '60d5ec49b60e3f4d9c31a2c1',
            user_id: '60d5ec49b60e3f4d9c31a2b9',
            offered_cards: [
              { card_id: 456, quantity: 1 }
            ],
            created_at: '2024-09-10T09:00:00.000Z'
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          },
          required: ['message'],
          example: {
            message: 'User not found',
            statusCode: 404
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          },
          required: ['message'],
          example: {
            message: 'Operation completed successfully'
          }
        },
        // Aggiungi riferimenti ai schema di validazione
        UserRegistrationRequest: allValidationSchemas.user.register,
        UserLoginRequest: allValidationSchemas.user.login,
        UserUpdateRequest: allValidationSchemas.user.update,
        CreateTradeRequest: allValidationSchemas.trade.createTrade,
        MakeOfferRequest: allValidationSchemas.trade.makeOffer,
        GetCardsByIdsRequest: allValidationSchemas.album.getCardsByIds,
        BuyCreditsRequest: allValidationSchemas.buy.buyCredits,
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Accesso negato, nessun token fornito',
                statusCode: 401
              }
            }
          }
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Resource not found',
                statusCode: 404
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Validation failed',
                error: 'Email is required',
                statusCode: 400
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Internal server error',
                statusCode: 500
              }
            }
          }
        }
      },
      parameters: {
        PageNumber: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        Limit: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 18
          }
        },
        Offset: {
          name: 'offset',
          in: 'query',
          description: 'Number of items to skip',
          required: false,
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0
          }
        },
        TradeId: {
          name: 'tradeId',
          in: 'path',
          description: 'Unique identifier for the trade',
          required: true,
          schema: {
            type: 'string'
          }
        },
        OfferId: {
          name: 'offerId',
          in: 'path',
          description: 'Unique identifier for the offer',
          required: true,
          schema: {
            type: 'string'
          }
        }
      }
    },
    security: [
      {
        cookieAuth: []
      }
    ],
  },
  apis: ['./src/api/**/*.js'], // Files containing Swagger annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
