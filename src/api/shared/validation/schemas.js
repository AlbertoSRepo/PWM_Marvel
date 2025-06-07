/**
 * Schema di validazione centralizzati per l'applicazione Marvel Trading Card
 * Questi schema sono utilizzati sia per la validazione dei dati che per la documentazione Swagger
 */

export const userValidationSchemas = {
  register: {
    type: 'object',
    required: ['username', 'email', 'password', 'favorite_superhero'],
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 30,
        pattern: '^[a-zA-Z0-9_]+$',
        description: 'Username deve contenere solo lettere, numeri e underscore'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Indirizzo email valido'
      },
      password: {
        type: 'string',
        minLength: 6,
        maxLength: 100,
        description: 'Password deve essere di almeno 6 caratteri'
      },
      favorite_superhero: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Nome del supereroe preferito'
      }
    },
    additionalProperties: false
  },
  
  login: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Indirizzo email registrato'
      },
      password: {
        type: 'string',
        minLength: 1,
        description: 'Password dell\'utente'
      }
    },
    additionalProperties: false
  },
  
  update: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 30,
        pattern: '^[a-zA-Z0-9_]+$',
        description: 'Nuovo username (opzionale)'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Nuovo indirizzo email (opzionale)'
      },
      password: {
        type: 'string',
        minLength: 6,
        maxLength: 100,
        description: 'Nuova password (opzionale)'
      },
      favorite_superhero: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Nuovo supereroe preferito (opzionale)'
      }
    },
    additionalProperties: false,
    minProperties: 1,
    description: 'Almeno un campo deve essere fornito per l\'aggiornamento'
  }
};

export const tradeValidationSchemas = {
  createTrade: {
    type: 'object',
    required: ['proposed_cards'],
    properties: {
      proposed_cards: {
        type: 'array',
        minItems: 1,
        maxItems: 10,
        description: 'Liste delle carte proposte per lo scambio',
        items: {
          type: 'object',
          required: ['card_id', 'quantity'],
          properties: {
            card_id: {
              type: 'integer',
              minimum: 1,
              description: 'ID della carta Marvel'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Quantità di carte da scambiare'
            }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  },
  
  makeOffer: {
    type: 'object',
    required: ['offered_cards'],
    properties: {
      offered_cards: {
        type: 'array',
        minItems: 1,
        maxItems: 10,
        description: 'Liste delle carte offerte per lo scambio',
        items: {
          type: 'object',
          required: ['card_id', 'quantity'],
          properties: {
            card_id: {
              type: 'integer',
              minimum: 1,
              description: 'ID della carta Marvel'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Quantità di carte da offrire'
            }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  }
};

export const albumValidationSchemas = {
  getCardsByIds: {
    type: 'object',
    required: ['cardIds'],
    properties: {
      cardIds: {
        type: 'array',
        minItems: 1,
        maxItems: 100,
        description: 'Array di ID delle carte da recuperare',
        items: {
          type: 'integer',
          minimum: 1,
          description: 'ID della carta Marvel'
        },
        uniqueItems: true
      }
    },
    additionalProperties: false
  },
  
  sellCard: {
    type: 'object',
    required: ['cardId'],
    properties: {
      cardId: {
        type: 'integer',
        minimum: 1,
        description: 'ID della carta da vendere'
      }
    },
    additionalProperties: false
  },
  
  paginationQuery: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Numero della pagina'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 18,
        description: 'Numero di elementi per pagina'
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Numero di elementi da saltare'
      }
    },
    additionalProperties: false
  }
};

export const buyValidationSchemas = {
  buyCredits: {
    type: 'object',
    required: ['credits'],
    properties: {
      credits: {
        type: 'integer',
        minimum: 1,
        maximum: 99,
        description: 'Numero di crediti da acquistare'
      }
    },
    additionalProperties: false
  },
  
  buyPacket: {
    type: 'object',
    properties: {
      packetType: {
        type: 'string',
        enum: ['standard', 'premium'],
        default: 'standard',
        description: 'Tipo di pacchetto da acquistare'
      }
    },
    additionalProperties: false
  }
};

// Schema per la validazione degli ID di database
export const commonValidationSchemas = {
  mongoObjectId: {
    type: 'string',
    pattern: '^[0-9a-fA-F]{24}$',
    description: 'ID MongoDB valido (24 caratteri esadecimali)'
  },
  
  marvelCharacterId: {
    type: 'integer',
    minimum: 1,
    description: 'ID del personaggio Marvel'
  }
};

// Funzioni di utilità per la validazione
export const validationUtils = {
  /**
   * Verifica se un ID è un ObjectId MongoDB valido
   */
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },
  
  /**
   * Verifica se un array contiene solo elementi unici
   */
  hasUniqueElements: (array) => {
    return array.length === new Set(array).size;
  },
  
  /**
   * Sanitizza una stringa rimuovendo caratteri pericolosi
   */
  sanitizeString: (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>\"']/g, '');
  },
  
  /**
   * Valida un indirizzo email
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Esporta tutti gli schema in un oggetto centralizzato
export const allValidationSchemas = {
  user: userValidationSchemas,
  trade: tradeValidationSchemas,
  album: albumValidationSchemas,
  buy: buyValidationSchemas,
  common: commonValidationSchemas
};

export default allValidationSchemas;