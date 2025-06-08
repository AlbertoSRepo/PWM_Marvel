// tradeUI.js

import { showManageProposalOverlay, acceptOffer, checkUserOwnsCards } from './tradeController.js';
import { getCardsByIds } from '../album/albumRoute.js'; // AGGIUNGI QUESTO IMPORT
import { convertThumbnailStringToObj } from '../shared/cardUtils.js';

/* Overlay Principale (Selezione carte) */
export function showOverlayUI() {
  document.getElementById('overlay-background').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

export function hideOverlayUI() {
  document.getElementById('overlay-background').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

/* Overlay Gestisci Proposta */
export function showManageProposalOverlayUI() {
  document.getElementById('manage-proposal-overlay-background').style.display = 'block';
  document.getElementById('manage-proposal-overlay').style.display = 'block';
}

export function hideManageProposalOverlayUI() {
  document.getElementById('manage-proposal-overlay-background').style.display = 'none';
  document.getElementById('manage-proposal-overlay').style.display = 'none';
}

/* Overlay per visualizzare le carte di una proposta */
export function showViewCardsOverlayUI() {
  const background = document.getElementById('view-cards-overlay-background');
  const overlay = document.getElementById('view-cards-overlay');
  
  if (background && overlay) {
    background.style.display = 'block';
    overlay.style.display = 'block';
    
    // Aggiungi al body per portarlo in primo piano
    document.body.style.overflow = 'hidden'; // Previeni scroll del body
  } else {
    console.error('Elementi overlay non trovati:', { background, overlay });
  }
}

export function hideViewCardsOverlayUI() {
  const background = document.getElementById('view-cards-overlay-background');
  const overlay = document.getElementById('view-cards-overlay');
  
  if (background && overlay) {
    background.style.display = 'none';
    overlay.style.display = 'none';
    document.body.style.overflow = ''; // Ripristina scroll del body
  }
}

/* Aggiorna la tabella "Proposte della Community" */
export function updateCommunityTradesUI(trades) {
  const tbody = document.getElementById('community-trades');
  tbody.innerHTML = '';

  trades.forEach(trade => {
    const row = document.createElement('tr');
    
    // Formatta le carte proposte mostrando il nome invece dell'ID
    const cardsText = trade.proposed_cards
      .map(card => `${card.name}, Qta: ${card.quantity}`)
      .join('; ');

    row.innerHTML = `
      <td>${trade.proposer}</td>
      <td>${cardsText}</td>
      <td>${trade.created_at}</td>
      <td>
        <button class="btn btn-primary me-2" data-trade-id="${trade._id}">
          Invia Offerta
        </button>
        <button class="btn btn-info" data-trade-id="${trade._id}" data-action="view">
          View
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Verifica se l'utente possiede già tutte le carte di ogni proposta
  checkIfUserOwnsAllCards(trades);
}

/**
 * Verifica se l'utente possiede già tutte le carte proposte
 */
async function checkIfUserOwnsAllCards(trades) {
  for (const trade of trades) {
    try {
      const proposedCardIds = trade.proposed_cards.map(card => Number(card.card_id));
      
      // Usa la funzione importata dal controller
      const userOwnsAll = await checkUserOwnsCards(proposedCardIds);
      
      const button = document.querySelector(`button[data-trade-id="${trade._id}"]`);
      if (button && userOwnsAll) {
        button.disabled = true;
        button.textContent = 'Carte già possedute';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
      }
    } catch (error) {
      console.error('Errore nella verifica delle carte possedute per trade:', trade._id, error);
    }
  }
}

/* Aggiorna la tabella "Le tue Proposte" */
export function updateUserProposalsUI(userProposals) {
  const container = document.getElementById('user-proposals');
  container.innerHTML = '';
  userProposals.forEach(proposal => {
    // Ottieni i nomi delle carte dal localStorage
    const figurineData = JSON.parse(localStorage.getItem('figurineData')) || [];
    
    const offeredCards = proposal.proposed_cards.map(card => {
      const figurine = figurineData.find(f => f.id === Number(card.card_id));
      const cardName = figurine ? figurine.name : 'Carta sconosciuta';
      return `${cardName}, Qta: ${card.quantity}`;
    }).join(', ');
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${offeredCards}</td>
      <td>${new Date(proposal.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-info me-2" data-trade-id="${proposal._id}" data-action="view-proposal">
          View
        </button>
        <button class="btn btn-danger me-2" data-trade-id="${proposal._id}">Elimina</button>
        <button class="btn btn-primary" data-trade-id="${proposal._id}">Gestisci Proposta</button>
      </td>
    `;
    container.appendChild(row);
  });
}

/* Aggiorna la tabella "Le tue Offerte" */
export function updateUserOffersUI(userOffers) {
  const container = document.getElementById('user-offers');
  container.innerHTML = '';
  userOffers.forEach(trade => {
    // Ci sono più offerte per la singola trade
    trade.offers.forEach(offer => {
      // Ottieni i nomi delle carte dal localStorage
      const figurineData = JSON.parse(localStorage.getItem('figurineData')) || [];
      
      const offeredCards = offer.offered_cards.map(card => {
        const figurine = figurineData.find(f => f.id === Number(card.card_id));
        const cardName = figurine ? figurine.name : 'Carta sconosciuta';
        return `${cardName}, Qta: ${card.quantity}`;
      }).join(', ');
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${trade._id}</td>
        <td>${offeredCards}</td>
        <td>${new Date(offer.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-info me-2" data-offer-id="${offer._id}" data-action="view-offer">
            View
          </button>
          <button class="btn btn-danger" data-offer-id="${offer._id}">
            Elimina
          </button>
        </td>
      `;
      container.appendChild(row);
    });
  });
}

/* Crea un elemento card dal template */
function createCardHTML(card) {
  // SOSTITUISCI la funzione esistente con questa versione che replica l'album
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('col-lg-2', 'col-md-4', 'col-sm-6', 'col-12', 'marvel-card', 'mb-4');
  
  // Aggiungi classe per stato della carta
  if (card.state === 'posseduta') {
    cardDiv.classList.add('posseduta');
  } else {
    cardDiv.classList.add('non-posseduta');
  }
  
  // Costruisci l'URL dell'immagine
  let imageUrl = 'placeholder-image.jpeg';
  if (card.thumbnail && card.thumbnail.path && card.thumbnail.extension) {
    imageUrl = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    imageUrl = imageUrl.replace('http://', 'https://');
  }
  
  cardDiv.innerHTML = `
    <div class="card custom-aspect-ratio">
      <img 
        class="card-img-top" 
        alt="Superhero Image" 
        src="${imageUrl}"
        onerror="this.src='placeholder-image.jpeg'"
      />
      <div class="card-body">
        <h5 class="card-title">${card.name || 'Carta sconosciuta'}</h5>
        <p class="card-id">ID: ${card.id}</p>
        <p class="card-quantity">${card.quantity ? card.quantity : ''}</p>
      </div>
    </div>
  `;
  
  return cardDiv;
}

/* Aggiorna il contenitore delle carte in "card-selection" */
export function updateCardSelectionUI(cardsData) {
  const container = document.getElementById('card-selection');
  container.innerHTML = '';
  
  if (!cardsData || cardsData.length === 0) {
    container.innerHTML = '<p class="text-center w-100">Nessuna carta trovata.</p>';
    return;
  }
  
  // AGGIUNGI: Crea righe come nell'album (6 carte per riga)
  const cardsPerRow = 6;
  const numRows = Math.ceil(cardsData.length / cardsPerRow);
  
  for (let i = 0; i < numRows; i++) {
    const row = document.createElement('div');
    row.classList.add('row', 'justify-content-center', 'mb-2');
    
    const startIndex = i * cardsPerRow;
    const endIndex = Math.min(startIndex + cardsPerRow, cardsData.length);
    
    for (let j = startIndex; j < endIndex; j++) {
      const cardElement = createCardHTML(cardsData[j]);
      row.appendChild(cardElement);
    }
    
    container.appendChild(row);
  }
}

/* Aggiorna la sezione delle carte selezionate */
export function updateSelectedCardsListUI(selectedCards) {
  const container = document.getElementById('selected-cards');
  container.innerHTML = '';
  
  selectedCards.forEach(card => {
    const div = document.createElement('div');
    div.classList.add('selected-card');
    div.setAttribute('data-card-id', card.id);
    
    // Costruisci l'URL dell'immagine
    let imageUrl = 'placeholder-image.jpeg';
    if (card.thumbnail && card.thumbnail.path && card.thumbnail.extension) {
      imageUrl = `${card.thumbnail.path}.${card.thumbnail.extension}`;
      // Converti http in https se necessario
      imageUrl = imageUrl.replace('http://', 'https://');
    }
    
    div.innerHTML = `
      <img 
        src="${imageUrl}" 
        alt="${card.name}" 
        class="selected-card-image"
        onerror="this.src='placeholder-image.jpeg'"
      />
      <div class="selected-card-info">
        <p>${card.name}</p>
        <p>ID: ${card.id}</p>
      </div>
      <button 
        class="remove-selected-btn" 
        onclick="removeSelectedCard('${card.id}')"
        title="Rimuovi carta"
      >
        ×
      </button>
    `;
    
    container.appendChild(div);
  });
  
  document.querySelector('#selected-cards-container h5').textContent =
    `Carte Selezionate (${selectedCards.length}/5)`;
}

/* Aggiorna i bottoni di paginazione (prev/next) */
export function updatePaginationButtonsUI(pageNumber, numCards) {
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  prevBtn.disabled = (pageNumber === 1);
  // Disabilita "Prossima" se non c’è nessuna card
  nextBtn.disabled = (numCards === 0);
}

/* Gestione Overlay "Gestisci Proposta" (popolare l'offerta) */
export async function updateManageProposalOffersUI(trade) {
  // trade.offers = array di { ... }
  const offerListContainer = document.getElementById('offer-list');
  offerListContainer.innerHTML = '';

  if (!trade.offers || trade.offers.length === 0) {
    offerListContainer.innerHTML = '<p>Nessuna offerta per questa proposta.</p>';
    return;
  }

  for (const offer of trade.offers) {
    const offerElement = document.createElement('div');
    offerElement.classList.add('offer-item');
    
    // Ottieni il nome utente o usa l'ID come fallback
    const userName = offer.user_name || offer.user_id || 'Utente sconosciuto';
    
    offerElement.innerHTML = `
      <p>Offerta da: ${userName}</p>
      <p>Stato: ${offer.status}</p>
      <p>Data: ${new Date(offer.created_at).toLocaleString()}</p>
      <div class="offer-cards-container" id="offer-cards-${offer._id}">
        <h6 class="mb-2">Carte offerte:</h6>
        <div class="offer-cards-grid"></div>
      </div>
      <button
        class="btn btn-success accept-offer-btn"
        data-trade-id="${trade._id}"
        data-offer-id="${offer._id}"
      >
        Accetta Offerta
      </button>
    `;
    offerListContainer.appendChild(offerElement);

    // Popola le carte offerte nel container
    await populateOfferCards(offer, `offer-cards-${offer._id}`);
  }
}

/* Funzione per popolare le carte di un'offerta */
async function populateOfferCards(offer, containerId) {
  const container = document.querySelector(`#${containerId} .offer-cards-grid`);
  if (!container || !offer.offered_cards) return;

  try {
    const figurineData = JSON.parse(localStorage.getItem('figurineData')) || [];
    
    container.innerHTML = '';
    container.classList.add('row', 'g-2');

    offer.offered_cards.forEach(card => {
      const figurine = figurineData.find(f => f.id === Number(card.card_id));
      
      let imageUrl = 'image_not_available.jpg'; // MODIFICATO: usa image_not_available invece di placeholder
      let cardName = 'Carta sconosciuta';
      
      if (figurine) {
        cardName = figurine.name;
        
        // Usa direttamente l'URL della thumbnail se disponibile
        if (figurine.thumbnail && typeof figurine.thumbnail === 'string') {
          imageUrl = figurine.thumbnail;
          // Converti http in https
          imageUrl = imageUrl.replace('http://', 'https://');
          
          // NON sostituire più image_not_available - lascialo com'è
          // if (imageUrl.includes('image_not_available')) {
          //   imageUrl = 'placeholder-image.jpeg';
          // }
        }
      }
      
      const cardElement = document.createElement('div');
      cardElement.classList.add('col-4', 'col-md-3', 'col-lg-2', 'mb-2');
      cardElement.innerHTML = `
        <div class="offer-card">
          <div class="offer-card-image-container">
            <img 
              src="${imageUrl}" 
              alt="${cardName}" 
              class="offer-card-image"
              onerror="this.src='image_not_available.jpg'"
            />
            <div class="offer-card-quantity">${card.quantity}</div>
          </div>
          <div class="offer-card-name" title="${cardName}">${cardName}</div>
        </div>
      `;
      
      container.appendChild(cardElement);
    });
    
  } catch (error) {
    console.error('Errore durante la popolazione delle carte offerte:', error);
    container.innerHTML = '<p class="text-muted">Errore nel caricamento delle carte</p>';
  }
}

/* Popola l'overlay con le carte della proposta */
export function updateViewCardsOverlayUI(trade) {
  const container = document.getElementById('view-cards-container');
  container.innerHTML = '';

  const title = document.getElementById('view-cards-overlay-title');
  title.textContent = `Carte proposte da ${trade.proposer || 'Utente sconosciuto'}`;

  // Verifica che proposed_cards esista e sia un array
  if (!trade.proposed_cards || !Array.isArray(trade.proposed_cards)) {
    container.innerHTML = '<p class="text-center">Nessuna carta trovata per questa proposta.</p>';
    return;
  }

  if (trade.proposed_cards.length === 0) {
    container.innerHTML = '<p class="text-center">Questa proposta non contiene carte.</p>';
    return;
  }

  // MODIFICATO: Adatta il numero di carte per riga in base alla quantità totale
  let cardsPerRow;
  const totalCards = trade.proposed_cards.length;
  
  if (totalCards <= 6) {
    cardsPerRow = totalCards; // Una riga sola
  } else if (totalCards <= 12) {
    cardsPerRow = 6; // Due righe da 6
  } else {
    cardsPerRow = 6; // Più righe da 6
  }
  
  const numRows = Math.ceil(totalCards / cardsPerRow);
  
  for (let i = 0; i < numRows; i++) {
    const row = document.createElement('div');
    row.classList.add('row', 'justify-content-center', 'mb-2');
    
    const startIndex = i * cardsPerRow;
    const endIndex = Math.min(startIndex + cardsPerRow, totalCards);
    
    for (let j = startIndex; j < endIndex; j++) {
      const card = trade.proposed_cards[j];
      try {
        const cardElement = createViewCardHTML(card);
        row.appendChild(cardElement);
      } catch (error) {
        console.error('Errore durante la creazione del card HTML:', error, card);
        // Continua con le altre carte
      }
    }
    
    container.appendChild(row);
  }
  
  // AGGIUNTO: Ridimensiona l'overlay in base al contenuto
  setTimeout(() => {
    adjustOverlaySize();
  }, 100);
}

// AGGIUNTO: Funzione per ridimensionare l'overlay
function adjustOverlaySize() {
  const overlay = document.getElementById('view-cards-overlay');
  const container = document.getElementById('view-cards-container');
  
  if (overlay && container) {
    const containerHeight = container.scrollHeight;
    const titleHeight = 60; // Altezza approssimativa del titolo
    const padding = 40; // Padding dell'overlay
    
    const totalHeight = containerHeight + titleHeight + padding;
    const maxHeight = window.innerHeight * 0.85; // 85% dell'altezza della finestra
    
    if (totalHeight < maxHeight) {
      overlay.style.height = totalHeight + 'px';
    } else {
      overlay.style.height = maxHeight + 'px';
      container.style.overflowY = 'auto';
    }
  }
}

/* Crea un elemento card per la visualizzazione */
/* Crea un elemento card per la visualizzazione */
function createViewCardHTML(card) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('col-lg-2', 'col-md-4', 'col-sm-6', 'col-12', 'marvel-card', 'mb-4');
  
  // Costruisci l'URL dell'immagine
  let imageUrl = 'placeholder-image.jpeg';
  if (card.thumbnail && card.thumbnail.path && card.thumbnail.extension) {
    imageUrl = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    imageUrl = imageUrl.replace('http://', 'https://');
  }
  
  // MODIFICA: Usa la stessa struttura dell'overlay buy
  cardDiv.innerHTML = `
    <div class="card custom-aspect-ratio">
      <img 
        class="card-img-top" 
        alt="Superhero Image" 
        src="${imageUrl}"
        onerror="this.src='placeholder-image.jpeg'"
      />
      <div class="card-body">
        <h5 class="card-title">${card.name || 'Carta sconosciuta'}</h5>
      </div>
    </div>
  `;
  
  return cardDiv;
}
