// Variabile per tenere traccia delle carte selezionate
let selectedCards = [];

// Massimo numero di carte che si possono selezionare
const maxCards = 5;

// Variabile per tenere traccia della pagina corrente
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    // Carica le proposte della community
    fetchCommunityTrades();
  
    // Carica le proposte fatte dall'utente
    fetchUserProposals();
  
    // Carica le offerte fatte dall'utente
    fetchUserOffers();
  
    // Aggiungi l'evento per aprire l'overlay al click sul bottone "Crea Nuova Proposta"
    document.getElementById('create-trade-btn').addEventListener('click', showOverlay);

      // Aggiungi l'evento per cercare le carte per nome
  document.getElementById('search-button').addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.trim();
    if (searchQuery) {
      searchCardsByName(searchQuery);
    }
  });

  // Eventi per la paginazione nell'overlay
  document.getElementById('prev-page-btn').addEventListener('click', () => changePage(-1));
  document.getElementById('next-page-btn').addEventListener('click', () => changePage(1));

    // Evento per inviare le carte selezionate quando si clicca "Invia Proposta"
    document.getElementById('submit-trade-btn').addEventListener('click', submitTradeProposal);
  });
  // Funzione per selezionare o deselezionare una carta
function toggleCardSelection(card) {
  const cardId = card.id;

  // Se la carta è già selezionata, rimuovila
  if (selectedCards.some(selectedCard => selectedCard.id === cardId)) {
    selectedCards = selectedCards.filter(selectedCard => selectedCard.id !== cardId);
    card.element.classList.remove('selected-card'); // Rimuovi il bordo
  } else {
    // Se non è selezionata, aggiungila (fino a 5 carte)
    if (selectedCards.length < maxCards) {
      selectedCards.push(card);
      card.element.classList.add('selected-card'); // Aggiungi il bordo
    } else {
      alert('Puoi selezionare solo 5 carte.');
    }
  }

  // Aggiorna la visualizzazione delle carte selezionate
  updateSelectedCards();
}

// Funzione per aggiornare la visualizzazione delle carte selezionate
function updateSelectedCards() {
  const selectedCardsContainer = document.getElementById('selected-cards');
  selectedCardsContainer.innerHTML = ''; // Pulisce il contenitore

  // Aggiungi le carte selezionate al contenitore
  selectedCards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('selected-card');
    cardElement.innerHTML = `
      <p>${card.name}</p>
      <p>ID: ${card.id}</p>
    `;
    selectedCardsContainer.appendChild(cardElement);
  });

  // Aggiorna il contatore delle carte selezionate
  document.querySelector('#selected-cards-container h5').textContent = `Carte Selezionate (${selectedCards.length}/5)`;
}

// Funzione per inviare la proposta di trade
async function submitTradeProposal() {
  if (selectedCards.length === 0) {
    alert('Devi selezionare almeno una carta per inviare la proposta.');
    return;
  }

  try {
    const jwtToken = getJwtToken();

    // Prepara i dati da inviare (solo card_id e quantity)
    const proposedCards = selectedCards.map(card => ({
      card_id: card.id,
      quantity: 1  // Puoi modificare il valore della quantità a seconda della logica del tuo sistema
    }));

    // Debug per verificare i dati inviati
    console.log('Carte selezionate da inviare:', proposedCards);

    // Effettua la richiesta POST per creare una nuova proposta di trade
    const response = await fetch('http://localhost:3000/api/trade', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proposed_cards: proposedCards }) // Corpo della richiesta
    });

    if (!response.ok) {
      throw new Error('Errore nella creazione della proposta di trade');
    }

    const trade = await response.json();
    console.log('Proposta di trade creata con successo:', trade);
    alert('Proposta di trade creata con successo!');

    // Reset delle carte selezionate e chiusura dell'overlay
    selectedCards = [];
    updateSelectedCards();
    hideOverlay();
  } catch (error) {
    console.error('Errore durante la creazione della proposta di trade:', error);
    alert('Errore durante la creazione della proposta di trade.');
  }
}


// Funzione per creare la card in base ai dettagli ricevuti usando il template
function createCardHTML(card) {
  const template = document.getElementById('card-template').content.cloneNode(true);

  template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
  template.querySelector('.card-id').textContent = `ID: ${card.id}`;
  template.querySelector('.card-quantity').textContent = card.quantity ? `Quantità: ${card.quantity}` : '';

  if (card.details && card.details.thumbnail) {
    template.querySelector('.card-img-top').src = `${card.details.thumbnail.path}.${card.details.thumbnail.extension}`;
  } else {
    template.querySelector('.card-img-top').src = 'placeholder-image.jpg';
  }

  return template;
}

