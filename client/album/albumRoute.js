// albumRoute.js

/**
 * POST /api/album/cardsByIds
 * @param {number[]} idArray  array di ID (es. [101, 102, 103])
 * @returns {Promise<object>} { credits, cards: [ { id, quantity }, ... ] }
 */
export async function getCardsByIds(idArray) {
  const response = await fetch('http://localhost:3000/api/album/cardsByIds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardIds: idArray })
  });
  if (!response.ok) {
    throw new Error(`Errore nella richiesta al server (cardsByIds). Status code: ${response.status}`);
  }
  return response.json();
}

/**
 * GET /api/album/characters/:characterId
 * @param {number} characterId
 * @returns {Promise<object>} Dettagli del personaggio
 */
export async function getCharacterDetails(characterId) {
  const response = await fetch(`http://localhost:3000/api/album/characters/${characterId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Errore nella richiesta al server (dettagli). Status code: ${response.status}`);
  }
  return response.json();
}

/**
 * PUT /api/album/sell/:cardId
 * @param {number} cardId
 * @returns {Promise<any>} Risposta JSON dal server
 */
export async function sellCardAPI(cardId) {
  const response = await fetch(`http://localhost:3000/api/album/sell/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Errore durante la vendita della carta.');
  }
  return response.json();
}
