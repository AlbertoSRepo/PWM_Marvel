import express from 'express';
import albumController from './controller.js';
import authenticateJWTMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /album/initial-data:
 *   get:
 *     summary: Get initial data for the album
 *     tags: [Album]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Initial data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 figurineData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *                   description: Complete list of Marvel characters
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/initialData', authenticateJWTMiddleware, albumController.getInitialData);

/**
 * @swagger
 * /album/cards:
 *   post:
 *     summary: Get cards by IDs with user ownership information
 *     tags: [Album]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardIds
 *             properties:
 *               cardIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 maxItems: 100
 *                 description: Array of Marvel character IDs
 *                 example: [1009368, 1009220, 1009146]
 *     responses:
 *       200:
 *         description: Cards information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 credits:
 *                   type: integer
 *                   description: User's current credits
 *                   example: 150
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Character ID
 *                       quantity:
 *                         type: integer
 *                         description: Number of cards owned
 *                   example:
 *                     - id: 1009368
 *                       quantity: 3
 *                     - id: 1009220
 *                       quantity: 0
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /album/possessed:
 *   get:
 *     summary: Get paginated list of possessed cards
 *     tags: [Album]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Offset'
 *     responses:
 *       200:
 *         description: Possessed cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of possessed cards
 *                   example: 45
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Character ID
 *                       quantity:
 *                         type: integer
 *                         minimum: 1
 *                         description: Number of cards owned
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/possessed', authenticateJWTMiddleware, albumController.getPossessedCards);

/**
 * @swagger
 * /album/characters/{characterId}:
 *   get:
 *     summary: Retrieve complete character details
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []  # JWT token is required
 *     parameters:
 *       - in: path
 *         name: characterId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the character to retrieve details for
 *     responses:
 *       200:
 *         description: Detailed character information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the character
 *                 name:
 *                   type: string
 *                   description: The name of the character
 *                 description:
 *                   type: string
 *                   description: The description of the character
 *                 comics:
 *                   type: array
 *                   description: List of comics associated with the character
 *                 series:
 *                   type: array
 *                   description: List of series associated with the character
 *                 stories:
 *                   type: array
 *                   description: List of stories associated with the character
 *                 events:
 *                   type: array
 *                   description: List of events associated with the character
 */
router.get('/characters/:characterId', authenticateJWTMiddleware, albumController.getCharacterDetails);

/**
 * @swagger
 * /album/sell/{cardId}:
 *   put:
 *     summary: Sell a possessed card for 1 credit
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the card to sell
 *     responses:
 *       200:
 *         description: Card sold successfully and credit added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 result:
 *                   type: object
 *                   properties:
 *                     credits:
 *                       type: integer
 *                       description: Updated number of credits
 *                     cardSold:
 *                       type: string
 *                       description: The ID of the card that was sold
 *       404:
 *         description: User or card not found
 *       500:
 *         description: Server error
 */
// Route per vendere una carta posseduta
router.put('/sell/:cardId', authenticateJWTMiddleware, albumController.sellCard);


/**
 * @swagger
 * /album/cardsByIds:
 *   post:
 *     summary: Get cards by IDs with user ownership information
 *     tags: [Album]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardIds
 *             properties:
 *               cardIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 maxItems: 100
 *                 description: Array of Marvel character IDs
 *                 example: [1009368, 1009220, 1009146]
 *     responses:
 *       200:
 *         description: Cards information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 credits:
 *                   type: integer
 *                   description: User's current credits
 *                   example: 150
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Character ID
 *                       quantity:
 *                         type: integer
 *                         description: Number of cards owned
 *                       available_quantity:
 *                         type: integer
 *                         description: Available quantity for trading
 *                   example:
 *                     - id: 1009368
 *                       quantity: 3
 *                       available_quantity: 2
 *                     - id: 1009220
 *                       quantity: 0
 *                       available_quantity: 0
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/cardsByIds', authenticateJWTMiddleware, albumController.getCardsByIds);


export default router;
