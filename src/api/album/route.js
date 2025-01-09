import express from 'express';
import albumController from './controller.js';
import authenticateJWTMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /album/initialData:
 *   get:
 *     summary: Retrieve main figurine data from a JSON file
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []  # JWT token is required
 *     responses:
 *       200:
 *         description: Returns the main figurine data in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 figurines:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/initialData',authenticateJWTMiddleware, albumController.getInitialData);

/**
 * @swagger
 * /album/cardsByIds:
 *   post:
 *     summary: Given an array of card IDs, returns the user quantity/credits
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Array of { id, quantity } plus user credits
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/cardsByIds', authenticateJWTMiddleware, albumController.getCardsByIds);

/**
 * @swagger
 * /album/possessed:
 *   get:
 *     summary: Return a limited set of possessed cards in ascending order
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of cards to return
 *         required: false
 *         default: 28
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset (0 means start from first)
 *         required: false
 *         default: 0
 *     responses:
 *       200:
 *         description: Array of possessed cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       quantity:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/possessed', authenticateJWTMiddleware, albumController.getPossessedCards);


/**
 * @swagger
 * /album/trade/cards:
 *   get:
 *     summary: Retrieve 28 owned cards for a specific page for trade proposals
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []  # JWT token is required
 *     parameters:
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         required: true
 *         description: The page number to retrieve owned cards from
 *     responses:
 *       200:
 *         description: A list of 28 owned cards for the specified page
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the card
 *                   name:
 *                     type: string
 *                     description: The name of the character associated with the card
 *                   quantity:
 *                     type: integer
 *                     description: The quantity of this card in the user's album
 *                   thumbnail:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         description: The URL path of the card's thumbnail
 *                       extension:
 *                         type: string
 *                         description: The file extension for the card's thumbnail image
 *                   state:
 *                     type: string
 *                     description: Ownership state (e.g., "posseduta")
 *       400:
 *         description: Invalid request
 *       404:
 *         description: No owned cards found for the specified page
 *       500:
 *         description: Server error
 */
router.get('/trade/cards', authenticateJWTMiddleware, albumController.getCardsForPageTrade);

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

export default router;