// Funzione per aggiornare le carte nell'overlay
function updateCards(cardsData) {
  const cardSelectionContainer = document.getElementById('card-selection');
  cardSelectionContainer.innerHTML = ''; // Pulisce il contenitore

  // Aggiungi tutte le carte usando il template
  cardsData.forEach(card => {
    const cardHTML = createCardHTML(card);
    cardSelectionContainer.appendChild(cardHTML);
  });
}

// Assegna un listener al contenitore delle carte (event delegation)
document.getElementById('card-selection').addEventListener('click', (event) => {
  const cardElement = event.target.closest('.card');

  if (!cardElement) return; // Ignora se non si clicca su una carta

  const cardId = cardElement.querySelector('.card-id').textContent.split(': ')[1];
  const cardName = cardElement.querySelector('.card-title').textContent;

  console.log('Carta selezionata:', cardName);

  toggleCardSelection({
    id: cardId,
    name: cardName,
    element: cardElement
  });
});

  // Funzione per ottenere il token JWT dal localStorage
  function getJwtToken() {
    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');
    if (!jwtToken) {
      throw new Error('Token JWT mancante. Devi autenticarti.');
    }
    return jwtToken;
  }

// Funzione per cambiare pagina e caricare le carte
function changePage(direction) {
  currentPage += direction;
  if (currentPage < 1) {
    currentPage = 1; // Non permette di andare sotto la pagina 1
  }
  loadUserCards(currentPage);
}
  
  // Funzione per mostrare l'overlay e caricare le carte
  function showOverlay() {
    document.getElementById('overlay-background').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
  
    // Carica le carte dell'utente per la selezione
    loadUserCards(1); // Carica la prima pagina
  }
  
  // Funzione per nascondere l'overlay
  function hideOverlay() {
    document.getElementById('overlay-background').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
  }

  // Funzione per cercare carte per nome del supereroe
