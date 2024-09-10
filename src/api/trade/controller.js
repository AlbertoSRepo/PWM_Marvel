// src/api/trades/controller.js
import tradeService from './service.js';

class TradeController {
    async createTrade(req, res, next) {
        try {
            const { proposed_cards } = req.body;
            const trade = await tradeService.createTrade(req.user.userId, proposed_cards);
            res.status(201).json(trade);
        } catch (error) {
            next(error);
        }
    }

    async addOffer(req, res, next) {
        try {
            const { tradeId } = req.params;
            const { offered_cards } = req.body;
            const trade = await tradeService.addOffer(tradeId, req.user.userId, offered_cards);
            res.status(201).json(trade);
        } catch (error) {
            next(error);
        }
    }

    async acceptOffer(req, res, next) {
        try {
            const { tradeId, offerId } = req.params;
            const result = await tradeService.acceptOffer(tradeId, offerId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new TradeController();
