// tradeUI.js

import { showManageProposalOverlay, acceptOffer } from './tradeController.js';

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

/* Aggiorna la tabella "Proposte della Community" */
export async function updateCommunityTradesUI(communityTrades) {
  const container = document.getElementById('community-trades');
  container.innerHTML = '';
  
  // Ottieni l'album dell'utente corrente per verificare le carte possedute
  const userId = localStorage.getItem('userId'); // Assumendo che l'ID utente sia salvato
  
  for (const trade of communityTrades) {
    const row = document.createElement('tr');
    const offeredCards = trade.proposed_cards
      ? trade.proposed_cards.map(card => `ID: ${card.card_id}, Qta: ${card.quantity}`).join(', ')
      : 'N/A';
    const proposer = trade.proposer || 'Anonimo';
    
    // Verifica se l'utente possiede già tutte le carte proposte
    const userOwnsAllCards = await checkIfUserOwnsAllCards(trade.proposed_cards);
    
    let actionButton;
    if (userOwnsAllCards) {
      actionButton = `
        <button class="btn btn-secondary" disabled>
          Carte già possedute
        </button>
      `;
    } else {
      actionButton = `
        <button class="btn btn-primary" data-trade-id="${trade._id}">
          Invia Offerta
        </button>
      `;
    }
    
    row.innerHTML = `
      <td>${proposer}</td>
      <td>${offeredCards}</td>
      <td>${new Date(trade.created_at).toLocaleString()}</td>
      <td>${actionButton}</td>
    `;
    container.appendChild(row);
  }
}

/**
 * Verifica se l'utente possiede già tutte le carte proposte
 */
async function checkIfUserOwnsAllCards(proposedCards) {
  try {
    const cardIds = proposedCards.map(card => Number(card.card_id));
    const { cards } = await getCardsByIds(cardIds);
    
    // Verifica se tutte le carte hanno quantity > 0
    return cards.every(card => card.quantity > 0);
  } catch (error) {
    console.error('Errore nella verifica delle carte possedute:', error);
    return false;
  }
}

/* Aggiorna la tabella "Le tue Proposte" */
export function updateUserProposalsUI(userProposals) {
  const container = document.getElementById('user-proposals');
  container.innerHTML = '';
  userProposals.forEach(proposal => {
    const offeredCards = proposal.proposed_cards.map(
      card => `ID: ${card.card_id}, Qta: ${card.quantity}`
    ).join(', ');
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
      const offeredCards = offer.offered_cards.map(
        c => `ID: ${c.card_id}, Qta: ${c.quantity}`
      ).join(', ');
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
    div.innerHTML = `<p>${card.name}</p><p>ID: ${card.id}</p>`;
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
