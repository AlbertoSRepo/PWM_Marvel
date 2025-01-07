// tradeController.js

import {
    fetchCommunityTradesAPI,
    fetchUserProposalsAPI,
    fetchUserOffersAPI,
    deleteOfferAPI,
    postTradeProposalAPI,
    getCardsByNameAPI,
    getUserCardsAPI,
    deleteTradeAPI,
    putAcceptOfferAPI,
    getUserProposalWithOffersAPI,
    getOfferedCardsAPI,
    postOfferAPI
  } from './tradeRoute.js';
  
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
   * Ricerca carte per nome
   */
  export async function searchCardsByName(name) {
    try {
      const data = await getCardsByNameAPI(name);
      updateCardSelectionUI(data);
    } catch (error) {
      alert(`Errore: ${error.message}`);
    }
  }
  
  /**
   * Carica le carte dell'utente (paginazione) per la selezione.
   */
  export async function loadUserCards(pageNumber) {
    try {
      const cards = await getUserCardsAPI(pageNumber);
      updateCardSelectionUI(cards);
      updatePaginationButtonsUI(pageNumber, cards.length);
    } catch (error) {
      console.error('Errore durante il caricamento delle carte:', error);
      alert(`Errore: ${error.message}`);
    }
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
  