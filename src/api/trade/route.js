// src/api/trades/route.js
import express from 'express';
import tradeController from './controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

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
router.get('/', authenticateJWT, tradeController.getAllTrades);  // Nuova rotta per recuperare tutte le proposte


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
router.post('/', authenticateJWT, tradeController.createTrade);

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
router.post('/:tradeId/offers', authenticateJWT, tradeController.addOffer);

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
router.put('/:tradeId/offers/:offerId/accept', authenticateJWT, tradeController.acceptOffer);

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
router.get('/user/proposals', authenticateJWT, tradeController.getUserProposals);

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
router.get('/user/offers', authenticateJWT, tradeController.getUserOffers);

export default router;