async function searchCardsByName(name) {
  try {
    const jwtToken = getJwtToken();

    const response = await fetch(`http://localhost:3000/api/album/search?name_starts_with=${name}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
    }

    const data = await response.json();
    updateCards(data); // Usa la funzione per aggiornare le carte
  } catch (error) {
    console.error('Errore durante la ricerca delle carte:', error);
    alert('Si è verificato un errore durante la ricerca delle carte.');
  }
}
  
// Funzione per creare la card in base ai dettagli ricevuti usando il template
function createCardHTML(card) {
  const template = document.getElementById('card-template').content.cloneNode(true);

  template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
  template.querySelector('.card-id').textContent = `ID: ${card.id}`;
  template.querySelector('.card-quantity').textContent = card.quantity ? `Quantità: ${card.quantity}` : '';

  if (card && card.thumbnail) {
    template.querySelector('.card-img-top').src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
  } else {
    template.querySelector('.card-img-top').src = 'placeholder-image.jpg';
  }

  return template;
}

// Funzione per caricare le carte dell'utente per la selezione (28 per pagina)
async function loadUserCards(pageNumber) {
  try {
    const jwtToken = getJwtToken();

    console.log(`Caricamento delle carte per la pagina: ${pageNumber}`); // Debug

    // Richiesta per ottenere le carte per pagina
    const response = await fetch(`http://localhost:3000/api/album/trade/cards?page_number=${pageNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Risposta dal server:', response); // Debug

    if (!response.ok) {
      throw new Error('Errore durante il caricamento delle carte.');
    }

    const data = await response.json();
    console.log('Risposta dal server:', data); // Debug

    const cards = data || [];
    console.log('Carte ricevute:', cards);

    if (cards.length === 0) {
      alert('Nessuna carta trovata per la pagina selezionata.');
    } else {
      updateCards(cards); // Usa la stessa logica per aggiornare l'overlay con le carte
    }

    // Aggiorna lo stato dei bottoni di paginazione
    updatePaginationButtons(pageNumber);
  } catch (error) {
    console.error('Errore durante il caricamento delle carte:', error);
    alert('Errore durante il caricamento delle carte.');
  }
}


// Funzione per aggiornare le carte nell'overlay
function updateCards(cardsData) {
  const cardSelectionContainer = document.getElementById('card-selection');
  cardSelectionContainer.innerHTML = ''; // Pulisce il contenitore

  // Aggiungi tutte le carte usando il template
  cardsData.forEach(card => {
    const cardHTML = createCardHTML(card);
    cardSelectionContainer.appendChild(cardHTML);
  });
}

// Funzione per aggiornare lo stato dei bottoni di paginazione
function updatePaginationButtons(page) {
  // Disabilita il bottone "Pagina Precedente" se siamo alla prima pagina
  document.getElementById('prev-page-btn').disabled = (page === 1);

  // Se non ci sono carte nella risposta, disabilita il bottone "Pagina Successiva"
  const cardsExist = document.getElementById('card-selection').childElementCount > 0;
  document.getElementById('next-page-btn').disabled = !cardsExist;
}

  // Funzione per caricare le proposte della community (GET)
  async function fetchCommunityTrades() {
    try {
      const jwtToken = getJwtToken();
  
      // Effettua una richiesta GET all'endpoint /api/trades
      const response = await fetch('http://localhost:3000/api/trade', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle proposte della community');
      }
  
      const communityTrades = await response.json();
      console.log('Proposte della community:', communityTrades);
      const container = document.getElementById('community-trades');
      container.innerHTML = ''; // Pulisce il contenitore
  
      communityTrades.forEach(trade => {
        // Verifica che i campi esistano prima di usare join()
        const offeredCards = trade.proposed_cards ? trade.proposed_cards.map(card => `ID: ${card.card_id}, Quantità: ${card.quantity}`).join(', ') : 'N/A';
        const proposer = trade.proposer ? trade.proposer : 'Anonimo'; // Gestione del campo username
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${proposer}</td>
          <td>${offeredCards}</td>
          <td>${new Date(trade.created_at).toLocaleString()}</td>
        `;
        container.appendChild(row);
      });
    } catch (error) {
      console.error('Errore durante il caricamento delle proposte della community:', error);
      alert('Errore durante il caricamento delle proposte della community.');
    }
  }
    
  // Funzione per caricare le proposte fatte dall'utente (GET)
  async function fetchUserProposals() {
    try {
      const jwtToken = getJwtToken();
  
      // Effettua una richiesta GET all'endpoint /api/trades/user/proposals
      const response = await fetch('http://localhost:3000/api/trade/user/proposals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle tue proposte');
      }
  
      const userProposals = await response.json();
      const container = document.getElementById('user-proposals');
      container.innerHTML = ''; // Pulisce il contenitore
  
      userProposals.forEach(proposal => {
        const offeredCards = proposal.proposed_cards ? proposal.proposed_cards.map(card => `ID: ${card.card_id}, Quantità: ${card.quantity}`).join(', ') : 'N/A';
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${offeredCards}</td>
          <td>${new Date(proposal.created_at).toLocaleString()}</td>
        `;
        container.appendChild(row);
      });
    } catch (error) {
      console.error('Errore durante il caricamento delle tue proposte:', error);
      alert('Errore durante il caricamento delle tue proposte.');
    }
  }
  
  // Funzione per caricare le offerte fatte dall'utente (GET)
  async function fetchUserOffers() {
    try {
      const jwtToken = getJwtToken();
  
      // Effettua una richiesta GET all'endpoint /api/trades/user/offers
      const response = await fetch('http://localhost:3000/api/trade/user/offers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle tue offerte');
      }
  
      const userOffers = await response.json();
      const container = document.getElementById('user-offers');
      container.innerHTML = ''; // Pulisce il contenitore
  
      userOffers.forEach(offer => {
        const offeredCards = offer.offered_cards ? offer.offered_cards.map(card => `ID: ${card.card_id}, Quantità: ${card.quantity}`).join(', ') : 'N/A';
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${offer.proposalId}</td>
          <td>${offeredCards}</td>
          <td>${new Date(offer.created_at).toLocaleString()}</td>
        `;
        container.appendChild(row);
      });
    } catch (error) {
      console.error('Errore durante il caricamento delle tue offerte:', error);
      alert('Errore durante il caricamento delle tue offerte.');
    }
  }
  
  // Funzione per creare una nuova proposta di trade (POST)
  async function createTrade(proposedCards) {
    try {
      const jwtToken = getJwtToken();
  
      // Effettua una richiesta POST all'endpoint /api/trades per creare una nuova proposta di trade
      const response = await fetch('http://localhost:3000/api/trade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposed_cards: proposedCards }) // Corpo della richiesta
      });
  
      if (!response.ok) {
        throw new Error('Errore nella creazione della proposta di trade');
      }
  
      const trade = await response.json();
      console.log('Proposta di trade creata con successo:', trade);
      alert('Proposta di trade creata con successo!');
    } catch (error) {
      console.error('Errore durante la creazione della proposta di trade:', error);
      alert('Errore durante la creazione della proposta di trade.');
    }
  }

