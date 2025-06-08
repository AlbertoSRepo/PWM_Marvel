// tradeListeners.js
import { loadNavbar } from '../shared/navbar.js';
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js'; 
import {
  loadInitialData,
  createTradeProposal,
  searchCardsLocallyAndUpdate,
  searchCardsLocallyAndUpdateForOffer,
  loadUserCards,
  loadUserCardsForOffer,
  deleteTrade,
  deleteOffer,
  showOfferOverlay,
  showManageProposalOverlay,
  acceptOffer,
  showViewCardsOverlay,
  showViewProposalCardsOverlay,
  showViewOfferCardsOverlay
} from './tradeController.js';

import {
  hideOverlayUI,
  hideManageProposalOverlayUI,
  updateSelectedCardsListUI,
  hideViewCardsOverlayUI
} from './tradeUI.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Carica la navbar
  loadNavbar('trade');

  // 2. Verifica/recupera il file JSON dal server
  try {
    const figurineData = await fetchFigurineDataIfNeeded();
    if (figurineData) {
      console.log('Figurine data caricato o già presente:', figurineData);
    } else {
      console.warn('Nessun figurineData ottenuto dal server e/o localStorage');
    }
  } catch (error) {
    console.error('Errore in fase di caricamento figurineData:', error);
  }

  // Stato interno
  const selectedCards = {
    value: []
  };
  let currentPage = 1;

  // 3. Carica dati iniziali
  await loadInitialData();

  // 4. Event listener: click su "Crea Nuova Proposta"
  const createTradeBtn = document.getElementById('create-trade-btn');
  createTradeBtn.addEventListener('click', () => {
    showOverlayUIForNewProposal();
    loadUserCards(1);
  });

  // Funzione di supporto per aprire overlay in modalità "nuova proposta"
  function showOverlayUIForNewProposal() {
    const overlayBackground = document.getElementById('overlay-background');
    const overlay = document.getElementById('overlay');
    overlayBackground.style.display = 'block';
    overlay.style.display = 'block';

    const overlayTitle = document.getElementById('overlay-title');
    overlayTitle.textContent = 'Seleziona le tue carte';
    const submitBtn = document.getElementById('submit-trade-offer-btn');
    submitBtn.textContent = 'Invia Proposta';
    submitBtn.onclick = () => {
      if (selectedCards.value.length === 0) {
        alert('Devi selezionare almeno una carta per inviare la proposta.');
        return;
      }
      const proposedCards = selectedCards.value.map(card => ({
        card_id: card.id,
        quantity: 1
      }));
      createTradeProposal(proposedCards);
      selectedCards.value = [];
      updateSelectedCardsListUI(selectedCards.value);
    };
  }

  // 5. Event listener: cercare carte per nome
  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.trim();
    
    const overlayTitle = document.getElementById('overlay-title');
    const isOfferMode = overlayTitle.textContent === 'Seleziona le carte da offrire';
    
    if (isOfferMode && window.currentTradeId) {
      searchCardsLocallyAndUpdateForOffer(searchQuery, window.currentTradeId);
    } else {
      searchCardsLocallyAndUpdate(searchQuery);
    }
  });

  // Aggiungi anche l'evento per il tasto "Enter" nell'input di ricerca
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const searchQuery = event.target.value.trim();
      
      const overlayTitle = document.getElementById('overlay-title');
      const isOfferMode = overlayTitle.textContent === 'Seleziona le carte da offrire';
      
      if (isOfferMode && window.currentTradeId) {
        searchCardsLocallyAndUpdateForOffer(searchQuery, window.currentTradeId);
      } else {
        searchCardsLocallyAndUpdate(searchQuery);
      }
    }
  });

  // 6. Paginazione (prev / next)
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      
      const overlayTitle = document.getElementById('overlay-title');
      const isOfferMode = overlayTitle.textContent === 'Seleziona le carte da offrire';
      
      if (isOfferMode && window.currentTradeId) {
        loadUserCardsForOffer(currentPage, window.currentTradeId);
      } else {
        loadUserCards(currentPage);
      }
    }
  });

  nextPageBtn.addEventListener('click', () => {
    currentPage++;
    
    const overlayTitle = document.getElementById('overlay-title');
    const isOfferMode = overlayTitle.textContent === 'Seleziona le carte da offrire';
    
    if (isOfferMode && window.currentTradeId) {
      loadUserCardsForOffer(currentPage, window.currentTradeId);
    } else {
      loadUserCards(currentPage);
    }
  });

  // 7. Selezione carte (event delegation)
  const cardSelection = document.getElementById('card-selection');
  cardSelection.addEventListener('click', (event) => {
    const cardElement = event.target.closest('.card');
    if (!cardElement) return;

    const cardId = cardElement.querySelector('.card-id').textContent.split(': ')[1];
    const cardName = cardElement.querySelector('.card-title').textContent;

    toggleCardSelection(cardId, cardName, cardElement);
  });

  function toggleCardSelection(cardId, cardName, element) {
    const isAlreadySelected = selectedCards.value.some(sc => sc.id === cardId);
    if (isAlreadySelected) {
      selectedCards.value = selectedCards.value.filter(sc => sc.id !== cardId);
      element.classList.remove('selected-card');
    } else {
      if (selectedCards.value.length >= 5) {
        alert('Puoi selezionare solo 5 carte.');
        return;
      }
      
      const cardImg = element.querySelector('.card-img-top');
      const imageSrc = cardImg ? cardImg.src : '';
      
      let thumbnail = null;
      if (imageSrc && !imageSrc.includes('placeholder-image')) {
        const lastDotIndex = imageSrc.lastIndexOf('.');
        if (lastDotIndex > 0) {
          const path = imageSrc.substring(0, lastDotIndex);
          const extension = imageSrc.substring(lastDotIndex + 1);
          thumbnail = { path, extension };
        }
      }
      
      selectedCards.value.push({ 
        id: cardId, 
        name: cardName,
        thumbnail: thumbnail
      });
      element.classList.add('selected-card');
    }
    updateSelectedCardsListUI(selectedCards.value);
  }

  // Aggiungi funzione globale per rimuovere carte selezionate
  window.removeSelectedCard = function(cardId) {
    selectedCards.value = selectedCards.value.filter(sc => sc.id !== cardId);
    
    const allCards = document.querySelectorAll('#card-selection .marvel-card .card-id');
    allCards.forEach(cardIdElement => {
      if (cardIdElement.textContent.includes(cardId)) {
        const cardElement = cardIdElement.closest('.card');
        if (cardElement) {
          cardElement.classList.remove('selected-card');
        }
      }
    });
    
    updateSelectedCardsListUI(selectedCards.value);
  };

  // 8. Community trades: event delegation per "Invia Offerta" e "View"
  const communityTrades = document.getElementById('community-trades');
  communityTrades.addEventListener('click', (event) => {
    const offerBtn = event.target.closest('.btn-primary');
    const viewBtn = event.target.closest('.btn-info');
    
    if (offerBtn && !offerBtn.disabled) {
      const tradeId = offerBtn.getAttribute('data-trade-id');
      if (tradeId) {
        window.currentTradeId = tradeId;
        showOfferOverlay(tradeId, selectedCards);
      }
    }
    
    if (viewBtn) {
      const tradeId = viewBtn.getAttribute('data-trade-id');
      if (tradeId) {
        showViewCardsOverlay(tradeId);
      }
    }
  });

  // Event listener per chiudere l'overlay di visualizzazione carte
  const closeViewCardsBtn = document.getElementById('close-view-cards');
  if (closeViewCardsBtn) {
    closeViewCardsBtn.addEventListener('click', () => {
      hideViewCardsOverlayUI();
    });
  }

  const viewCardsOverlayBg = document.getElementById('view-cards-overlay-background');
  if (viewCardsOverlayBg) {
    viewCardsOverlayBg.addEventListener('click', (event) => {
      if (event.target === viewCardsOverlayBg) {
        hideViewCardsOverlayUI();
      }
    });
  }

  // 9. Gestione proposte utente: "Elimina", "Gestisci Proposta", e "View"
  const userProposals = document.getElementById('user-proposals');
  userProposals.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.btn-danger');
    const manageBtn = event.target.closest('.btn-primary');
    const viewBtn = event.target.closest('.btn-info');

    if (deleteBtn) {
      const tradeId = deleteBtn.getAttribute('data-trade-id');
      deleteTrade(tradeId);
    }
    if (manageBtn) {
      const tradeId = manageBtn.getAttribute('data-trade-id');
      showManageProposalOverlay(tradeId);
    }
    if (viewBtn) {
      const tradeId = viewBtn.getAttribute('data-trade-id');
      if (tradeId) {
        showViewProposalCardsOverlay(tradeId);
      }
    }
  });

  // 10. Gestione offerte utente: "Elimina" e "View"
  const userOffers = document.getElementById('user-offers');
  userOffers.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.btn-danger');
    const viewBtn = event.target.closest('.btn-info');
    
    if (deleteBtn) {
      const offerId = deleteBtn.getAttribute('data-offer-id');
      if (offerId) {
        deleteOffer(offerId);
      }
    }
    if (viewBtn) {
      const offerId = viewBtn.getAttribute('data-offer-id');
      if (offerId) {
        showViewOfferCardsOverlay(offerId);
      }
    }
  });

  // 11. Gestione bottoni overlay: "Chiudi" overlay principale
  const closeOverlayBtn = document.getElementById('close-overlay');
  if (closeOverlayBtn) {
    closeOverlayBtn.addEventListener('click', () => {
      hideOverlayUI();
      selectedCards.value = [];
      updateSelectedCardsListUI(selectedCards.value);
    });
  }

  // 12. Chiusura overlay cliccando sul background
  const overlayBackground = document.getElementById('overlay-background');
  if (overlayBackground) {
    overlayBackground.addEventListener('click', (event) => {
      if (event.target === overlayBackground) {
        hideOverlayUI();
        selectedCards.value = [];
        updateSelectedCardsListUI(selectedCards.value);
      }
    });
  }

  // 13. Gestione bottoni overlay "Gestisci Proposta": "Chiudi"
  const closeManageProposalBtn = document.getElementById('close-manage-proposal');
  if (closeManageProposalBtn) {
    closeManageProposalBtn.addEventListener('click', () => {
      hideManageProposalOverlayUI();
    });
  }

  // 14. Chiusura overlay "Gestisci Proposta" cliccando sul background
  const manageProposalOverlayBg = document.getElementById('manage-proposal-overlay-background');
  if (manageProposalOverlayBg) {
    manageProposalOverlayBg.addEventListener('click', (event) => {
      if (event.target === manageProposalOverlayBg) {
        hideManageProposalOverlayUI();
      }
    });
  }

  // 15. Gestione bottoni "Accetta Offerta" nell'overlay "Gestisci Proposta"
  const offerList = document.getElementById('offer-list');
  if (offerList) {
    offerList.addEventListener('click', (event) => {
      const acceptBtn = event.target.closest('.accept-offer-btn');
      if (acceptBtn) {
        const tradeId = acceptBtn.getAttribute('data-trade-id');
        const offerId = acceptBtn.getAttribute('data-offer-id');
        if (tradeId && offerId) {
          acceptOffer(tradeId, offerId);
        }
      }
    });
  }

}); 