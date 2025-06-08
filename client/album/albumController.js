// albumController.js

// Import delle API routes per chiamate al server
import {
  getCardsByIds,
  getCharacterDetails,
  sellCardAPI
} from './albumRoute.js';

// Import delle funzioni UI per aggiornamento interfaccia
import {
  showLoadingSpinner,
  hideLoadingSpinner,
  updateCards,
  updateNameCards,
  hideOverlay,
  updatePaginationButtons,
  showOverlayLoader,
  hideOverlayLoader,
  populateCharacterOverlay
} from './albumUI.js';

// Import helper per aggiornamento crediti navbar
import { updateNavbarCredits } from '../shared/uiHelpers.js';

// Import utility condivise per gestione dati carte
import {
  getFigurineDataOrThrow,
  convertThumbnailStringToObj,
  mergeServerAndLocalData
} from '../shared/cardUtils.js';

/**
 * Carica 18 carte della pagina richiesta e aggiorna UI con dati server
 */
export async function fetchCardsAndUpdate(pageNumber) {
  try {
    showLoadingSpinner(); // Mostra spinner di caricamento

    // Recupera dati figurine da localStorage
    const figurineData = getFigurineDataOrThrow();

    // Calcola indici per slice di 18 carte per pagina
    const cardsPerPage = 18;
    const startIndex = (pageNumber - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    // Estrae carte della pagina e ottiene loro ID
    const pageItems = figurineData.slice(startIndex, endIndex);
    const pageIds = pageItems.map(item => item.id);

    // Richiede quantità possedute dal server per questi ID
    const serverData = await getCardsByIds(pageIds);

    // Combina dati locali con quantità server per ogni carta
    const mergedCards = serverData.cards.map(serverCard => {
      const localFig = pageItems.find(fig => fig.id === serverCard.id);

      if (serverCard.quantity > 0) {
        if (!localFig) {
          // Carta posseduta ma dati locali mancanti
          return {
            id: serverCard.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'posseduta',
            quantity: serverCard.quantity
          };
        }

        // Carta posseduta con dati locali completi
        const thumbObj = convertThumbnailStringToObj(localFig.thumbnail);
        return {
          id: serverCard.id,
          name: localFig.name,
          thumbnail: thumbObj,
          state: 'posseduta',
          quantity: serverCard.quantity
        };
      } else {
        // Carta non posseduta
        return {
          id: serverCard.id,
          name: 'Carta sconosciuta',
          thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
          state: 'non-posseduta',
          quantity: 0
        };
      }
    });

    // Aggiorna interfaccia con carte, crediti e paginazione
    updateCards(mergedCards);
    updateNavbarCredits(serverData.credits);
    updatePaginationButtons(pageNumber);

  } catch (error) {
    console.error('Errore loadUserCards:', error);
    alert(`Errore: ${error.message}`);
  } finally {
    hideLoadingSpinner(); // Nasconde spinner sempre
  }
}

/**
 * Cerca carte localmente per nome e mostra solo quelle possedute
 */
export async function searchCardsLocallyAndUpdate(searchString) {
  try {
    showLoadingSpinner(); // Mostra spinner durante ricerca

    // Se ricerca vuota, ricarica pagina corrente
    if (!searchString || searchString.trim() === '') {
      const currentPage = parseInt(document.getElementById('albumPage').value || '1', 10);
      await fetchCardsAndUpdate(currentPage);
      return;
    }

    // Filtra carte locali che iniziano con testo ricerca
    const figurineData = getFigurineDataOrThrow();
    const matchedLocalCards = figurineData.filter(fig =>
      fig.name.toLowerCase().startsWith(searchString.toLowerCase())
    );
    
    // Se nessuna corrispondenza locale, mostra UI vuota
    if (matchedLocalCards.length === 0) {
      updateNameCards([]);
      return;
    }

    // Richiede quantità server per carte trovate
    const matchedIds = matchedLocalCards.map(fig => fig.id);
    const serverData = await getCardsByIds(matchedIds);

    updateNavbarCredits(serverData.credits); // Aggiorna crediti

    // Combina dati e filtra solo carte possedute
    const mergedResults = mergeServerAndLocalData(serverData.cards, matchedLocalCards, true);

    // Aggiorna UI con risultati o array vuoto
    if (mergedResults.length === 0) {
      updateNameCards([]);
      return;
    }

    updateNameCards(mergedResults);

  } catch (error) {
    console.error('Errore durante la ricerca:', error);
    alert('Si è verificato un errore durante la ricerca delle carte.');
  } finally {
    hideLoadingSpinner(); // Nasconde spinner sempre
  }
}

/**
 * Recupera dettagli personaggio da server e popola overlay
 */
export async function showOverlayWithDetails(characterId) {
  try {
    showOverlayLoader(); // Mostra overlay con spinner
    
    // Richiede dettagli personaggio al server
    const characterDetails = await getCharacterDetails(characterId);
    
    // Se nessun dato, chiude overlay
    if (!characterDetails) {
      hideOverlay();
      return;
    }
    
    // Popola overlay con dati ricevuti
    populateCharacterOverlay(characterDetails);
    
  } catch (error) {
    console.error('Errore durante il recupero dei dettagli:', error);
    alert('Si è verificato un errore durante il caricamento dei dettagli.');
    hideOverlay(); // Chiude overlay in caso errore
  } finally {
    hideOverlayLoader(); // Nasconde spinner overlay sempre
  }
}

/**
 * Vende carta tramite API e ricarica pagina corrente
 */
export async function sellCard(cardId, currentPage) {
  try {
    await sellCardAPI(cardId); // Chiama API vendita
    alert('Carta venduta con successo!');
    hideOverlay(); // Chiude overlay
    await fetchCardsAndUpdate(currentPage); // Ricarica pagina per aggiornare quantità
  } catch (error) {
    console.error('Errore durante la vendita della carta:', error);
    alert('Errore durante la vendita della carta.');
  }
}