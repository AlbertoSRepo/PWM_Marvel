// src/api/trades/service.js
import { Trade } from './model.js';
import { User } from '../users/model.js';

class TradeService {
    // Crea una nuova proposta di trade
    async createTrade(proposerId, proposedCards) {
        const proposer = await User.findById(proposerId);
        if (!proposer) throw new Error('User not found');

        // Verifica e aggiorna l'available_quantity delle carte proposte
        proposedCards.forEach(card => {
            const albumCard = proposer.album.find(c => c.card_id === card.card_id);
            if (!albumCard || albumCard.available_quantity < card.quantity) {
                throw new Error(`Insufficient available quantity for card ID ${card.card_id}`);
            }
            albumCard.available_quantity -= card.quantity;
        });

        // Salva le modifiche dell'utente
        await proposer.save();

        // Crea la proposta di trade
        const trade = new Trade({
            proposer_id: proposerId,
            proposed_cards: proposedCards
        });
        await trade.save();

        return trade;
    }

    // Aggiungi un'offerta a una proposta di trade esistente
    async addOffer(tradeId, userId, offeredCards) {
        const trade = await Trade.findById(tradeId);
        if (!trade) throw new Error('Trade not found');

        const offerer = await User.findById(userId);
        if (!offerer) throw new Error('User not found');

        // Verifica e aggiorna l'available_quantity delle carte offerte
        offeredCards.forEach(card => {
            const albumCard = offerer.album.find(c => c.card_id === card.card_id);
            if (!albumCard || albumCard.available_quantity < card.quantity) {
                throw new Error(`Insufficient available quantity for card ID ${card.card_id}`);
            }
            albumCard.available_quantity -= card.quantity;
        });

        // Salva le modifiche dell'utente
        await offerer.save();

        // Aggiungi l'offerta alla proposta di trade
        trade.offers.push({
            user_id: userId,
            offered_cards: offeredCards
        });

        trade.updated_at = new Date();
        await trade.save();

        return trade;
    }

    // Accetta un'offerta e completa lo scambio
    async acceptOffer(tradeId, offerId) {
        const trade = await Trade.findById(tradeId);
        if (!trade) throw new Error('Trade not found');

        const offer = trade.offers.id(offerId);
        if (!offer) throw new Error('Offer not found');

        if (offer.status !== 'pending') {
            throw new Error('Offer is not pending');
        }

        // Effettua lo scambio tra il proponente e l'offerente
        await this.executeTrade(trade, offer);

        // Cancella la proposta e tutte le offerte correlate
        await trade.remove();
        return { message: 'Trade completed and removed from the system' };
    }

    // Logica dello scambio tra le due parti
    async executeTrade(trade, offer) {
        const proposer = await User.findById(trade.proposer_id);
        const offerer = await User.findById(offer.user_id);

        // Scambio delle carte proposte
        trade.proposed_cards.forEach(card => {
            const proposerCard = proposer.album.find(c => c.card_id === card.card_id);
            const offererCard = offerer.album.find(c => c.card_id === card.card_id);

            // Aggiorna la quantità del proponente
            proposerCard.quantity -= card.quantity;

            // Aggiorna la quantità dell'offerente
            if (offererCard) {
                offererCard.quantity += card.quantity;
            } else {
                offerer.album.push({
                    card_id: card.card_id,
                    quantity: card.quantity,
                    available_quantity: card.quantity
                });
            }
        });

        // Scambio delle carte offerte
        offer.offered_cards.forEach(card => {
            const offererCard = offerer.album.find(c => c.card_id === card.card_id);
            const proposerCard = proposer.album.find(c => c.card_id === card.card_id);

            // Aggiorna la quantità dell'offerente
            offererCard.quantity -= card.quantity;

            // Aggiorna la quantità del proponente
            if (proposerCard) {
                proposerCard.quantity += card.quantity;
            } else {
                proposer.album.push({
                    card_id: card.card_id,
                    quantity: card.quantity,
                    available_quantity: card.quantity
                });
            }
        });

        // Salva le modifiche degli utenti
        await proposer.save();
        await offerer.save();
    }
}

export default new TradeService();
