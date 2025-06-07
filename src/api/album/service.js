// src/api/album/service.js
import { MD5 } from '../shared/utils/md5.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import dbService from '../shared/database/dbService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AlbumService {
  async getInitialData() {
    // 1. Leggo il file JSON dal filesystem
    const filePath = path.resolve(__dirname, 'data', 'marvel_characters_with_images.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // 2. Converto il contenuto del file in oggetto JS
    const figurineData = JSON.parse(fileContent);

    return figurineData;
  }

  async getCardsForIds(userId, cardIds) {
    const user = await dbService.findUserById(userId);
    if (!user) throw new Error('User not found');

    const userCards = cardIds.map(cardId => {
      const albumCard = user.album.find(c => c.card_id === cardId);
      return { 
        id: cardId, 
        quantity: albumCard ? albumCard.quantity : 0,
        available_quantity: albumCard ? albumCard.available_quantity : 0
      };
    });

    return {
      credits: user.credits,
      cards: userCards
    };
  }

  /**
   * Ritorna un set di carte possedute dall'utente (available_quantity > 0), 
   * in ordine di card_id
   * limit = quante carte restituire
   * offset = da quale indice partire
   */
  async getPossessedCards(userId, limit, offset) {
    const user = await dbService.findUserById(userId);
    if (!user) {
      throw new Error('Utente non trovato');
    }

    const possessed = user.album
      .filter(c => c.quantity > 0 && c.available_quantity > 0)
      .sort((a, b) => a.card_id - b.card_id);

    const total = possessed.length;
    const sliced = possessed.slice(offset, offset + limit);

    const cards = sliced.map(c => ({
      id: c.card_id,
      quantity: c.quantity,
      available_quantity: c.available_quantity
    }));

    return {
      total,
      cards
    };
  }

  // Funzione per ottenere i dettagli delle carte dal Marvel API
  async getCharacterDetails(characterIds) {
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

  // Metodo per ottenere dettagli extra (comics, series, stories, events) se necessario
  async getCharacterDetailsExtra(characterId) {
    const baseUrl = process.env.CHARACTERS_URL;
    const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
    const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;

    const timestamp = Date.now();
    const hash = MD5(timestamp + privateApiKey + publicApiKey);
    const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;

    try {
      // Fai la prima richiesta per ottenere le informazioni iniziali sul personaggio
      const response = await fetch(`${baseUrl}/${characterId}?${authParams}`);
      const data = await response.json();
      const character = data.data.results[0];

      // Esegui tutte le richieste per comics, series, stories ed events in parallelo
      const [comics, series, stories, events] = await Promise.all([
        this.getAdditionalDetails(character.comics.collectionURI),
        this.getAdditionalDetails(character.series.collectionURI),
        this.getAdditionalDetails(character.stories.collectionURI),
        this.getAdditionalDetails(character.events.collectionURI)
      ]);

      return {
        id: character.id,
        name: character.name,
        description: character.description,
        thumbnail: character.thumbnail,
        comics,
        series,
        stories,
        events
      };
    } catch (error) {
      console.error('Errore durante il recupero dei dettagli del personaggio:', error);
      throw new Error('Errore durante il recupero dei dettagli del personaggio.');
    }
  }

  // Funzione per ottenere dettagli aggiuntivi da Marvel API (comics, series, stories, events)
  async getAdditionalDetails(collectionURI) {
    const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
    const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;

    const timestamp = Date.now();
    const hash = MD5(timestamp + privateApiKey + publicApiKey);
    const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;
    const apiUrl = `${collectionURI}?${authParams}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data && data.data && Array.isArray(data.data.results)) {
        // Mappa i risultati per estrarre solo i campi desiderati
        const simplifiedResults = data.data.results.map(item => ({
          name: item.title || item.name,
          description: item.description,
          thumbnail: item.thumbnail,
        }));
        return simplifiedResults;
      } else {
        console.error(`Struttura della risposta non valida da ${apiUrl}:`, data);
        return []; // Restituisci un array vuoto se la struttura della risposta non è valida
      }
    } catch (error) {
      console.error(`Errore durante il recupero dei dati da ${apiUrl}:`, error);
      return []; // Gestione degli errori
    }
  }

  // Service: Funzione per vendere una carta posseduta dall'utente
  sellCard = async (userId, cardId) => {
    try {
      // Trova l'utente e il suo album
      const user = await dbService.findUserById(userId);
      if (!user) throw new Error('Utente non trovato.');

      // Trova la carta nell'album dell'utente
      const albumCard = user.album.find(card => card.card_id.toString() === cardId);
      if (!albumCard || albumCard.quantity <= 0) {
        throw new Error('Carta non posseduta o quantità insufficiente.');
      }

      // Crea una copia dell'album per le modifiche
      const updatedAlbum = user.album.map(card => {
        if (card.card_id.toString() === cardId) {
          const newQuantity = card.quantity - 1;
          const newAvailableQuantity = Math.min(card.available_quantity, newQuantity);
          
          return {
            ...card,
            quantity: newQuantity,
            available_quantity: newAvailableQuantity === 0 ? 0 : newAvailableQuantity
          };
        }
        return card;
      });

      // Aggiungi 1 credito all'utente
      const newCredits = user.credits + 1;

      // Salva le modifiche dell'utente
      await dbService.updateUser(userId, {
        credits: newCredits,
        album: updatedAlbum
      });

      return { credits: newCredits, cardSold: cardId };
    } catch (error) {
      console.error('Errore durante la vendita della carta:', error);
      throw new Error('Errore durante la vendita della carta.');
    }
  };
}

export default new AlbumService();