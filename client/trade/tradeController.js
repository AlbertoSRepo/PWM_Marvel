// tradeController.js

import {
    fetchCommunityTradesAPI,
    fetchUserProposalsAPI,
    fetchUserOffersAPI,
    deleteOfferAPI,
    postTradeProposalAPI,
    deleteTradeAPI,
    putAcceptOfferAPI,
    getUserProposalWithOffersAPI,
    getPossessedCardsAPI,
    postOfferAPI
  } from './tradeRoute.js';

import { getCardsByIds } from '../album/albumRoute.js';  

  import {
    showOverlayUI,
    hideOverlayUI,
    showManageProposalOverlayUI,
    hideManageProposalOverlayUI,
    updateCommunityTradesUI,
    updateUserProposalsUI,
    updateUserOffersUI,
    updateCardSelectionUI,
    updateSelectedCardsListUI,
    updatePaginationButtonsUI,
    updateManageProposalOffersUI
  } from './tradeUI.js';
  
  /**
   * Carica inizialmente:
   *  - proposte community
   *  - proposte utente
   *  - offerte utente
   */
  export async function loadInitialData() {
    try {
      const [communityTrades, userProposals, userOffers] = await Promise.all([
        fetchCommunityTradesAPI(),
        fetchUserProposalsAPI(),
        fetchUserOffersAPI()
      ]);
      updateCommunityTradesUI(communityTrades);
      updateUserProposalsUI(userProposals);
      updateUserOffersUI(userOffers);
    } catch (error) {
      console.error('Errore durante il caricamento iniziale:', error);
      alert('Errore durante il caricamento dei dati iniziali.');
    }
  }
  
  /**
   * Creazione di una nuova proposta di trade
   */
  export async function createTradeProposal(proposedCards) {
    if (!proposedCards || proposedCards.length === 0) {
      alert('Devi selezionare almeno una carta per inviare la proposta.');
      return;
    }
  
    try {
      await postTradeProposalAPI(proposedCards);
      alert('Proposta di trade creata con successo!');
      hideOverlayUI();
      // Dopo la creazione, ricarichiamo le proposte utente
      const proposals = await fetchUserProposalsAPI();
      updateUserProposalsUI(proposals);
    } catch (error) {
      console.error('Errore durante la creazione della proposta di trade:', error);
      alert(`Errore: ${error.message}`);
    }
  }
  
/**
 * Ricerca locale per nome e mostra solo le carte possedute che matchano la stringa.
 */
