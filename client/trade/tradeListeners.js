// tradeListeners.js
import { loadNavbar } from '../shared/navbar.js';
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js'; 
import {
  loadInitialData,
  createTradeProposal,
  searchCardsLocallyAndUpdate,
  searchCardsLocallyAndUpdateForOffer,  // AGGIUNGI QUESTO IMPORT
  loadUserCards,
  loadUserCardsForOffer,  // AGGIUNGI QUESTO IMPORT
  deleteTrade,
  deleteOffer,
  showOfferOverlay,
  showManageProposalOverlay,
  acceptOffer,
  showViewCardsOverlay
} from './tradeController.js';

import {
  hideOverlayUI,
  hideManageProposalOverlayUI,
  updateSelectedCardsListUI,
  hideViewCardsOverlayUI
} from './tradeUI.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Carica la navbar
  loadNavbar('trade');

  // 2. Verifica/recupera il file JSON dal server, se non presente in localStorage
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

  // Stato interno (potresti metterlo altrove, p.es. in un “store” dedicato)
  const selectedCards = {
    // usage: selectedCards.value = [...]
    // è un oggetto perché vogliamo passarlo per riferimento ad altre funzioni
    value: []
  };
  let currentPage = 1;

  // 1. Carica dati iniziali: proposte community, proposte utente, offerte utente
  await loadInitialData();

  // 2. Event listener: click su "Crea Nuova Proposta"
  const createTradeBtn = document.getElementById('create-trade-btn');
  createTradeBtn.addEventListener('click', () => {
    // Apri overlay
    // Reimposta i testi
    showOverlayUIForNewProposal();
    loadUserCards(1); // Carica la pagina 1 di carte
  });

  // Funzione di supporto per aprire overlay in modalità "nuova proposta"
  function showOverlayUIForNewProposal() {
    // Mostra l’overlay
    const overlayBackground = document.getElementById('overlay-background');
    const overlay = document.getElementById('overlay');
    overlayBackground.style.display = 'block';
    overlay.style.display = 'block';

    // Titoli e bottone
    const overlayTitle = document.getElementById('overlay-title');
    overlayTitle.textContent = 'Seleziona le tue carte';
    const submitBtn = document.getElementById('submit-trade-offer-btn');
    submitBtn.textContent = 'Invia Proposta';
    submitBtn.onclick = () => {
      // Costruisco l’array di carte proposte
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

  // 3. Event listener: cercare carte per nome
  const searchButton = document.getElementById('search-button');
  searchButton.addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.trim();
    
    // Verifica se siamo in modalità "offerta" controllando il titolo dell'overlay
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

  // 4. Paginazione (prev / next)
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      
      // Verifica se siamo in modalità offerta
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
    
    // Verifica se siamo in modalità offerta
    const overlayTitle = document.getElementById('overlay-title');
    const isOfferMode = overlayTitle.textContent === 'Seleziona le carte da offrire';
    
    if (isOfferMode && window.currentTradeId) {
      loadUserCardsForOffer(currentPage, window.currentTradeId);
    } else {
      loadUserCards(currentPage);
    }
  });

  // 5. Selezione carte (event delegation)
  const cardSelection = document.getElementById('card-selection');
  cardSelection.addEventListener('click', (event) => {
    const cardElement = event.target.closest('.card');
    if (!cardElement) return;

    const cardId = cardElement.querySelector('.card-id').textContent.split(': ')[1];
    const cardName = cardElement.querySelector('.card-title').textContent;

    toggleCardSelection(cardId, cardName, cardElement);
  });

  function toggleCardSelection(cardId, cardName, element) {
    // se già selezionato, rimuovo
    const isAlreadySelected = selectedCards.value.some(sc => sc.id === cardId);
    if (isAlreadySelected) {
      selectedCards.value = selectedCards.value.filter(sc => sc.id !== cardId);
      element.classList.remove('selected-card');
    } else {
      // se non selezionato, aggiungo
      if (selectedCards.value.length >= 5) {
        alert('Puoi selezionare solo 5 carte.');
        return;
      }
      
      // Estrai i dati dell'immagine dall'elemento della carta
      const cardImg = element.querySelector('.card-img-top');
      const imageSrc = cardImg ? cardImg.src : '';
      
      // Crea l'oggetto thumbnail
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
    
    // Trova e rimuovi la classe 'selected-card' dalla griglia
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

  // 6. Community trades: event delegation su "Invia Offerta"
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

  // 7. Gestione proposte utente: “Elimina” e “Gestisci Proposta”
  const userProposals = document.getElementById('user-proposals');
  userProposals.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.btn-danger');
    const manageBtn = event.target.closest('.btn-primary');

    if (deleteBtn) {
      const tradeId = deleteBtn.getAttribute('data-trade-id');
      deleteTrade(tradeId);
    }
    if (manageBtn) {
      const tradeId = manageBtn.getAttribute('data-trade-id');
      showManageProposalOverlay(tradeId);
    }
  });

  // 8. Gestione offerte utente: “Elimina”
  const userOffers = document.getElementById('user-offers');
  userOffers.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.btn-danger');
    if (!deleteBtn) return;
    const offerId = deleteBtn.getAttribute('data-offer-id');
    if (offerId) {
      deleteOffer(offerId);
    }
  });

  // 9. Gestione overlay “close” (sia overlay principale sia overlay manage-proposal)
  const closeOverlayBtn = document.getElementById('close-overlay');
  closeOverlayBtn.addEventListener('click', () => {
    hideOverlayUI();
  });
  const overlayBackground = document.getElementById('overlay-background');
  overlayBackground.addEventListener('click', (event) => {
    if (event.target === overlayBackground) {
      hideOverlayUI();
    }
  });

  const closeManageProposalBtn = document.getElementById('close-manage-proposal');
  closeManageProposalBtn.addEventListener('click', () => {
    hideManageProposalOverlayUI();
  });
  const manageProposalOverlayBg = document.getElementById('manage-proposal-overlay-background');
  manageProposalOverlayBg.addEventListener('click', (event) => {
    if (event.target === manageProposalOverlayBg) {
      hideManageProposalOverlayUI();
    }
  });

  // 10. “Accetta Offerta” event delegation
  const offerList = document.getElementById('offer-list');
  offerList.addEventListener('click', (event) => {
    const acceptBtn = event.target.closest('.accept-offer-btn');
    if (!acceptBtn) return;
    const tradeId = acceptBtn.getAttribute('data-trade-id');
    const offerId = acceptBtn.getAttribute('data-offer-id');
    if (tradeId && offerId) {
      acceptOffer(tradeId, offerId);
    }
  });
});
