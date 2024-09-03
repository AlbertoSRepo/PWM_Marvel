// src/api/v1/album/controller.js
import albumService from './service.js';

class AlbumController {
  async getAlbumPage(req, res, next) {
    try {
      const { user_id, page_number } = req.query;
      const cards = await albumService.getCardsForPage(user_id, page_number);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  }

  async searchCards(req, res, next) {
    try {
      const { user_id, name_starts_with } = req.query;
      const cards = await albumService.searchCardsByName(user_id, name_starts_with);
      res.status(200).json(cards);
    } catch (error) {
      next(error);
    }
  }
}

export default new AlbumController();