export async function searchCardsLocallyAndUpdate(name) {
  try {
    // 1) Recupera figurineData dal localStorage
    const figurineData = JSON.parse(localStorage.getItem('figurineData'));
    if (!figurineData) {
      throw new Error('figurineData non presente in Local Storage');
    }

    // 2) Filtro locale: carte che “iniziano con name”
    const matchedLocalCards = figurineData.filter(fig =>
      fig.name.toLowerCase().startsWith(name.toLowerCase())
    );

    // Se non trovo corrispondenze, mostro UI vuota
    if (matchedLocalCards.length === 0) {
      updateCardSelectionUI([]); // l’UI dirà "Nessuna carta trovata."
      return;
    }

    // 3) Estraggo solo gli ID
    const matchedIds = matchedLocalCards.map(fig => fig.id);

    // 4) Chiamo il server (POST /api/album/cardsByIds) per sapere la quantity dell’utente
    const serverData = await getCardsByIds(matchedIds);
    // serverData = { credits, cards: [ { id, quantity }, ... ] }

    // 5) Filtra solo le carte possedute (quantity > 0), se vuoi mostrare solo le possedute
    const possessedOnly = serverData.cards.filter(sc => sc.quantity > 0);
    if (possessedOnly.length === 0) {
      // L’utente non possiede nessuna delle carte corrispondenti
      updateCardSelectionUI([]);
      return;
    }

    // 6) “Fondi” i dati: 
    // Se quantity>0 => 'posseduta', prendi nome e thumbnail dal figurineData
    const mergedResults = possessedOnly.map(sc => {
      const localFig = matchedLocalCards.find(fig => fig.id === sc.id);
      if (!localFig) {
        // fallback
        return {
          id: sc.id,
          name: 'Carta sconosciuta',
          thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
          state: 'posseduta',
          quantity: sc.quantity
        };
      }

      const thumbObj = convertThumbnailStringToObj(localFig.thumbnail);
      return {
        id: sc.id,
        name: localFig.name,
        thumbnail: thumbObj,
        state: 'posseduta',
        quantity: sc.quantity
      };
    });

    // 7) Aggiorna l’UI
    updateCardSelectionUI(mergedResults);

  } catch (error) {
    console.error('Errore durante la ricerca carte per nome:', error);
    alert('Si è verificato un errore durante la ricerca delle carte.');
  }
}

  export async function loadUserCards(pageNumber) {
    try {
      const limit = 28;
      const offset = (pageNumber - 1) * limit;
  
      // 1. Chiamo l'endpoint
      const { total, cards } = await getPossessedCardsAPI(limit, offset);
      // cards = [ { id, quantity }, ... ]
  
      // 2. Unisco i dati con "figurineData" dal localStorage
      const figurineData = JSON.parse(localStorage.getItem('figurineData'));
      if (!figurineData) {
        throw new Error('figurineData non presente in localStorage');
      }
  
      // 3. Mappo in un array di {id, name, thumbnail, quantity, state:'posseduta'}
      //   (perché se siamo in "possessed", quantity>0)
      const merged = cards.map(sc => {
        const localFig = figurineData.find(f => f.id === sc.id);
        if (!localFig) {
          return {
            id: sc.id,
            name: 'Carta sconosciuta',
            thumbnail: { path: 'placeholder-image', extension: 'jpeg' },
            state: 'posseduta',
            quantity: sc.quantity
          };
        }
        const thumbObj = convertThumbnailStringToObj(localFig.thumbnail);
        return {
          id: sc.id,
          name: localFig.name,
          thumbnail: thumbObj,
          state: 'posseduta',
          quantity: sc.quantity
        };
      });
  
      // 4. Aggiorno la UI
      updateCardSelectionUI(merged);
      // updatePaginationButtonsUI => calcolo quante “pagine” totali in base a `total`
      const totalPages = Math.ceil(total / limit);
      // Se pageNumber < totalPages => next abilitato, etc...
      updatePaginationButtonsUI(pageNumber, merged.length, totalPages);
  
    } catch (error) {
      console.error('Errore loadUserPossessedCards:', error);
      alert(`Errore: ${error.message}`);
    }
  }
  
  function convertThumbnailStringToObj(thumbnailUrl) {
    if (!thumbnailUrl) {
      return { path: 'placeholder-image', extension: 'jpeg' };
    }
    const lastDot = thumbnailUrl.lastIndexOf('.');
    if (lastDot === -1) {
      return { path: thumbnailUrl, extension: 'jpeg' };
    }
    return {
      path: thumbnailUrl.substring(0, lastDot),
      extension: thumbnailUrl.substring(lastDot + 1),
    };
  }
  
  /**
   * Cancella una proposta di trade
   */
  export async function deleteTrade(tradeId) {
    try {
      await deleteTradeAPI(tradeId);
      alert('Proposta cancellata con successo');
  
      // Aggiorna la lista delle proposte dell’utente
      const userProposals = await fetchUserProposalsAPI();
      updateUserProposalsUI(userProposals);
    } catch (error) {
      console.error('Errore durante la cancellazione della proposta:', error);
      alert('Errore durante la cancellazione della proposta.');
    }
  }
  
  /**
   * Cancella un'offerta
   */
  export async function deleteOffer(offerId) {
    try {
      await deleteOfferAPI(offerId);
      alert('Offerta cancellata con successo');
  
      // Ricarica la lista delle offerte
      const userOffers = await fetchUserOffersAPI();
      updateUserOffersUI(userOffers);
    } catch (error) {
      console.error('Errore durante la cancellazione dell’offerta:', error);
      alert('Errore durante la cancellazione dell’offerta.');
    }
  }
  
  /**
   * Mostra overlay per inviare un'offerta (usando carte selezionate)
   */
  export function showOfferOverlay(tradeId, selectedCardsRef) {
    showOverlayUI();
    // Cambiamo il testo del titolo e del bottone
    const overlayTitle = document.getElementById('overlay-title');
    overlayTitle.textContent = 'Seleziona le carte da offrire';
    const submitBtn = document.getElementById('submit-trade-offer-btn');
    submitBtn.textContent = 'Invia Offerta';
  
    // Impostiamo la callback per l’invio dell’offerta
    submitBtn.onclick = async () => {
      if (selectedCardsRef.value.length === 0) {
        alert('Devi selezionare almeno una carta.');
        return;
      }
      const offeredCards = selectedCardsRef.value.map(card => ({
        card_id: card.id,
        quantity: 1
      }));
  
      try {
        await postOfferAPI(tradeId, offeredCards);
        alert('Offerta inviata con successo!');
        selectedCardsRef.value = [];
        updateSelectedCardsListUI(selectedCardsRef.value);
        hideOverlayUI();
      } catch (error) {
        console.error('Errore durante l’invio dell’offerta:', error);
        alert(`Errore: ${error.message}`);
      }
    };
  
    // Carichiamo le carte dell'utente (pagina 1)
    loadUserCards(1);
  }
  
  /**
   * Gestisci overlay "Gestisci Proposta"
   */
  export async function showManageProposalOverlay(tradeId) {
    showManageProposalOverlayUI();
  
    try {
      const trade = await getUserProposalWithOffersAPI(tradeId);
      if (!trade) {
        throw new Error('Nessuna trade trovata.');
      }
      // Popola l’overlay con le offerte
      updateManageProposalOffersUI(trade);
    } catch (error) {
      console.error('Errore durante il caricamento della proposta e delle carte offerte:', error);
      alert('Errore durante il caricamento della proposta e delle carte offerte.');
      hideManageProposalOverlayUI();
    }
  }
  
  /**
   * Accetta un'offerta
   */
  export async function acceptOffer(tradeId, offerId) {
    try {
      await putAcceptOfferAPI(tradeId, offerId);
      alert('Offerta accettata con successo!');
      hideManageProposalOverlayUI();
    } catch (error) {
      alert(`Errore: ${error.message}`);
    }
  }
  