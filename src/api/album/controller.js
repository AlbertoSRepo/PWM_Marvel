import albumService from './service.js';

class AlbumController {
  async getInitialData(req, res, next) {
    try {

      // 1. Chiamo la funzione del service
      const data = await albumService.getInitialData();

      // 2. “Invio” la risposta al client
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getCardsByIds(req, res, next) {
    try {
      const userId = req.user.userId;             // dal token JWT
      const { cardIds } = req.body;               // array di ID passati dal client

      if (!Array.isArray(cardIds)) {
        return res.status(400).json({ error: 'cardIds must be an array of IDs.' });
      }

      const result = await albumService.getCardsForIds(userId, cardIds);
      return res.status(200).json(result); // { credits, cards: [ { id, quantity }, ... ] }
    } catch (error) {
      next(error);
    }
  }

  /**
 * GET /api/album/possessed?limit=XX&offset=YY
 */
  async getPossessedCards(req, res, next) {
    try {
      const userId = req.user.userId;  // dal token JWT
      const limit = parseInt(req.query.limit, 10) || 28;
      const offset = parseInt(req.query.offset, 10) || 0;

      const result = await albumService.getPossessedCards(userId, limit, offset);
      // result = { total, cards: [ { id, quantity }, ... ] }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Nuova funzione per ottenere i dettagli completi del personaggio
  async getCharacterDetails(req, res, next) {
    try {
      const { characterId } = req.params;
      const characterDetails = await albumService.getCharacterDetailsExtra(characterId);
      res.status(200).json(characterDetails);
    } catch (error) {
      next(error);
    }
  }

  // Controller: Funzione per vendere una carta posseduta dall'utente
  sellCard = async (req, res) => {
    try {
      const { cardId } = req.params; // Ottieni l'ID della carta dall'URL
      const userId = req.user.userId; // Ottieni l'ID dell'utente dal token JWT

      // Chiama il service per vendere la carta
      const result = await albumService.sellCard(userId, cardId);

      res.status(200).json({ message: 'Carta venduta con successo!', result });
    } catch (error) {
      next(error);
    }
  };
}

export default new AlbumController();
