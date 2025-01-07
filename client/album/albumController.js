// albumController.js

import {
  getCards,
  searchCardsByName,
  getCharacterDetails,
  sellCardAPI,
  getInitialData
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


/**
* Verifica se i dati figurine sono nel WebStorage.
* Se non lo sono, li scarica dal server e li salva in localStorage.
* Restituisce sempre l'oggetto JSON finale.
*/
export async function fetchFigurineDataIfNeeded() {
  try {
    // 1. Controllo in localStorage
    const existingData = localStorage.getItem('figurineData');
    if (existingData) {
      // Già presente in Web Storage
      console.log('Figurine data trovato in localStorage.');
      return JSON.parse(existingData);
    } else {
      // 2. Chiamata al server
      console.log('Nessun figurine data in localStorage, chiamo il server...');
      const data = await getInitialData();  // getInitialData() da albumRoute.js

      // 3. Salvo in localStorage per usi futuri
      localStorage.setItem('figurineData', JSON.stringify(data));

      return data;
    }
  } catch (error) {
    console.error('Errore durante fetchFigurineDataIfNeeded:', error);
    return null; // o rilanci l’errore
  }
}

/**
 * Carica le carte di una certa pagina e aggiorna la UI.
 */
export async function fetchCardsAndUpdate(pageNumber) {
  try {
    showLoadingSpinner();
    const data = await getCards(pageNumber); // {cards, credits, ...}
    updateCards(data.cards);
    updateCredits(data.credits);
    updatePaginationButtons(pageNumber);
  } catch (error) {
    console.error('Errore durante il caricamento delle carte:', error);
    alert('Si è verificato un errore durante il caricamento delle carte.');
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Esegue una ricerca per nome e aggiorna la UI con i risultati.
 */
export async function fetchNameCardsAndUpdate(name) {
  try {
    showLoadingSpinner();
    const data = await searchCardsByName(name);
    // data = array di carte
    updateNameCards(data);
  } catch (error) {
    console.error('Errore durante la ricerca delle carte:', error);
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
