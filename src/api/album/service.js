import { MD5 } from '../shared/utils/md5.js'; 
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { User } from '../users/model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // <-- import del modulo fs

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

  async getCardsForPage(userId, pageNumber, cardsPerPage) {
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
  
    // 1. Trova l'utente
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
  
    // 2. Estraggo le carte dal suo album, relative a quella pagina
    const pageCards = user.album.slice(startIndex, endIndex);
  
    // 3. Mappa le carte in un array di { id, quantity } senza controllare se possedute o no
    const cardsForPage = pageCards.map(card => ({
      id: card.card_id,
      quantity: card.quantity
    }));
  
    // 4. Restituisco i crediti e l'array cards
    return {
      credits: user.credits,
      cards: cardsForPage
    };
  }

  // Funzione per ottenere le carte possedute per una pagina specifica nel trade
  async getCardsForPageTrade(userId, pageNumber) {
    const cardsPerPage = 28;

    // Ottieni l'utente e il suo album
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Filtra solo le carte possedute (quantity > 0)
    const ownedCards = user.album.filter(card => card.available_quantity > 0);

    // Se non ci sono carte possedute, restituisci una lista vuota
    if (ownedCards.length === 0) {
      return [];
    }

    // Calcola il numero totale di pagine basato sulle carte possedute
    const totalPages = Math.ceil(ownedCards.length / cardsPerPage);

    // Verifica se la pagina richiesta è valida
    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error('Numero di pagina non valido.');
    }

    // Determina l'indice di inizio e fine per la pagina corrente
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    // Ottieni le carte per la pagina selezionata
    const pageCards = ownedCards.slice(startIndex, endIndex);

    // Scorriamo tutte le carte nella pagina e otteniamo i dettagli
    const cardsWithState = await Promise.all(pageCards.map(async (card) => {
      const [detailedCard] = await this.getCharacterDetails([card.card_id]);

      // Verifica che i dettagli della carta siano validi
      if (!detailedCard || !detailedCard.name) {
        return {
          id: card.card_id,
          name: "Dettagli non disponibili",
          thumbnail: { path: "placeholder-image", extension: "jpeg" }, // Placeholder
          state: 'posseduta', // Carta posseduta
          quantity: card.quantity
        };
      }

      // Restituisci la carta con i dettagli e lo stato "posseduta"
      return {
        id: card.card_id,
        name: detailedCard.name,
        thumbnail: detailedCard.thumbnail,
        state: 'posseduta',
        quantity: card.quantity
      };
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
      // Variabili per la paginazione
      let allResults = [];
      let offset = 0;
      const limit = 100;
      let total = 0;

      do {
        // Richiedi al Marvel API i personaggi con l'offset corrente
        const response = await fetch(`${baseUrl}?nameStartsWith=${nameStartsWith}&${authParams}&limit=${limit}&offset=${offset}`);
        const data = await response.json();

        // Controlla se ci sono risultati
        if (!data || !data.data || data.data.results.length === 0) {
          break; // Nessun personaggio trovato
        }

        // Imposta il totale al primo passaggio
        if (total === 0) {
          total = data.data.total;
        }

        // Aggiungi i risultati alla lista completa
        allResults = allResults.concat(data.data.results);

        // Aggiorna l'offset per la prossima iterazione
        offset += data.data.count;

      } while (offset < total);

      // Mappa per ottenere gli ID dei personaggi trovati
      const foundCharacterIds = allResults.map(character => character.id);

      // Ottieni le carte possedute dall'utente
      const user = await User.findById(userId);
      if (!user) throw new Error('Utente non trovato');

      // Filtra solo le carte possedute con quantity > 0 e corrispondenti ai personaggi trovati
      const ownedCardsWithDetails = await Promise.all(user.album
        .filter(card => card.quantity > 0 && foundCharacterIds.includes(card.card_id))
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

      console.log('Carte possedute trovate:', ownedCardsWithDetails);
      return ownedCardsWithDetails;

    } catch (error) {
      console.error('Errore durante la ricerca delle carte:', error);
      throw new Error('Errore durante la ricerca delle carte');
    }
  }

  // Service: Funzione per vendere una carta posseduta dall'utente
  sellCard = async (userId, cardId) => {
    try {
      // Trova l'utente e il suo album
      const user = await User.findById(userId);
      if (!user) throw new Error('Utente non trovato.');

      // Trova la carta nell'album dell'utente
      const albumCard = user.album.find(card => card.card_id.toString() === cardId);
      if (!albumCard || albumCard.quantity <= 0) {
        throw new Error('Carta non posseduta o quantità insufficiente.');
      }

      // Decrementa la quantità della carta
      albumCard.quantity -= 1;
      albumCard.available_quantity = Math.min(albumCard.available_quantity, albumCard.quantity);

      // Se la quantità della carta è 0, imposta available_quantity a 0, ma non rimuoverla dall'album
      if (albumCard.quantity === 0) {
        albumCard.available_quantity = 0; // Imposta disponibile a 0, ma la carta resta nell'album
      }

      // Aggiungi 1 credito all'utente
      user.credits += 1;

      // Salva le modifiche dell'utente
      await user.save();

      return { credits: user.credits, cardSold: cardId };
    } catch (error) {
      console.error('Errore durante la vendita della carta:', error);
      throw new Error('Errore durante la vendita della carta.');
    }
  };


}

export default new AlbumService();
