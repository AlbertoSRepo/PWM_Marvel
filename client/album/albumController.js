// albumController.js

import {
  getCardsByIds,
  getCharacterDetails,
  sellCardAPI
} from './albumRoute.js';

import {
  showLoadingSpinner,
  hideLoadingSpinner,
  updateCards,
  updateNameCards,
  hideOverlay,
  updateCredits,
  updatePaginationButtons,
  showOverlayLoader,
  hideOverlayLoader,
  populateCharacterOverlay
} from './albumUI.js';

import {
  getFigurineDataOrThrow,
  convertThumbnailStringToObj,
  mergeServerAndLocalData
} from '../shared/cardUtils.js';

/**
 * Carica le carte di una certa pagina e aggiorna la UI,
 * calcolando gli ID della pagina sul client e inviandoli al server.
 */
export async function fetchCardsAndUpdate(pageNumber) {
  try {
    showLoadingSpinner();

    // 1. Recupera figurineData dal localStorage (l'intero set di figurine)
    const figurineData = JSON.parse(localStorage.getItem('figurineData'));
    if (!figurineData) {
      throw new Error('figurineData non presente in Local Storage');
    }

    // 2. Calcola l'intervallo (startIndex, endIndex) per la pagina
    const cardsPerPage = 18; // o la costante che preferisci
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    // Ottengo la slice di figurine: [ { id, name, thumbnail: "...", ... }, ... ]
    const pageItems = figurineData.slice(startIndex, endIndex);
    // Estraggo solo gli ID
    const pageIds = pageItems.map(item => item.id);

    // 3. Chiamo il server per sapere le quantity dell'utente
    //    (es. { credits, cards: [ {id, quantity}, ... ] })
    const serverData = await getCardsByIds(pageIds);

    // 4. FONDIAMO i dati: 
    //    - se quantity > 0 => carta posseduta 
    //    - se quantity = 0 => carta non posseduta
    //    - se figurineData non contiene l'ID (caso raro), usiamo fallback
    const mergedCards = serverData.cards.map(serverCard => {
      // Trovo l'elemento corrispondente in pageItems
      const localFig = pageItems.find(fig => fig.id === serverCard.id);

      if (serverCard.quantity > 0) {
        // => "posseduta"
        if (!localFig) {
          // fallback se non lo trovo in figurineData
          return {
            id: serverCard.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'posseduta',
            quantity: serverCard.quantity
          };
        }

        // Converto la stringa thumbnail in { path, extension }
        const thumbObj = convertThumbnailStringToObj(localFig.thumbnail);
        return {
          id: serverCard.id,
          name: localFig.name,
          thumbnail: thumbObj,
          state: 'posseduta',
          quantity: serverCard.quantity
        };

      } else {
        // => "non posseduta"
        // In questo caso, prendo comunque l'elemento locale (se esiste) 
        // o lascio fallback "Carta sconosciuta"
        if (!localFig) {
          return {
            id: serverCard.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'non posseduta',
            quantity: 0
          };
        }

          return {
            id: serverCard.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'non posseduta',
            quantity: 0
          };
      }
    });

    // 5. Aggiorna la UI
    updateCards(mergedCards);
    updateCredits(serverData.credits);
    updatePaginationButtons(pageNumber);

  } catch (error) {
    console.error('Errore durante il caricamento delle carte:', error);
    alert('Si è verificato un errore durante il caricamento delle carte.');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Ricerca locale e mostra solo le carte possedute (quantity>0) con un nome che inizia con searchString.
 */
export async function searchCardsLocallyAndUpdate(searchString) {
  try {
    showLoadingSpinner();

    // 1. Recupero figurineData dal localStorage
    const figurineData = getFigurineDataOrThrow();

    // 2. Filtro locale
    const matchedLocalCards = figurineData.filter(fig =>
      fig.name.toLowerCase().startsWith(searchString.toLowerCase())
    );
    if (matchedLocalCards.length === 0) {
      updateNameCards([]);
      return;
    }

    // 3. Estraggo ID e chiedo al server
    const matchedIds = matchedLocalCards.map(fig => fig.id);
    const serverData = await getCardsByIds(matchedIds);

    // 4. Aggiorna crediti (opzionale)
    updateCredits(serverData.credits);

    // 5. Unisco i dati, filtrando solo quantity>0
    const mergedResults = mergeServerAndLocalData(serverData.cards, matchedLocalCards, true);

    if (mergedResults.length === 0) {
      updateNameCards([]);
      return;
    }

    // 6. Mostro i risultati
    updateNameCards(mergedResults);

  } catch (error) {
    console.error('Errore durante la ricerca carte:', error);
    alert('Si è verificato un errore durante la ricerca delle carte.');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Ottiene i dettagli di un personaggio e mostra l'overlay popolato.
 */
export async function showOverlayWithDetails(characterId) {
  try {
    // Mostra subito l'overlay e lo spinner interno
    showOverlayLoader();

    const characterDetails = await getCharacterDetails(characterId);
    if (!characterDetails) {
      hideOverlay();
      return;
    }
    // Popola l'overlay con i dettagli
    populateCharacterOverlay(characterDetails);
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli:', error);
    alert('Si è verificato un errore durante il caricamento dei dettagli.');
    hideOverlay();
  } finally {
    hideOverlayLoader();
  }
}

/**
 * Vende la carta e ricarica la pagina corrente.
 */
export async function sellCard(cardId, currentPage) {
  try {
    await sellCardAPI(cardId);
    alert('Carta venduta con successo!');
    hideOverlay();
    await fetchCardsAndUpdate(currentPage); // Ricarichiamo le carte
  } catch (error) {
    console.error('Errore durante la vendita della carta:', error);
    alert('Errore durante la vendita della carta.');
  }
}