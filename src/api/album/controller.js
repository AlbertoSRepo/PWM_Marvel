import albumService from './service.js';

class AlbumController {
  async getAlbumPage(req, res, next) {
    try {
      const { page_number } = req.query;
      
      // Extract userId from the decoded JWT token, not from the request query
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
      
      // Extract userId from the decoded JWT token
      const userId = req.user.userId;

      const cards = await albumService.searchCardsByName(userId, name_starts_with);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  }
}

export default new AlbumController();
