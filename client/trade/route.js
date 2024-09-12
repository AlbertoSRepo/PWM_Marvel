document.addEventListener('DOMContentLoaded', () => {
  // Carica le proposte della community
  fetchCommunityTrades();

  // Carica le proposte fatte dall'utente
  fetchUserProposals();

  // Carica le offerte fatte dall'utente
  fetchUserOffers();
});

// Funzione per ottenere il token JWT dal localStorage
function getJwtToken() {
  const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');
  if (!jwtToken) {
    throw new Error('Token JWT mancante. Devi autenticarti.');
  }
  return jwtToken;
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
          <td>
            <button class="btn btn-primary" data-trade-id="${trade._id}">Invia Offerta</button> <!-- Aggiunto data-trade-id -->
          </td>
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
    console.log('Offerte dell\'utente:', userOffers);

    userOffers.forEach(trade => {
      // Ciclo per ogni offerta all'interno di una proposta
      trade.offers.forEach(offer => {
        const offeredCards = offer.offered_cards.map(card => `ID: ${card.card_id}, Quantità: ${card.quantity}`).join(', ');

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${trade._id}</td> <!-- ID della proposta di trade -->
          <td>${offeredCards}</td>
          <td>${new Date(offer.created_at).toLocaleString()}</td>
        `;
        container.appendChild(row);
      });
    });
  } catch (error) {
    console.error('Errore durante il caricamento delle tue offerte:', error);
    alert('Errore durante il caricamento delle tue offerte.');
  }
}

// Funzione per inviare la proposta di trade (API call)
export async function postTradeProposal(proposedCards) {
  try {
    const jwtToken = getJwtToken();

    // Effettua la richiesta POST per creare una nuova proposta di trade
    const response = await fetch('http://localhost:3000/api/trade', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proposed_cards: proposedCards })
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Errore nella creazione della proposta di trade');
    }

    return await response.json(); // Restituisci la risposta al chiamante

  } catch (error) {
    console.error('Errore durante la creazione della proposta di trade:', error);
    throw error; // Lancia l'errore al chiamante
  }
}

// Funzione per cercare carte per nome del supereroe
export async function getCardsByName(name) {
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

    return await response.json();
  } catch (error) {
    console.error('Errore durante la ricerca delle carte:', error);
    throw error;
  }
}

// Funzione per caricare le carte dell'utente per la selezione (28 per pagina)
export async function getUserCards(pageNumber) {
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

    if (!response.ok) {
      throw new Error('Errore durante il caricamento delle carte.');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore durante il caricamento delle carte:', error);
    throw error;
  }
}