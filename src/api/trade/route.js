// src/api/trades/route.js
import express from 'express';
import tradeController from './controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

const router = express.Router();

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

export default router;
