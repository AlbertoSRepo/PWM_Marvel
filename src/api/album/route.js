import express from 'express';
import albumController from './controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /album/cards:
 *   get:
 *     summary: Retrieve cards for a specific album page
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []  # JWT token is required
 *     parameters:
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         required: true
 *         description: The page number of the album to retrieve cards from
 *       - in: query
 *         name: cards_per_page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of cards to retrieve per page (default is 15)
 *       - in: query
 *         name: only_owned
 *         schema:
 *           type: boolean
 *         required: false
 *         description: If true, only return owned cards (quantity > 0). Default is false
 *     responses:
 *       200:
 *         description: A list of cards for the specified page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: The page number
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the card
 *                       name:
 *                         type: string
 *                         description: The name of the character associated with the card
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of this card in the user's album
 *                       available_quantity:
 *                         type: integer
 *                         description: The available quantity of this card in the user's album
 *                       state:
 *                         type: string
 *                         description: The ownership state of the card (e.g., "posseduta", "non posseduta")
 *                       thumbnail:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: string
 *                             description: The URL path of the card's thumbnail
 *                           extension:
 *                             type: string
 *                             description: The file extension for the card's thumbnail image
 *                       details:
 *                         type: object
 *                         description: Additional details about the character, fetched from the Marvel API
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found or no cards available on the specified page
 */
router.get('/cards', authenticateJWT, albumController.getAlbumPage);

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
router.get('/trade/cards', authenticateJWT, albumController.getCardsForPageTrade);

/**
 * @swagger
 * /album/search:
 *   get:
 *     summary: Search for cards by character name
 *     tags: [Album]
 *     security:
 *       - bearerAuth: []  # JWT token is required
 *     parameters:
 *       - in: query
 *         name: name_starts_with
 *         schema:
 *           type: string
 *         required: true
 *         description: The string that the character names start with
 *     responses:
 *       200:
 *         description: A list of cards matching the search string that the user owns
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
 *                   available_quantity:
 *                     type: integer
 *                     description: The available quantity of this card in the user's album
 *                   details:
 *                     type: object
 *                     description: Additional details about the character, fetched from the Marvel API
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found or no matching characters available
 */
router.get('/search', authenticateJWT, albumController.searchCards);

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
router.get('/characters/:characterId', authenticateJWT, albumController.getCharacterDetails);

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
router.put('/sell/:cardId', authenticateJWT, albumController.sellCard);

export default router;
