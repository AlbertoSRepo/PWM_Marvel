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
  postOfferAPI,
  getTradeDetailsAPI
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
  updateManageProposalOffersUI,
  showViewCardsOverlayUI,
  hideViewCardsOverlayUI,
  updateViewCardsOverlayUI  // AGGIUNGI QUESTO IMPORT
} from './tradeUI.js';

/**
 * Verifica se l'utente possiede tutte le carte specificate
 */
export async function checkUserOwnsCards(cardIds) {
  try {
    const response = await getCardsByIds(cardIds);
    if (!response || !response.cards) {
      return false;
    }
    
    // Verifica che tutte le carte abbiano quantity > 0
    return response.cards.every(card => card.quantity > 0);
  } catch (error) {
    console.error('Errore nella verifica delle carte possedute:', error);
    return false;
  }
}

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
 * Se name è vuoto, mostra tutte le carte disponibili.
 */
export async function searchCardsLocallyAndUpdate(name) {
  try {
    // Se la stringa di ricerca è vuota, carica tutte le carte (pagina 1)
    if (!name || name.trim() === '') {
      await loadUserCards(1);
      return;
    }

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

/**
 * Ricerca locale per offerte, escludendo carte già presenti nella proposta
 */
export async function searchCardsLocallyAndUpdateForOffer(name, tradeId) {
  try {
    if (!name || name.trim() === '') {
      await loadUserCardsForOffer(1, tradeId);
      return;
    }

    // 1. Ottieni le carte della proposta da escludere usando il nuovo endpoint
    const trade = await getTradeDetailsAPI(tradeId);
    const proposedCardIds = trade.proposed_cards.map(card => Number(card.card_id));

    const figurineData = getFigurineDataOrThrow();

    const matchedLocalCards = figurineData.filter(fig =>
      fig.name.toLowerCase().startsWith(name.toLowerCase()) &&
      !proposedCardIds.includes(Number(fig.id)) // Escludi carte già proposte
    );
    
    if (matchedLocalCards.length === 0) {
      updateCardSelectionUI([]);
      return;
    }

    const matchedIds = matchedLocalCards.map(fig => fig.id);
    const serverData = await getCardsByIds(matchedIds);

    const merged = mergeServerAndLocalData(serverData.cards, matchedLocalCards, true);
    
    if (merged.length === 0) {
      updateCardSelectionUI([]);
      return;
    }

    updateCardSelectionUI(merged);

  } catch (error) {
    console.error('Errore durante la ricerca per offerta:', error);
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

      selectedCardsRef.value = [];
      updateSelectedCardsListUI(selectedCardsRef.value);
      hideOverlayUI();

      // Reset del tradeId corrente
      window.currentTradeId = null;

      const userOffers = await fetchUserOffersAPI();
      updateUserOffersUI(userOffers);

      await loadUserCards(1);

    } catch (error) {
      console.error('Errore durante l\'invio dell\'offerta:', error);
      alert(`Errore: ${error.message}`);
    }
  };

  // Carica le carte filtrate per l'offerta
  loadUserCardsForOffer(1, tradeId);
}

/**
 * Carica le carte dell'utente escludendo quelle già presenti nella proposta
 */
export async function loadUserCardsForOffer(pageNumber, tradeId) {
  try {
    const limit = 28;
    const offset = (pageNumber - 1) * limit;

    // 1. Ottieni i dettagli della proposta usando il nuovo endpoint
    const trade = await getTradeDetailsAPI(tradeId);
    const proposedCardIds = trade.proposed_cards.map(card => Number(card.card_id));

    // 2. Chiama l'endpoint per le carte possedute
    const { total, cards } = await getPossessedCardsAPI(limit, offset);

    // 3. Filtra le carte escludendo quelle già presenti nella proposta
    const filteredCards = cards.filter(card => !proposedCardIds.includes(Number(card.id)));

    // 4. Unisci i dati con figurineData
    const figurineData = JSON.parse(localStorage.getItem('figurineData'));
    if (!figurineData) {
      throw new Error('figurineData non presente in localStorage');
    }

    const merged = filteredCards.map(sc => {
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

    updateCardSelectionUI(merged);
    const totalPages = Math.ceil(total / limit);
    updatePaginationButtonsUI(pageNumber, merged.length, totalPages);

  } catch (error) {
    console.error('Errore loadUserCardsForOffer:', error);
    alert(`Errore: ${error.message}`);
  }
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

/**
 * Mostra l'overlay con le carte di una proposta specifica
 */
export async function showViewCardsOverlay(tradeId) {
  try {
    showViewCardsOverlayUI();
    
    // Ottieni i dettagli della proposta
    console.log('Richiesta dettagli per trade ID:', tradeId);
    const trade = await getTradeDetailsAPI(tradeId);
    console.log('Dettagli trade ricevuti:', trade);
    
    if (!trade) {
      throw new Error('Proposta non trovata.');
    }

    // Verifica che trade.proposed_cards esista
    if (!trade.proposed_cards || !Array.isArray(trade.proposed_cards)) {
      throw new Error('Dati delle carte proposte non validi.');
    }

    // Popola le carte con i dettagli (nome e immagine)
    const populatedTrade = await populateTradeWithCardDetails(trade);
    
    // Aggiorna l'overlay con le carte
    updateViewCardsOverlayUI(populatedTrade);
    
  } catch (error) {
    console.error('Errore durante il caricamento delle carte della proposta:', error);
    console.error('Stack trace completo:', error.stack);
    alert(`Errore durante il caricamento delle carte della proposta: ${error.message}`);
    hideViewCardsOverlayUI();
  }
}

/**
 * Popola una trade con i dettagli delle carte (nome e immagine)
 */
async function populateTradeWithCardDetails(trade) {
  try {
    console.log('Popolamento dettagli per trade:', trade);
    
    const figurineData = JSON.parse(localStorage.getItem('figurineData'));
    if (!figurineData) {
      throw new Error('figurineData non presente in localStorage');
    }

    // Verifica che proposed_cards sia un array valido
    if (!trade.proposed_cards || !Array.isArray(trade.proposed_cards)) {
      throw new Error('Le carte proposte non sono in un formato valido');
    }

    // Ottieni i dettagli delle carte dall'API Marvel se necessario
    const cardIds = trade.proposed_cards.map(card => {
      const cardId = Number(card.card_id);
      if (isNaN(cardId)) {
        console.warn('Card ID non valido:', card.card_id);
        return null;
      }
      return cardId;
    }).filter(id => id !== null);

    console.log('Card IDs da processare:', cardIds);

    if (cardIds.length === 0) {
      throw new Error('Nessun ID carta valido trovato');
    }

    const serverData = await getCardsByIds(cardIds);
    console.log('Dati server ricevuti:', serverData);
    
    // Unisci i dati server con quelli locali
    const populatedCards = trade.proposed_cards.map(card => {
      const cardId = Number(card.card_id);
      
      if (isNaN(cardId)) {
        console.warn('Skipping invalid card ID:', card.card_id);
        return {
          ...card,
          name: 'Carta non valida',
          thumbnail: { path: 'placeholder-image', extension: 'jpeg' }
        };
      }

      const localCard = figurineData.find(f => f.id === cardId);
      const serverCard = serverData.cards ? serverData.cards.find(c => c.id === cardId) : null;
      
      return {
        ...card,
        name: localCard?.name || serverCard?.name || 'Carta sconosciuta',
        thumbnail: localCard ? convertThumbnailStringToObj(localCard.thumbnail) : 
                   (serverCard?.thumbnail || { path: 'placeholder-image', extension: 'jpeg' })
      };
    });

    console.log('Carte popolate:', populatedCards);

    return {
      ...trade,
      proposed_cards: populatedCards
    };
    
  } catch (error) {
    console.error('Errore durante il popolamento dei dettagli delle carte:', error);
    throw error;
  }
}

