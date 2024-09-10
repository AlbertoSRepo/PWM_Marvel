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

export default router;
