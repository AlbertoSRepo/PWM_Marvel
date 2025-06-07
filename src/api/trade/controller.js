// src/api/trades/controller.js
import tradeService from './service.js';

class TradeController {
  // Funzione per recuperare tutte le proposte di trade della community
  async getAllTrades(req, res, next) {
    try {
      const userId = req.user.userId; // Estrai l'ID dell'utente dal token JWT
      const trades = await tradeService.getAllTrades(userId); // Passa l'ID al service
      res.status(200).json(trades);
    } catch (error) {
      next(error);
    }
  }

  // Creazione di una nuova proposta di trade
  async createTrade(req, res, next) {
    try {
      const { proposed_cards } = req.body;
      const userId = req.user.userId; // Estrai l'userId dal token JWT
      const trade = await tradeService.createTrade(userId, proposed_cards);
      res.status(201).json(trade);
    } catch (error) {
      next(error);
    }
  }

  // Aggiunta di un'offerta a una proposta di trade esistente
  async addOffer(req, res, next) {
    try {
      const { tradeId } = req.params;
      const { offered_cards } = req.body;
      const userId = req.user.userId; // Estrai l'userId dal token JWT
      const trade = await tradeService.addOffer(tradeId, userId, offered_cards);
      res.status(201).json({ message: 'Offerta aggiunta con successo', trade });
    } catch (error) {
      next(error);
    }
  }

  // Accettazione di un'offerta e completamento dello scambio
  async acceptOffer(req, res, next) {
    try {
      const { tradeId, offerId } = req.params;
      const result = await tradeService.acceptOffer(tradeId, offerId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Recupero delle proposte fatte dall'utente loggato
  async getUserProposals(req, res) {
    try {
      const userId = req.user.userId; // Estrai l'userId dal token JWT
      const userProposals = await tradeService.getProposalsByUser(userId);
      res.status(200).json(userProposals);
    } catch (error) {
      next(error);
    }
  }

  // Recupero delle offerte fatte dall'utente loggato
  async getUserOffers(req, res) {
    try {
      const userId = req.user.userId; // Estrai l'userId dal token JWT
      const userOffers = await tradeService.getOffersByUser(userId);
      res.status(200).json(userOffers);
    } catch (error) {
      next(error);
    }
  }

  // Controller: Funzione per cancellare un'offerta fatta dall'utente
  deleteOffer = async (req, res) => {
    try {
      const { offerId } = req.params; // Recupera l'ID dell'offerta dall'URL
      const userId = req.user.userId; // Estrai l'ID dell'utente dal token JWT

      // Chiama il service per cancellare l'offerta
      await tradeService.deleteOffer(userId, offerId);

      res.status(200).json({ message: 'Offerta cancellata con successo.' });
    } catch (error) {
      next(error);
    }
  };

  // Controller: Funzione per cancellare una proposta di trade
  deleteTrade = async (req, res) => {
    try {
      const { tradeId } = req.params; // Recupera l'ID della proposta dall'URL
      const userId = req.user.userId; // Estrai l'ID dell'utente dal token JWT

      // Chiama il service per cancellare la proposta
      await tradeService.deleteTrade(userId, tradeId);

      res.status(200).json({ message: 'Proposta cancellata con successo.' });
    } catch (error) {
      next(error);
    }
  };

  // Controller: Funzione per ottenere una singola proposta di trade dell'utente loggato
  getUserProposal = async (req, res) => {
    try {
      const { tradeId } = req.params; // Recupera l'ID della proposta dall'URL
      const userId = req.user.userId; // Estrai l'ID dell'utente dal token JWT

      // Chiama il service per ottenere la proposta
      const trade = await tradeService.getUserProposal(userId, tradeId);

      if (!trade) {
        return res.status(404).json({ message: 'Proposta non trovata o non autorizzato a visualizzarla.' });
      }

      res.status(200).json(trade);
    } catch (error) {
      next(error);
    }
  };

  // Controller: Funzione per ottenere i dettagli delle carte offerte
  getOfferedCardsDetails = async (req, res) => {
    try {
      const { offers } = req.body; // Riceve l'array di oggetti contenenti ID dell'offerta e ID delle carte

      if (!offers || !Array.isArray(offers)) {
        return res.status(400).json({ message: 'Formato dati offerta non valido.' });
      }

      // Chiama il service per ottenere i dettagli delle carte
      const offersWithDetails = await tradeService.getOfferedCardsDetails(offers);

      res.status(200).json(offersWithDetails);
    } catch (error) {
      next(error);
    }
  }

  // Controller: Funzione per ottenere i dettagli di una proposta specifica (accessibile a tutti)
// Controller: Funzione per ottenere i dettagli di una proposta specifica (accessibile a tutti)
getTradeDetails = async (req, res, next) => {
  try {
    const { tradeId } = req.params;
    
    console.log('Richiesta dettagli per trade ID:', tradeId);
    
    // Verifica che tradeId sia valido
    if (!tradeId || tradeId.length !== 24) {
      return res.status(400).json({ message: 'ID proposta non valido.' });
    }

    // Chiama il service per ottenere la proposta
    const trade = await tradeService.getTradeDetails(tradeId);

    if (!trade) {
      return res.status(404).json({ message: 'Proposta non trovata.' });
    }

    console.log('Trade details trovati:', trade);
    res.status(200).json(trade);
  } catch (error) {
    console.error('Errore in getTradeDetails:', error);
    next(error);
  }
};
};

export default new TradeController();
