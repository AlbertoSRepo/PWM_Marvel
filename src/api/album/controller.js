import albumService from './service.js';

class AlbumController {
  async getAlbumPage(req, res, next) {
    try {
      const { page_number, cards_per_page, only_owned } = req.query;

      // Estrai l'userId dal token JWT
      const userId = req.user.userId;

      // Converti `only_owned` in un booleano (se presente, sarà "true")
      const onlyOwned = only_owned === 'true';

      // Passa il valore di onlyOwned al service
      const cards = await albumService.getCardsForPage(userId, page_number, cards_per_page || 18, onlyOwned || false);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  }
  // Funzione per ottenere le carte possedute per pagina nel contesto di un trade
  async getCardsForPageTrade(req, res, next) {
    try {
      const { page_number } = req.query;

      // Estrai l'userId dal token JWT
      const userId = req.user.userId;

      // Chiama il service per ottenere le carte possedute per la pagina richiesta
      const cards = await albumService.getCardsForPageTrade(userId, page_number);

      // Restituisci le carte con un codice 200
      res.status(200).json(cards);
    } catch (error) {
      console.error('Errore durante il recupero delle carte per il trade:', error);
      res.status(500).json({ message: 'Errore durante il recupero delle carte per il trade.' });
      next(error);
    }
  }

  async searchCards(req, res, next) {
    try {
      const { name_starts_with } = req.query;

      // Estrai l'userId dal token JWT
      const userId = req.user.userId;

      const cards = await albumService.searchCardsByName(userId, name_starts_with);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  }

  // Nuova funzione per ottenere i dettagli completi del personaggio
  async getCharacterDetails(req, res, next) {
    try {
      const { characterId } = req.params;
      const characterDetails = await albumService.getCharacterDetailsWithExtras(characterId);
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
      console.error('Errore durante la vendita della carta:', error);
      res.status(500).json({ message: 'Errore durante la vendita della carta.' });
    }
  };
}

export default new AlbumController();
