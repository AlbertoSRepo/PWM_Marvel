document.addEventListener('DOMContentLoaded', () => {
  // Carica le proposte della community
  fetchCommunityTrades();

  // Carica le proposte fatte dall'utente
  fetchUserProposals();

  // Carica le offerte fatte dall'utente
  fetchUserOffers();
});

// Funzione per caricare le proposte della community (GET)
async function fetchCommunityTrades() {
  try {

    // Effettua una richiesta GET all'endpoint /api/trades
    const response = await fetch('http://localhost:3000/api/trade', {
      method: 'GET',
      headers: {
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

    // Effettua una richiesta GET all'endpoint /api/trade/user/proposals
    const response = await fetch('http://localhost:3000/api/trade/user/proposals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento delle tue proposte');
    }

    const userProposals = await response.json();
    const container = document.getElementById('user-proposals');
    container.innerHTML = ''; // Pulisce il contenitore

    // Ciclo attraverso ogni proposta e aggiungo un bottone "Elimina"
    userProposals.forEach(proposal => {
      const offeredCards = proposal.proposed_cards.map(card => `ID: ${card.card_id}, Quantità: ${card.quantity}`).join(', ');

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
  } catch (error) {
    console.error('Errore durante il caricamento delle tue proposte:', error);
    alert('Errore durante il caricamento delle tue proposte.');
  }
}


// Funzione per caricare le offerte fatte dall'utente (GET)
async function fetchUserOffers() {
  try {
    const response = await fetch('http://localhost:3000/api/trade/user/offers', {
      method: 'GET',
      headers: {
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
          <td>
            <button class="btn btn-danger" data-offer-id="${offer._id}">Elimina</button>
          </td>
        `;
        container.appendChild(row);
      });
    });
  } catch (error) {
    console.error('Errore durante il caricamento delle tue offerte:', error);
    alert('Errore durante il caricamento delle tue offerte.');
  }
}

// Funzione per cancellare un'offerta (DELETE a /trade/offers/:offerId)
export async function deleteOffer(offerId) {
  try {


    // Effettua la richiesta DELETE per cancellare l'offerta
    const response = await fetch(`http://localhost:3000/api/trade/offers/${offerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Errore nella cancellazione dell\'offerta.');
    }

    // Messaggio di successo e rimozione dell'offerta dall'interfaccia utente
    console.log('Offerta cancellata con successo');
    alert('Offerta cancellata con successo');

    // Dopo la cancellazione, ricarica le offerte dell'utente per riflettere i cambiamenti
    fetchUserOffers(); // Ricarica la lista delle offerte

  } catch (error) {
    console.error('Errore durante la cancellazione dell\'offerta:', error);
    alert('Errore durante la cancellazione dell\'offerta.');
  }
}

// Funzione per inviare la proposta di trade (API call)
export async function postTradeProposal(proposedCards) {
  try {

    // Effettua la richiesta POST per creare una nuova proposta di trade
    const response = await fetch('http://localhost:3000/api/trade', {
      method: 'POST',
      headers: {
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

    const response = await fetch(`http://localhost:3000/api/album/search?name_starts_with=${name}`, {
      method: 'GET',
      headers: {
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

    console.log(`Caricamento delle carte per la pagina: ${pageNumber}`); // Debug

    // Richiesta per ottenere le carte per pagina
    const response = await fetch(`http://localhost:3000/api/album/trade/cards?page_number=${pageNumber}`, {
      method: 'GET',
      headers: {
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

// Funzione per cancellare una proposta di trade (DELETE a /trade/:tradeId)
export async function deleteTrade(tradeId) {
  try {

    const response = await fetch(`http://localhost:3000/api/trade/${tradeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Errore nella cancellazione della proposta.');
    }

    // Messaggio di successo e rimozione della proposta dall'interfaccia utente
    console.log('Proposta cancellata con successo');
    alert('Proposta cancellata con successo');

    // Dopo la cancellazione, ricarica le proposte dell'utente per riflettere i cambiamenti
    fetchUserProposals(); // Ricarica la lista delle proposte

  } catch (error) {
    console.error('Errore durante la cancellazione della proposta:', error);
    alert('Errore durante la cancellazione della proposta.');
  }
}

// Funzione per accettare un'offerta (PUT a /trade/:tradeId/offers/:offerId/accept)
export async function putAcceptOffer(tradeId, offerId) {
  try {

      const response = await fetch(`http://localhost:3000/api/trade/${tradeId}/offers/${offerId}/accept`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          }
      });

      if (!response.ok) {
          throw new Error('Errore durante l\'accettazione dell\'offerta.');
      }

      return await response.json();

  } catch (error) {
      console.error('Errore durante l\'accettazione dell\'offerta:', error);
      throw error;
  }
}

// Funzione per caricare la proposta e le offerte associate (GET a /api/trade/user/proposals/:tradeId)
export async function getUserProposalWithOffers(tradeId) {
  try {

      const response = await fetch(`http://localhost:3000/api/trade/user/proposals/${tradeId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
      });

      if (!response.ok) {
          throw new Error('Errore durante il recupero della proposta e delle offerte.');
      }

      return await response.json();

  } catch (error) {
      console.error('Errore durante il caricamento della proposta e delle offerte:', error);
      throw error;
  }
}

// Funzione per caricare i dettagli completi delle carte offerte e visualizzarle nell'overlay usando il template
export async function getOfferedCards(offeredCards, containerId) {
  try {

      // Prepara i dati per inviare la richiesta POST all'endpoint con le carte offerte
      const requestBody = {
          offers: [
              {
                  id_offerta: containerId, // Associa l'ID dell'offerta al container
                  idCarte: offeredCards.map(card => card.card_id) // Mappa gli ID delle carte offerte
              }
          ]
      };

      // Effettua la richiesta POST per ottenere i dettagli delle carte offerte
      const response = await fetch('http://localhost:3000/api/trade/cards/details', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
          throw new Error('Errore durante il recupero dei dettagli delle carte offerte.');
      }

      return await response.json();

  } catch (error) {
      console.error('Errore durante il caricamento delle carte offerte:', error);
      throw error;
  }
}

// Funzione per inviare l'offerta (POST a /trade/:tradeId/offers)
export async function postOffer(tradeId, selectedCards) {
  if (selectedCards.length === 0) {
    alert('Devi selezionare almeno una carta per inviare l\'offerta.');
    return;
  }

  const offeredCards = selectedCards.map(card => ({
    card_id: card.id,
    quantity: 1  // Puoi modificare la quantità in base alla tua logica
  }));

  try {

    const response = await fetch(`http://localhost:3000/api/trade/${tradeId}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offered_cards: offeredCards }) // Corpo della richiesta
    });

    if (!response.ok) {
      // Ottieni dettagli dell'errore dal server (se disponibili)
      const errorDetails = await response.json();
      throw new Error(errorDetails.message || 'Errore nell\'invio dell\'offerta.');
    }

    // Gestisci correttamente la risposta di successo
    return await response.json();

  } catch (error) {
    // Stampa l'errore e mostra il messaggio solo se c'è un problema
    console.error('Errore durante l\'invio dell\'offerta:', error);
    throw error;
  }
}



