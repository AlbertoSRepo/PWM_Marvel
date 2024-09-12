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
            console.error('Errore durante il recupero delle proposte di trade:', error);
            res.status(500).json({ message: 'Errore durante il recupero delle proposte di trade.' });
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
            res.status(201).json(trade);
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
            console.error('Errore durante il recupero delle proposte dell\'utente:', error);
            res.status(500).json({ message: 'Errore durante il recupero delle tue proposte.' });
        }
    }

    // Recupero delle offerte fatte dall'utente loggato
    async getUserOffers(req, res) {
        try {
            const userId = req.user.userId; // Estrai l'userId dal token JWT
            const userOffers = await tradeService.getOffersByUser(userId);
            res.status(200).json(userOffers);
        } catch (error) {
            console.error('Errore durante il recupero delle offerte dell\'utente:', error);
            res.status(500).json({ message: 'Errore durante il recupero delle tue offerte.' });
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
      console.error('Errore durante la cancellazione dell\'offerta:', error);
      res.status(500).json({ message: 'Errore durante la cancellazione dell\'offerta.' });
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
      console.error('Errore durante la cancellazione della proposta:', error);
      res.status(500).json({ message: 'Errore durante la cancellazione della proposta.' });
    }
  };
}

export default new TradeController();
