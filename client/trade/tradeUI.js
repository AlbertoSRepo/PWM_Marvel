// tradeUI.js

import { showManageProposalOverlay, acceptOffer, checkUserOwnsCards } from './tradeController.js';
import { getCardsByIds } from '../album/albumRoute.js'; // AGGIUNGI QUESTO IMPORT

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
  document.getElementById('view-cards-overlay-background').style.display = 'block';
  document.getElementById('view-cards-overlay').style.display = 'block';
}

export function hideViewCardsOverlayUI() {
  document.getElementById('view-cards-overlay-background').style.display = 'none';
  document.getElementById('view-cards-overlay').style.display = 'none';
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
        <button class="btn btn-danger" data-trade-id="${proposal._id}">Elimina</button>
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
          <button class="btn btn-danger" data-offer-id="${offer._id}">
            Elimina
          </button>
        </td>
      `;
      container.appendChild(row);
    });
  });
}

/* Aggiorna il contenitore delle carte in "card-selection" */
export function updateCardSelectionUI(cardsData) {
  const container = document.getElementById('card-selection');
  container.innerHTML = '';
  if (!cardsData || cardsData.length === 0) {
    return alert('Nessuna carta trovata.');
  }
  cardsData.forEach(card => {
    container.appendChild(createCardHTML(card));
  });
}

/* Crea un elemento card dal template */
function createCardHTML(card) {
  const template = document.getElementById('card-template').content.cloneNode(true);
  template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
  template.querySelector('.card-id').textContent = `ID: ${card.id}`;
  
  // Mostra entrambe le quantità se disponibili
  let quantityText = '';
  if (card.available_quantity !== undefined) {
    quantityText = `Disponibili: ${card.available_quantity}`;
    if (card.quantity !== undefined && card.quantity !== card.available_quantity) {
      quantityText += ` (Totali: ${card.quantity})`;
    }
  } else {
    quantityText = card.quantity ? `Quantità: ${card.quantity}` : 'Quantità: 0';
  }
  
  template.querySelector('.card-quantity').textContent = quantityText;

  const img = template.querySelector('.card-img-top');
  if (card.thumbnail) {
    img.src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
  } else {
    img.src = 'placeholder-image.jpg';
  }
  return template;
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

/* Gestione Overlay "Gestisci Proposta" (popolare l’offerta) */
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
    offerElement.innerHTML = `
      <p>Offerta da: ${offer.user_id}</p>
      <p>Stato: ${offer.status}</p>
      <p>Data: ${new Date(offer.created_at).toLocaleString()}</p>
      <div class="offer-cards" id="offer-cards-${offer._id}"></div>
      <button
        class="btn btn-success accept-offer-btn"
        data-trade-id="${trade._id}"
        data-offer-id="${offer._id}"
      >
        Accetta Offerta
      </button>
    `;
    offerListContainer.appendChild(offerElement);

    // Crea la “visualizzazione” delle carte offerte
    const container = document.getElementById(`offer-cards-${offer._id}`);
    // Se le carte di un’offerta hanno dettagli su `offer.detailed_cards`, potresti popolare qui
    // Se servono ulteriori fetch per i dettagli, lo gestisci nel controller o altrove.
    // Esempio banale:
    if (offer.detailed_cards) {
      offer.detailed_cards.forEach(card => {
        container.appendChild(createCardHTML(card));
      });
    }
  }
  // Gestione del clic su "Accetta Offerta" la faremo con event delegation in listeners o in controller
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

  trade.proposed_cards.forEach(card => {
    try {
      const cardElement = createViewCardHTML(card);
      container.appendChild(cardElement);
    } catch (error) {
      console.error('Errore durante la creazione del card HTML:', error, card);
      // Continua con le altre carte
    }
  });
}

/* Crea un elemento card per la visualizzazione */
function createViewCardHTML(card) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('col-lg-3', 'col-md-4', 'col-sm-6', 'col-12', 'mb-3');
  
  // Costruisci l'URL dell'immagine
  let imageUrl = 'placeholder-image.jpeg';
  if (card.thumbnail && card.thumbnail.path && card.thumbnail.extension) {
    imageUrl = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    imageUrl = imageUrl.replace('http://', 'https://');
  }
  
  cardDiv.innerHTML = `
    <div class="card h-100">
      <img 
        src="${imageUrl}" 
        class="card-img-top view-card-image" 
        alt="${card.name}"
        onerror="this.src='placeholder-image.jpeg'"
      />
      <div class="card-body text-center">
        <h6 class="card-title">${card.name || 'Carta sconosciuta'}</h6>
        <p class="card-text">
          <span class="badge bg-primary">Quantità: ${card.quantity}</span>
        </p>
      </div>
    </div>
  `;
  
  return cardDiv;
}
