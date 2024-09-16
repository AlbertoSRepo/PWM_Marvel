// src/api/trades/service.js
import { Trade } from './model.js';
import { User } from '../users/model.js';
import { MD5 } from '../shared/utils/md5.js'; // Supponiamo che tu abbia già la funzione MD5
class TradeService {
  async getAllTrades(userId) {
    try {
      // Recupera tutte le proposte di trade, escludendo quelle fatte dall'utente loggato
      const trades = await Trade.find({ proposer_id: { $ne: userId } }) // Escludi le proposte dell'utente
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
    console.log("utete trovato:", offerer);

    // Verifica e aggiorna l'available_quantity delle carte offerte
    offeredCards.forEach(card => {
      const albumCard = offerer.album.find(c => Number(c.card_id) === Number(card.card_id));
      console.log(`albumCard: ${albumCard}`);
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

  async getOffersByUser(userId) {
    try {
      // Recupera tutte le proposte che contengono offerte fatte dall'utente loggato
      const userOffers = await Trade.find({ 'offers.user_id': userId });

      // Filtra le offerte per includere solo quelle fatte dall'utente loggato
      const filteredTrades = userOffers.map(trade => {
        const filteredOffers = trade.offers.filter(offer => offer.user_id.toString() === userId.toString()); // Confronta gli ID come stringhe

        return {
          _id: trade._id,
          proposer_id: trade.proposer_id,
          proposed_cards: trade.proposed_cards,
          status: trade.status,
          created_at: trade.created_at,
          offers: filteredOffers  // Include solo le offerte fatte dall'utente loggato
        };
      });

      return filteredTrades;
    } catch (error) {
      console.error('Errore durante il recupero delle offerte dell\'utente:', error);
      throw new Error('Errore durante il recupero delle offerte dell\'utente.');
    }
  }

  // Service: Funzione per cancellare un'offerta fatta dall'utente
  deleteOffer = async (userId, offerId) => {
    try {
      // Cerca la proposta che contiene l'offerta
      const trade = await Trade.findOne({ 'offers._id': offerId });

      if (!trade) {
        throw new Error('Proposta non trovata.');
      }

      // Cerca l'offerta specifica all'interno della proposta
      const offer = trade.offers.id(offerId);

      // Verifica che l'offerta appartenga all'utente loggato
      if (offer.user_id.toString() !== userId.toString()) {
        throw new Error('Non sei autorizzato a cancellare questa offerta.');
      }

      // Rimuovi l'offerta dall'array delle offerte
      trade.offers.pull({ _id: offerId });

      // Salva le modifiche nella proposta
      await trade.save();
    } catch (error) {
      console.error('Errore durante la cancellazione dell\'offerta:', error);
      throw new Error('Errore durante la cancellazione dell\'offerta.');
    }
  };
  // Service: Funzione per cancellare una proposta di trade
  deleteTrade = async (userId, tradeId) => {
    try {
      // Cerca la proposta di trade per ID e verifica che appartenga all'utente loggato
      const trade = await Trade.findOne({ _id: tradeId, proposer_id: userId });

      if (!trade) {
        throw new Error('Proposta non trovata o non autorizzato a cancellarla.');
      }

      // Cancella la proposta dal database
      await Trade.deleteOne({ _id: tradeId }); // Usa `deleteOne()` per cancellare la proposta

    } catch (error) {
      console.error('Errore durante la cancellazione della proposta:', error);
      throw new Error('Errore durante la cancellazione della proposta.');
    }
  };

  getUserProposal = async (userId, tradeId) => {
    try {
      // Cerca la proposta di trade per ID e verifica che appartenga all'utente loggato
      const trade = await Trade.findOne({ _id: tradeId, proposer_id: userId });

      if (!trade) {
        throw new Error('Proposta non trovata o non autorizzato a visualizzarla.');
      }

      return trade;
    } catch (error) {
      console.error('Errore durante il recupero della proposta:', error);
      throw new Error('Errore durante il recupero della proposta.');
    }
  };
// Service: Funzione per ottenere i dettagli delle carte offerte
getOfferedCardsDetails = async (offers) => {
  try {
    const offersWithDetails = await Promise.all(
      offers.map(async (offer) => {
        const cardDetails = await this.getCharacterDetails(offer.idCarte); // Usa `this.getCharacterDetails`

        // Crea un nuovo oggetto per l'offerta con i dettagli delle carte
        return {
          id_offerta: offer.id_offerta,
          cards: cardDetails.map(card => ({
            id: card.id,
            name: card.name,
            thumbnail: card.thumbnail,
          }))
        };
      })
    );

    return offersWithDetails;
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli delle carte offerte:', error);
    throw new Error('Errore durante il recupero dei dettagli delle carte offerte.');
  }
};

// Funzione per ottenere i dettagli delle carte dal Marvel API
getCharacterDetails = async (characterIds) => {
  const baseUrl = process.env.CHARACTERS_URL;
  const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
  const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;

  // Genera i parametri di autenticazione
  const timestamp = Date.now();
  const hash = MD5(timestamp + privateApiKey + publicApiKey);
  const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;

  // Mappa per tutte le richieste parallele
  const requests = characterIds.map(async (characterId) => {
    const response = await fetch(`${baseUrl}/${characterId}?${authParams}`);
    const data = await response.json();
    if (data && data.data && data.data.results && data.data.results.length > 0) {
      return data.data.results[0];
    }
    return null;
  });

  const detailedCharacters = await Promise.all(requests);
  return detailedCharacters.filter(Boolean);
}

}

export default new TradeService();
