// src/api/v1/album/service.js
import { User } from '../users/model.js';
import { MD5 } from '../shared/utils/md5.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

class AlbumService {
  async getCardsForPage(userId, pageNumber) {
    const cardsPerPage = 15;
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get the card IDs for the specified page
    const pageCards = user.album.slice(startIndex, endIndex);

    // Filter out cards with quantity <= 0
    const availableCards = pageCards.filter(card => card.quantity >= 0);

    // Fetch details for these cards from the Marvel API
    const detailedCards = await this.getCharacterDetails(availableCards.map(card => card.card_id));

    return detailedCards;
  }

  async searchCardsByName(userId, nameStartsWith) {
    const baseUrl = process.env.CHARACTERS_URL;
    const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
    const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;
    
    const timestamp = Date.now();
    const hash = MD5(timestamp + privateApiKey + publicApiKey);
    const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;
    
    // Fetch characters that match the name search string
    const response = await fetch(`${baseUrl}?nameStartsWith=${nameStartsWith}&${authParams}`);
    const data = await response.json();

    if (!data || !data.data || data.data.results.length === 0) {
      return []; // No characters found
    }

    const foundCharacterIds = data.data.results.map(character => character.id);

    // Filter these IDs to only include those that the user owns with quantity > 0
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const availableCards = user.album.filter(card => foundCharacterIds.includes(card.card_id) && card.quantity >= 0);

    // Fetch the details for these available cards from the Marvel API
    const detailedCharacters = await this.getCharacterDetails(availableCards.map(card => card.card_id));

    return detailedCharacters;
  }

  async getCharacterDetails(characterIds) {
    const baseUrl = process.env.CHARACTERS_URL;
    const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
    const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;
    
    const timestamp = Date.now();
    const hash = MD5(timestamp + privateApiKey + publicApiKey);
    const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;

    const detailedCharacters = [];

    for (const characterId of characterIds) {
      const response = await fetch(`${baseUrl}/${characterId}?${authParams}`);
      const data = await response.json();
      if (data && data.data && data.data.results && data.data.results.length > 0) {
        detailedCharacters.push(data.data.results[0]);
      }
    }

    return detailedCharacters;
  }

}

export default new AlbumService();
