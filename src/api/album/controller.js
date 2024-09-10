import albumService from './service.js';

class AlbumController {
  async getAlbumPage(req, res, next) {
    try {
      const { page_number } = req.query;
      
      // Estrai l'userId dal token JWT
      const userId = req.user.userId;

      const cards = await albumService.getCardsForPage(userId, page_number);
      res.status(200).json(cards);
    } catch (error) {
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
}

export default new AlbumController();
