// src/api/trades/route.js
import express from 'express';
import tradeController from './controller.js';
import authenticateJWTMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/trade:
 *   get:
 *     summary: Get all trade proposals (community)
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of all trade proposals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Trade ID
 *                   proposer:
 *                     type: string
 *                     description: Proposer user ID
 *                   offeredCards:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         card_id:
 *                           type: number
 *                         quantity:
 *                           type: number
 *                   requestedCards:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         card_id:
 *                           type: number
 *                         quantity:
 *                           type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateJWTMiddleware, tradeController.getAllTrades);  // Nuova rotta per recuperare tutte le proposte


/**
 * @swagger
 * /trade:
 *   post:
 *     summary: Create a new trade proposal
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proposed_cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     card_id:
 *                       type: number
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Trade created successfully
 */
router.post('/', authenticateJWTMiddleware, tradeController.createTrade);

/**
 * @swagger
 * /trade/{tradeId}/offers:
 *   post:
 *     summary: Add an offer to a trade
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offered_cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     card_id:
 *                       type: number
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Offer added successfully
 */
router.post('/:tradeId/offers', authenticateJWTMiddleware, tradeController.addOffer);

/**
 * @swagger
 * /trade/{tradeId}/offers/{offerId}/accept:
 *   put:
 *     summary: Accept an offer for a trade and complete the exchange
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trade
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the offer
 *     responses:
 *       200:
 *         description: Trade accepted and completed successfully
 */
router.put('/:tradeId/offers/:offerId/accept', authenticateJWTMiddleware, tradeController.acceptOffer);

/**
 * @swagger
 * /trade/user/proposals:
 *   get:
 *     summary: Get the trade proposals made by the logged-in user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of trade proposals made by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Trade ID
 *                   offered_cards:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         card_id:
 *                           type: number
 *                         quantity:
 *                           type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user/proposals', authenticateJWTMiddleware, tradeController.getUserProposals);

/**
 * @swagger
 * /trade/user/offers:
 *   get:
 *     summary: Get the trade offers made by the logged-in user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of trade offers made by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Trade offer ID
 *                   proposalId:
 *                     type: string
 *                     description: The ID of the trade proposal the user made an offer on
 *                   offered_cards:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         card_id:
 *                           type: number
 *                         quantity:
 *                           type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user/offers', authenticateJWTMiddleware, tradeController.getUserOffers);

/**
 * @swagger
 * /trade/offers/{offerId}:
 *   delete:
 *     summary: Delete an offer made by the user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the offer to delete
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *       401:
 *         description: Unauthorized. User is not allowed to delete this offer.
 *       404:
 *         description: Offer or trade not found
 *       500:
 *         description: Server error
 */
// Route per cancellare un'offerta fatta dall'utente all'interno di una proposta di trade
router.delete('/offers/:offerId', authenticateJWTMiddleware, tradeController.deleteOffer);

/**
 * @swagger
 * /trade/{tradeId}:
 *   delete:
 *     summary: Delete a trade proposal made by the user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trade proposal to delete
 *     responses:
 *       200:
 *         description: Trade proposal deleted successfully
 *       401:
 *         description: Unauthorized. User is not allowed to delete this proposal.
 *       404:
 *         description: Trade proposal not found
 *       500:
 *         description: Server error
 */
// Route per cancellare una proposta di trade
router.delete('/:tradeId', authenticateJWTMiddleware, tradeController.deleteTrade);

/**
 * @swagger
 * /trade/user/proposals/{tradeId}:
 *   get:
 *     summary: Get a single trade proposal made by the user
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trade proposal to retrieve
 *     responses:
 *       200:
 *         description: Trade proposal retrieved successfully
 *       401:
 *         description: Unauthorized. User is not allowed to view this proposal.
 *       404:
 *         description: Trade proposal not found
 *       500:
 *         description: Server error
 */
// Route per ottenere una singola proposta di trade dell'utente loggato
router.get('/user/proposals/:tradeId', authenticateJWTMiddleware, tradeController.getUserProposal);

/**
 * @swagger
 * /trade/cards/details:
 *   post:
 *     summary: Get details of multiple offered cards
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_offerta:
 *                       type: string
 *                       description: The ID of the offer
 *                     idCarte:
 *                       type: array
 *                       items:
 *                         type: number
 *                       description: The IDs of the cards in the offer
 *     responses:
 *       200:
 *         description: Returns detailed information for the offered cards
 *       400:
 *         description: Invalid input format
 *       500:
 *         description: Server error
 */
// Route per ottenere i dettagli di un gruppo di carte offerte
router.post('/cards/details', authenticateJWTMiddleware, tradeController.getOfferedCardsDetails);

/**
 * @swagger
 * /trade/{tradeId}/details:
 *   get:
 *     summary: Get details of a specific trade proposal
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tradeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trade proposal to retrieve
 *     responses:
 *       200:
 *         description: Trade proposal details retrieved successfully
 *       404:
 *         description: Trade proposal not found
 *       500:
 *         description: Server error
 */
// Route per ottenere i dettagli di una proposta specifica (per tutti gli utenti)
router.get('/:tradeId/details', authenticateJWTMiddleware, tradeController.getTradeDetails);


/**
 * @swagger
 * /trade/offers/{offerId}/details:
 *   get:
 *     summary: Get details of a specific offer
 *     tags: [Trade]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the offer
 *     responses:
 *       200:
 *         description: Offer details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Offer not found
 *       500:
 *         description: Server error
 */
// Endpoint per ottenere i dettagli di un'offerta specifica
router.get('/offers/:offerId/details', tradeController.getOfferDetails);

export default router;
