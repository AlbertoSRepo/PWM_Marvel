// src/api/trade/service.js
import { ObjectId } from 'mongodb';
import dbService from '../shared/database/dbService.js';
import validationService from '../shared/validation/validationService.js';
import { MD5 } from '../shared/utils/md5.js';
import fetch from 'node-fetch';

class TradeService {
  async getAllTrades(userId) {
    try {
      // Recupera tutte le proposte di trade, escludendo quelle fatte dall'utente loggato
      const trades = await dbService.findTradesExcludingUser(userId);

      // Popola manualmente con username degli utenti
      const populatedTrades = await dbService.populateTradesWithUsers(trades);

      return populatedTrades.map(trade => ({
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
    // Validazione dati trade
    const validation = validationService.validateTradeData({ proposed_cards: proposedCards });
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    const proposer = await dbService.findUserById(proposerId);
    if (!proposer) throw new Error('User not found');

    // Normalizza l'album prima di procedere
    const updatedAlbum = proposer.album.map(card => ({
      ...card,
      card_id: Number(card.card_id)
    }));
    
    proposedCards.forEach(card => {
      const cardId = Number(card.card_id); // Normalizza anche le carte proposte
      const albumCardIndex = updatedAlbum.findIndex(c => c.card_id === cardId);
      
      if (albumCardIndex === -1 || updatedAlbum[albumCardIndex].available_quantity < card.quantity) {
        throw new Error(`Insufficient available quantity for card ID ${cardId}`);
      }
      
      updatedAlbum[albumCardIndex].available_quantity -= card.quantity;
    });

    // Salva le modifiche dell'utente
    await dbService.updateUser(proposerId, { album: updatedAlbum });

    // Crea la proposta di trade
    const trade = await dbService.createTrade({
      proposer_id: new ObjectId(proposerId),
      proposed_cards: proposedCards
    });

    return trade;
  }

  // Aggiungi un'offerta a una proposta di trade esistente
  async addOffer(tradeId, userId, offeredCards) {
    // Validazione dati offerta
    const validation = validationService.validateOfferData({ offered_cards: offeredCards });
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    const trade = await dbService.findTradeById(tradeId);
    if (!trade) throw new Error('Trade not found');

    const offerer = await dbService.findUserById(userId);
    if (!offerer) throw new Error('User not found');

    // Pulisci l'album prima di procedere
    let updatedAlbum = validationService.cleanupAlbum([...offerer.album]);
    
    offeredCards.forEach(card => {
      const albumCardIndex = updatedAlbum.findIndex(c => Number(c.card_id) === Number(card.card_id));
      console.log(`albumCardIndex: ${albumCardIndex}`);
      if (albumCardIndex === -1 || updatedAlbum[albumCardIndex].available_quantity < card.quantity) {
        throw new Error(`Insufficient available quantity for card ID ${card.card_id}`);
      }
      updatedAlbum[albumCardIndex].available_quantity -= card.quantity;
    });

    // Salva l'album pulito
    await dbService.updateUser(userId, { album: updatedAlbum });

    // Aggiungi l'offerta alla proposta di trade
    const updatedTrade = await dbService.addOfferToTrade(tradeId, {
      user_id: new ObjectId(userId),
      offered_cards: offeredCards
    });

    return updatedTrade;
  }

  // Accetta un'offerta e completa lo scambio
  async acceptOffer(tradeId, offerId) {
    const trade = await dbService.findTradeById(tradeId);
    if (!trade) throw new Error('Trade not found');

    const offer = trade.offers.find(o => o._id.toString() === offerId);
    if (!offer) throw new Error('Offer not found');

    if (offer.status !== 'pending') {
      throw new Error('Offer is not pending');
    }

    // Effettua lo scambio tra il proponente e l'offerente
    await this.executeTrade(trade, offer);

    // Cancella la proposta e tutte le offerte correlate
    await dbService.deleteTrade(tradeId);
    return { message: 'Trade completed and removed from the system' };
  }

  // Logica dello scambio tra le due parti
  async executeTrade(trade, offer) {
    const proposer = await dbService.findUserById(trade.proposer_id);
    const offerer = await dbService.findUserById(offer.user_id);

    const proposerAlbum = [...proposer.album];
    const offererAlbum = [...offerer.album];

    // Scambio delle carte proposte (dal proposer all'offerer)
    trade.proposed_cards.forEach(card => {
      // NORMALIZZA card_id come numero
      const cardId = Number(card.card_id);
      
      const offererCardIndex = offererAlbum.findIndex(c => Number(c.card_id) === cardId);
      const proposerCardIndex = proposerAlbum.findIndex(c => Number(c.card_id) === cardId);

      // Proposer PERDE quantity
      if (proposerCardIndex !== -1) {
        proposerAlbum[proposerCardIndex].quantity -= card.quantity;
        proposerAlbum[proposerCardIndex].available_quantity = Math.min(
          proposerAlbum[proposerCardIndex].available_quantity,
          proposerAlbum[proposerCardIndex].quantity
        );
      }

      // Offerer GUADAGNA quantity
      if (offererCardIndex !== -1) {
        offererAlbum[offererCardIndex].quantity += card.quantity;
        offererAlbum[offererCardIndex].available_quantity += card.quantity;
      } else {
        // IMPORTANTE: Salva card_id come numero
        offererAlbum.push({
          card_id: cardId, // Numero, non stringa
          quantity: card.quantity,
          available_quantity: card.quantity
        });
      }
    });

    // Scambio delle carte offerte (dall'offerer al proposer)
    offer.offered_cards.forEach(card => {
      // NORMALIZZA card_id come numero
      const cardId = Number(card.card_id);
      
      const offererCardIndex = offererAlbum.findIndex(c => Number(c.card_id) === cardId);
      const proposerCardIndex = proposerAlbum.findIndex(c => Number(c.card_id) === cardId);

      // Offerer PERDE quantity
      if (offererCardIndex !== -1) {
        offererAlbum[offererCardIndex].quantity -= card.quantity;
        offererAlbum[offererCardIndex].available_quantity = Math.min(
          offererAlbum[offererCardIndex].available_quantity,
          offererAlbum[offererCardIndex].quantity
        );
      }

      // Proposer GUADAGNA quantity
      if (proposerCardIndex !== -1) {
        proposerAlbum[proposerCardIndex].quantity += card.quantity;
        proposerAlbum[proposerCardIndex].available_quantity += card.quantity;
      } else {
        // IMPORTANTE: Salva card_id come numero
        proposerAlbum.push({
          card_id: cardId, // Numero, non stringa
          quantity: card.quantity,
          available_quantity: card.quantity
        });
      }
    });

    // Rimuovi carte con quantity 0 e normalizza tutti i card_id
    const cleanProposerAlbum = proposerAlbum
      .filter(card => card.quantity > 0)
      .map(card => ({
        ...card,
        card_id: Number(card.card_id) // Assicura che sia sempre un numero
      }));
      
    const cleanOffererAlbum = offererAlbum
      .filter(card => card.quantity > 0)
      .map(card => ({
        ...card,
        card_id: Number(card.card_id) // Assicura che sia sempre un numero
      }));

    // Salva entrambi gli utenti
    await dbService.updateUser(trade.proposer_id, { album: cleanProposerAlbum });
    await dbService.updateUser(offer.user_id, { album: cleanOffererAlbum });

    // Elimina la trade e tutte le sue offerte
    await dbService.deleteTrade(trade._id);
  }

  // Ottenere le proposte fatte dall'utente
  async getProposalsByUser(userId) {
    const userProposals = await dbService.findTradesByProposer(userId);
    return userProposals;
  }

  async getOffersByUser(userId) {
    try {
      // Recupera tutte le proposte che contengono offerte fatte dall'utente loggato
      const userOffers = await dbService.findTradesWithUserOffers(userId);

      // Filtra le offerte per includere solo quelle fatte dall'utente loggato
      const filteredTrades = userOffers.map(trade => {
        const filteredOffers = trade.offers.filter(offer => offer.user_id.toString() === userId.toString());

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

  deleteOffer = async (userId, offerId) => {
    try {
      // 1) Cerca la trade che contiene l'offerta
      const trades = await dbService.getCollection('trades').find({ 'offers._id': new ObjectId(offerId) }).toArray();
      if (trades.length === 0) {
        throw new Error('Proposta non trovata.');
      }
      
      const trade = trades[0];
      
      // 2) Cerca l'offerta
      const offer = trade.offers.find(o => o._id.toString() === offerId);
      if (!offer) {
        throw new Error('Offerta non trovata.');
      }
  
      // 3) Verifica che l'offerta appartenga all'utente
      if (offer.user_id.toString() !== userId.toString()) {
        throw new Error('Non sei autorizzato a cancellare questa offerta.');
      }
  
      // 4) Recupera l'utente
      const user = await dbService.findUserById(userId);
      if (!user) {
        throw new Error('Utente non trovato.');
      }
  
      // 5) Ripristina la available_quantity per ogni carta
      const updatedAlbum = [...user.album];
      offer.offered_cards.forEach(card => {
        const albumCardIndex = updatedAlbum.findIndex(c => Number(c.card_id) === Number(card.card_id));
        if (albumCardIndex !== -1) {
          updatedAlbum[albumCardIndex].available_quantity += card.quantity;
        }
      });
  
      // 6) Salva i cambi dell'utente
      await dbService.updateUser(userId, { album: updatedAlbum });
  
      // 7) Rimuovi l'offerta dalla trade
      await dbService.removeOfferFromTrade(trade._id, offerId);
  
    } catch (error) {
      console.error('Errore durante la cancellazione dell\'offerta:', error);
      throw new Error('Errore durante la cancellazione dell\'offerta.');
    }
  };

  deleteTrade = async (userId, tradeId) => {
    try {
      // Cerca la proposta di trade per ID e verifica che appartenga all'utente loggato
      const trade = await dbService.findTradeById(tradeId);

      if (!trade || trade.proposer_id.toString() !== userId.toString()) {
        throw new Error('Proposta non trovata o non autorizzato a cancellarla.');
      }

      // 1) Prima di eliminare la proposta, recupera l'utente proponente
      const proposer = await dbService.findUserById(userId);
      if (!proposer) {
        throw new Error('Utente proponente non trovato.');
      }

      // 2) Per ogni carta in trade.proposed_cards, restituisci la quantity alla available_quantity
      const updatedAlbum = [...proposer.album];
      trade.proposed_cards.forEach(card => {
        const albumCardIndex = updatedAlbum.findIndex(c => Number(c.card_id) === Number(card.card_id));
        if (albumCardIndex !== -1) {
          updatedAlbum[albumCardIndex].available_quantity += card.quantity; 
        }
      });

      // 3) Salva le modifiche sullo user
      await dbService.updateUser(userId, { album: updatedAlbum });

      // 4) Cancella la proposta dal database
      await dbService.deleteTrade(tradeId);

    } catch (error) {
      console.error('Errore durante la cancellazione della proposta:', error);
      throw new Error('Errore durante la cancellazione della proposta.');
    }
  };

  getUserProposal = async (userId, tradeId) => {
    try {
      // Cerca la proposta di trade per ID e verifica che appartenga all'utente loggato
      const trade = await dbService.findTradeById(tradeId);

      if (!trade || trade.proposer_id.toString() !== userId.toString()) {
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
          const cardDetails = await this.getCharacterDetails(offer.idCarte);

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

  // Service: Funzione per ottenere i dettagli di una proposta specifica (accessibile a tutti)
  getTradeDetails = async (tradeId) => {
    try {
      const trade = await dbService.findTradeById(tradeId);
      
      if (!trade) {
        throw new Error('Proposta non trovata.');
      }

      return trade;
    } catch (error) {
      console.error('Errore durante il recupero della proposta:', error);
      throw new Error('Errore durante il recupero della proposta.');
    }
  };
}

export default new TradeService();