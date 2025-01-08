// albumController.js

import {
  getCards,
  searchCardsByName,
  getCharacterDetails,
  sellCardAPI,
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

// albumController.js

/**
 * Carica le carte di una certa pagina e aggiorna la UI,
 * creando un array di carte possedute e non possedute.
 */
export async function fetchCardsAndUpdate(pageNumber) {
  try {
    showLoadingSpinner();

    // Risposta dal server: { credits, cards: [ { id, quantity }, ... ] }
    const data = await getCards(pageNumber);

    // Recupero dal localStorage le info globali (id, name, thumbnail) 
    // già salvate all’avvio con fetchFigurineDataIfNeeded().
    const figurineData = JSON.parse(localStorage.getItem('figurineData'));

    // Creo il nuovo array con la logica “posseduta”/“non posseduta”.
    const mergedCards = data.cards.map(card => {
      // Se la carta è posseduta (quantity > 0), cerco i dettagli nel localStorage
      if (card.quantity > 0) {
        const matchedFig = figurineData.find(fig => fig.id === card.id);

        if (!matchedFig) {
          // Fallback se non trovo la corrispondenza
          return {
            id: card.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'posseduta',
            quantity: card.quantity
          };
        }

        // matchedFig = { id, name, thumbnail: "http://..." }
        // Convertiamo la stringa thumbnail in { path, extension }
        const thumbObj = convertThumbnailStringToObj(matchedFig.thumbnail);

        return {
          id: card.id,
          name: matchedFig.name,
          thumbnail: thumbObj,
          state: 'posseduta',
          quantity: card.quantity
        };
      } 
      else {
        // Carta non posseduta
        return {
          id: card.id,
          name: 'Carta sconosciuta',
          thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
          state: 'non posseduta',
          quantity: 0
        };
      }
    });

    // Invio l’array di carte (possedute e non) all’UI
    updateCards(mergedCards);
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
 * Converte la thumbnail in stringa (es. "http://.../image.jpg")
 * in un oggetto { path, extension } compatibile con la UI.
 */
function convertThumbnailStringToObj(thumbnailUrl) {
  if (!thumbnailUrl) {
    return { path: 'placeholder-image', extension: 'jpeg' };
  }

  const lastDot = thumbnailUrl.lastIndexOf('.');
  if (lastDot === -1) {
    // Se non trovo un punto, metto tutto come path
    return { path: thumbnailUrl, extension: 'jpeg' };
  }

  const path = thumbnailUrl.substring(0, lastDot);
  const extension = thumbnailUrl.substring(lastDot + 1);

  return { path, extension };
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
