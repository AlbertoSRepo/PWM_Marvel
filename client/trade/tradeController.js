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
  getFigurineDataOrThrow,
  convertThumbnailStringToObj,
  mergeServerAndLocalData
} from '../shared/cardUtils.js';

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

export async function createTradeProposal(proposedCards) {
  if (!proposedCards || proposedCards.length === 0) {
    alert('Devi selezionare almeno una carta per inviare la proposta.');
    return;
  }

  try {
    await postTradeProposalAPI(proposedCards);
    alert('Proposta di trade creata con successo!');

    // 1. Nascondi l'overlay dopo aver creato la proposta
    hideOverlayUI();

    // 2. Aggiorna la lista delle proposte dell’utente
    const userProposals = await fetchUserProposalsAPI();
    updateUserProposalsUI(userProposals);

    // 3. Ricarica le carte disponibili, in modo da riflettere lo “scalare” di available_quantity
    await loadUserCards(1);

  } catch (error) {
    console.error('Errore durante la creazione della proposta di trade:', error);
    alert(`Errore: ${error.message}`);
  }
}


/**
 * Ricerca locale delle carte che iniziano con "name",
 * e mostra SOLO quelle possedute (quantity>0) nella UI trade.
 */
export async function searchCardsLocallyAndUpdate(name) {
  try {
    const figurineData = getFigurineDataOrThrow();

    const matchedLocalCards = figurineData.filter(fig =>
      fig.name.toLowerCase().startsWith(name.toLowerCase())
    );
    if (matchedLocalCards.length === 0) {
      updateCardSelectionUI([]);
      return;
    }

    const matchedIds = matchedLocalCards.map(fig => fig.id);
    const serverData = await getCardsByIds(matchedIds);

    // Filtra e unisci
    const merged = mergeServerAndLocalData(serverData.cards, matchedLocalCards, true);
    if (merged.length === 0) {
      updateCardSelectionUI([]);
      return;
    }

    updateCardSelectionUI(merged);

  } catch (error) {
    console.error('Errore durante la ricerca:', error);
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

export async function deleteTrade(tradeId) {
  try {
    await deleteTradeAPI(tradeId);
    alert('Proposta cancellata con successo');

    // 1. Aggiorna la lista delle proposte dell'utente
    const userProposals = await fetchUserProposalsAPI();
    updateUserProposalsUI(userProposals);

    // 2. Ricarica le carte disponibili (se la proposta conteneva carte “bloccate”, adesso tornano libere)
    await loadUserCards(1);

  } catch (error) {
    console.error('Errore durante la cancellazione della proposta:', error);
    alert('Errore durante la cancellazione della proposta.');
  }
}

export async function deleteOffer(offerId) {
  try {
    await deleteOfferAPI(offerId);
    alert('Offerta cancellata con successo');

    // 1. Aggiorna la lista delle offerte dell'utente
    const userOffers = await fetchUserOffersAPI();
    updateUserOffersUI(userOffers);

    // 2. Ricarica le carte disponibili, in modo da “restituire” la available_quantity
    await loadUserCards(1);

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

  const overlayTitle = document.getElementById('overlay-title');
  overlayTitle.textContent = 'Seleziona le carte da offrire';

  const submitBtn = document.getElementById('submit-trade-offer-btn');
  submitBtn.textContent = 'Invia Offerta';

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

      // (1) Svuota le carte selezionate e nascondi overlay
      selectedCardsRef.value = [];
      updateSelectedCardsListUI(selectedCardsRef.value);
      hideOverlayUI();

      // (2) Ricarica “Le tue Offerte”, cosi’ vedi subito la nuova offerta
      const userOffers = await fetchUserOffersAPI();
      updateUserOffersUI(userOffers);

      // (3) Ricarica le carte disponibili (l’utente ha appena “bloccato” quelle carte)
      await loadUserCards(1);

      // (4) (Opzionale) Ricarica eventuali “Proposte della Community”
      // se vuoi che l’utente veda immediatamente la proposta e la possibilità di offrire altre carte
      // const communityTrades = await fetchCommunityTradesAPI();
      // updateCommunityTradesUI(communityTrades);

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

export async function acceptOffer(tradeId, offerId) {
  try {
    await putAcceptOfferAPI(tradeId, offerId);
    alert('Offerta accettata con successo!');

    // 1) Nascondi overlay "Gestisci Proposta"
    hideManageProposalOverlayUI();

    // 2) Ricarica le proposte dell’utente
    const userProposals = await fetchUserProposalsAPI();
    updateUserProposalsUI(userProposals);

    // 3) Ricarica le offerte dell’utente
    const userOffers = await fetchUserOffersAPI();
    updateUserOffersUI(userOffers);

    // 4) Ricarica le carte possedute (ora l’utente ha scambiato carte)
    await loadUserCards(1);

    // 5) (Opzionale) Ricarica Community Trades, se vuoi mostrare
    // immediatamente una lista di proposte "pulita"
    const communityTrades = await fetchCommunityTradesAPI();
    updateCommunityTradesUI(communityTrades);

  } catch (error) {
    alert(`Errore: ${error.message}`);
  }
}

