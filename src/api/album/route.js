// src/api/v1/album/route.js
import express from 'express';
import albumController from './controller.js';

const router = express.Router();

/**
 * @swagger
 * /album/cards:
 *   get:
 *     summary: Retrieve cards for a specific album page
 *     tags: [Album]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose album is being accessed
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
router.get('/cards', albumController.getAlbumPage);

/**
 * @swagger
 * /album/search:
 *   get:
 *     summary: Search for cards by character name
 *     tags: [Album]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose album is being searched
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
router.get('/search', albumController.searchCards);

export default router;