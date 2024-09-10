import { MD5 } from '../shared/utils/md5.js'; // Supponiamo che tu abbia già la funzione MD5
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { User } from '../users/model.js'; // Percorso corretto per il modello User

dotenv.config();

class AlbumService {
  // Funzione per ottenere le carte per la pagina dell'album
  async getCardsForPage(userId, pageNumber) {
    const cardsPerPage = 15;
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    // Ottieni l'utente e il suo album
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Ottieni le carte per la pagina selezionata dall'album dell'utente
    const pageCards = user.album.slice(startIndex, endIndex);

    // Array per le carte possedute
    const ownedCards = [];

    // Scorriamo tutte le carte nella pagina per segnarle come possedute o non possedute
    const cardsWithState = await Promise.all(pageCards.map(async (card) => {
      // Controlla se la carta è posseduta (quantity > 0)
      if (card.quantity > 0) {
        ownedCards.push(card.card_id);
        const [detailedCard] = await this.getCharacterDetails([card.card_id]);

        // Restituisci la carta con lo stato "posseduta" e i dettagli
        return {
          id: card.card_id,
          name: detailedCard.name,
          thumbnail: detailedCard.thumbnail,
          state: 'posseduta', // Carta posseduta
          quantity: card.quantity
        };
      } else {
        // Carta non posseduta
        return {
          id: card.card_id,
          name: "Carta sconosciuta",
          thumbnail: { path: "placeholder-path", extension: "jpg" }, // Placeholder per le carte non possedute
          state: 'non posseduta', // Carta non posseduta
          quantity: 0
        };
      }
    }));

    return cardsWithState;
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
  async getCharacterDetailsWithExtras(characterId) {
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
        return data.data.results;
      } else {
        console.error(`Struttura della risposta non valida da ${apiUrl}:`, data);
        return []; // Restituisci un array vuoto se la struttura della risposta non è valida
      }
    } catch (error) {
      console.error(`Errore durante il recupero dei dati da ${apiUrl}:`, error);
      return []; // Gestione degli errori
    }
  }
  // Funzione per cercare esclusivamente le carte possedute per nome del supereroe
  async searchCardsByName(userId, nameStartsWith) {
    const baseUrl = process.env.CHARACTERS_URL;
    const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
    const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;

    // Genera i parametri di autenticazione
    const timestamp = Date.now();
    const hash = MD5(timestamp + privateApiKey + publicApiKey);
    const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;

    try {
      // Richiedi al Marvel API i personaggi che iniziano con il nome specificato
      const response = await fetch(`${baseUrl}?nameStartsWith=${nameStartsWith}&${authParams}`);
      const data = await response.json();

      // Se non ci sono risultati
      if (!data || !data.data || data.data.results.length === 0) {
        return []; // Nessun personaggio trovato
      }

      // Mappa per ottenere gli ID dei personaggi trovati
      const foundCharacterIds = data.data.results.map(character => character.id);

      // Ottieni le carte possedute dall'utente
      const user = await User.findById(userId);
      if (!user) throw new Error('Utente non trovato');

      // Filtra solo le carte possedute con quantity > 0 e corrispondenti ai personaggi trovati
      const ownedCardsWithDetails = await Promise.all(user.album
        .filter(card => card.quantity > 0 && foundCharacterIds.includes(card.card_id)) // Solo carte possedute
        .map(async (card) => {
          const [detailedCard] = await this.getCharacterDetails([card.card_id]);

          // Restituisci solo le carte possedute con i dettagli
          return {
            id: card.card_id,
            name: detailedCard.name,
            thumbnail: detailedCard.thumbnail,
            state: 'posseduta', // Carta posseduta
            quantity: card.quantity,
          };
        })
      );

      return ownedCardsWithDetails;

    } catch (error) {
      console.error('Errore durante la ricerca delle carte:', error);
      throw new Error('Errore durante la ricerca delle carte');
    }
  }
}

export default new AlbumService();
