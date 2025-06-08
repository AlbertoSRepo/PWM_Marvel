// tradeRoute.js

/**
 * GET /api/trade (Proposte della community)
 */
export async function fetchCommunityTradesAPI() {
  const response = await fetch('http://localhost:3000/api/trade', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle proposte della community');
  }
  return response.json();
}

/**
 * GET /api/album/possessed?limit=:limit&offset=:offset
 * Ritorna { total, cards: [ {id, quantity}, ... ] }
 */
export async function getPossessedCardsAPI(limit, offset) {
  const url = `http://localhost:3000/api/album/possessed?limit=${limit}&offset=${offset}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Errore fetch possessed cards. Status: ${response.status}`);
  }
  return response.json(); // { total, cards }
}

/**
 * GET /api/trade/user/proposals (Proposte dell'utente)
 */
export async function fetchUserProposalsAPI() {
  const response = await fetch('http://localhost:3000/api/trade/user/proposals', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle tue proposte');
  }
  return response.json();
}

/**
 * GET /api/trade/user/offers (Offerte dell’utente)
 */
export async function fetchUserOffersAPI() {
  const response = await fetch('http://localhost:3000/api/trade/user/offers', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle tue offerte');
  }
  return response.json();
}

/**
 * DELETE /api/trade/offers/:offerId (Cancella un'offerta specifica)
 */
export async function deleteOfferAPI(offerId) {
  const response = await fetch(`http://localhost:3000/api/trade/offers/${offerId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore nella cancellazione dell’offerta.');
  }
  return response.json();
}

/**
 * POST /api/trade (Crea una nuova proposta di trade)
 */
export async function postTradeProposalAPI(proposedCards) {
  const response = await fetch('http://localhost:3000/api/trade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposed_cards: proposedCards }),
  });
  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(errorDetails.message || 'Errore nella creazione della proposta di trade');
  }
  return response.json();
}

/**
 * GET /api/album/search?name_starts_with=...
 */
export async function getCardsByNameAPI(name) {
  const response = await fetch(`http://localhost:3000/api/album/search?name_starts_with=${encodeURIComponent(name)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Errore nella ricerca delle carte. Status code: ${response.status}`);
  }
  return response.json();
}

/**
 * DELETE /api/trade/:tradeId (Cancella una proposta)
 */
export async function deleteTradeAPI(tradeId) {
  const response = await fetch(`http://localhost:3000/api/trade/${tradeId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore nella cancellazione della proposta.');
  }
  return response.json();
}

/**
 * PUT /api/trade/:tradeId/offers/:offerId/accept (Accetta offerta)
 */
export async function putAcceptOfferAPI(tradeId, offerId) {
  const response = await fetch(`http://localhost:3000/api/trade/${tradeId}/offers/${offerId}/accept`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore durante l’accettazione dell’offerta.');
  }
  return response.json();
}

/**
 * GET /api/trade/user/proposals/:tradeId (Proposta utente + relative offerte)
 */
export async function getUserProposalWithOffersAPI(tradeId) {
  const response = await fetch(`http://localhost:3000/api/trade/user/proposals/${tradeId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore durante il recupero della proposta e delle offerte.');
  }
  return response.json();
}

/**
 * POST /api/trade/cards/details
 * - Per ottenere i dettagli delle carte (immagini, nomi, ecc.) date le `offered_cards`.
 */
export async function getOfferedCardsAPI(offeredCards, containerId) {
  const requestBody = {
    offers: [
      {
        id_offerta: containerId,
        idCarte: offeredCards.map(c => c.card_id),
      },
    ],
  };

  const response = await fetch('http://localhost:3000/api/trade/cards/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    throw new Error('Errore durante il recupero dei dettagli delle carte offerte.');
  }
  return response.json();
}

/**
 * POST /api/trade/:tradeId/offers (Invia offerta a una proposta esistente)
 */
export async function postOfferAPI(tradeId, offeredCards) {
  const response = await fetch(`http://localhost:3000/api/trade/${tradeId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offered_cards: offeredCards }),
  });
  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(errorDetails.message || 'Errore nell’invio dell’offerta.');
  }
  return response.json();
}

/**
 * GET /api/trade/:tradeId/details (Dettagli di una proposta specifica)
 */
export async function getTradeDetailsAPI(tradeId) {
  const response = await fetch(`http://localhost:3000/api/trade/${tradeId}/details`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore durante il recupero dei dettagli della proposta.');
  }
  return response.json();
}

/**
 * GET /api/trade/offers/:offerId/details (Ottieni dettagli di un'offerta)
 */
export async function getOfferDetailsAPI(offerId) {
  const response = await fetch(`http://localhost:3000/api/trade/offers/${offerId}/details`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore durante il recupero dei dettagli dell\'offerta.');
  }
  return response.json();
}
