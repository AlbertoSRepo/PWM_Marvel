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

    // 1. Recupera figurineData dal localStorage usando helper condiviso
    const figurineData = getFigurineDataOrThrow();

    // 2. Calcola l'intervallo (startIndex, endIndex) per la pagina
    const cardsPerPage = 18;
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    // Ottengo la slice di figurine
    const pageItems = figurineData.slice(startIndex, endIndex);
    const pageIds = pageItems.map(item => item.id);

    // 3. Chiamo il server per sapere le quantity dell'utente
    const serverData = await getCardsByIds(pageIds);

    // 4. FONDIAMO i dati usando helper condiviso
    const mergedCards = serverData.cards.map(serverCard => {
      const localFig = pageItems.find(fig => fig.id === serverCard.id);

      if (serverCard.quantity > 0) {
        if (!localFig) {
          return {
            id: serverCard.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'posseduta',
            quantity: serverCard.quantity
          };
        }

        const thumbObj = convertThumbnailStringToObj(localFig.thumbnail);
        return {
          id: serverCard.id,
          name: localFig.name,
          thumbnail: thumbObj,
          state: 'posseduta',
          quantity: serverCard.quantity
        };
      } else {
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
    console.error('Errore loadUserCards:', error);
    alert(`Errore: ${error.message}`);
  } finally {
    hideLoadingSpinner();
  }
}

/**
 * Ricerca locale e mostra solo le carte possedute (quantity>0) con un nome che inizia con searchString.
 * Se searchString è vuoto, carica la pagina corrente dell'album.
 */
export async function searchCardsLocallyAndUpdate(searchString) {
  try {
    showLoadingSpinner();

    if (!searchString || searchString.trim() === '') {
      const currentPage = parseInt(document.getElementById('albumPage').value || '1', 10);
      await fetchCardsAndUpdate(currentPage);
      return;
    }

    const figurineData = getFigurineDataOrThrow();

    const matchedLocalCards = figurineData.filter(fig =>
      fig.name.toLowerCase().startsWith(searchString.toLowerCase())
    );
    
    if (matchedLocalCards.length === 0) {
      updateNameCards([]);
      return;
    }

    const matchedIds = matchedLocalCards.map(fig => fig.id);
    const serverData = await getCardsByIds(matchedIds);

    updateCredits(serverData.credits);

    const mergedResults = mergeServerAndLocalData(serverData.cards, matchedLocalCards, true);

    if (mergedResults.length === 0) {
      updateNameCards([]);
      return;
    }

    updateNameCards(mergedResults);

  } catch (error) {
    console.error('Errore durante la ricerca:', error);
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
    showOverlayLoader();
    const characterDetails = await getCharacterDetails(characterId);
    if (!characterDetails) {
      hideOverlay();
      return;
    }
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
    await fetchCardsAndUpdate(currentPage);
  } catch (error) {
    console.error('Errore durante la vendita della carta:', error);
    alert('Errore durante la vendita della carta.');
  }
}