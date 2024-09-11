// src/api/trades/service.js
import { Trade } from './model.js';
import { User } from '../users/model.js';

class TradeService {
    // Funzione per recuperare tutte le proposte di trade
    async getAllTrades() {
        try {
            // Recupera tutte le proposte di trade e popola il campo proposer_id con l'username dell'utente
            const trades = await Trade.find({})
                .populate('proposer_id', 'username'); // Popola con il campo username dell'utente

            return trades.map(trade => ({
                _id: trade._id,
                proposer: trade.proposer_id.username,  // Includi l'username
                proposed_cards: trade.proposed_cards,
                status: trade.status,
                offers: trade.offers,
                created_at: trade.created_at.toLocaleString(),  // Formatta la data
            }));
        } catch (error) {
            throw new Error('Errore durante il recupero delle proposte di trade.');
        }
    }

// Funzione per creare una nuova proposta di trade
async createTrade(proposerId, proposedCards) {
    const proposer = await User.findById(proposerId);
    if (!proposer) throw new Error('User not found');
  
    // Mostra tutti gli ID delle carte presenti nell'album dell'utente
    console.log("ID delle carte presenti nell'album dell'utente:", proposer.album.map(c => c.card_id));
  
    // Verifica e aggiorna l'available_quantity delle carte proposte
    proposedCards.forEach(card => {
      // Confronta gli ID come numeri per evitare problemi di tipo
      const albumCard = proposer.album.find(c => Number(c.card_id) === Number(card.card_id));
  
      // Debug per vedere se la carta è trovata e qual è il suo stato
      if (albumCard) {
        console.log(`Trovata carta: ${albumCard.card_id}, available_quantity: ${albumCard.available_quantity}`);
      } else {
        console.log(`Carta con ID ${card.card_id} non trovata nell'album`);
      }
  
      // Verifica se la carta non esiste o non ha quantità disponibile sufficiente
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
        await Trade.deleteOne({ _id: tradeId });  // Usa deleteOne per eliminare il trade
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

    // Ottenere le proposte fatte dall'utente
    async getProposalsByUser(userId) {
        const userProposals = await Trade.find({ proposer_id: userId });
        return userProposals;
    }

    // Ottenere le offerte fatte dall'utente
    async getOffersByUser(userId) {
        const userOffers = await Trade.find({ 'offers.user_id': userId });
        return userOffers;
    }
}

export default new TradeService();
