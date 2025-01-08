// albumRoute.js

/**
 * GET /api/album/cards?page_number=:page
 * @param {number} pageNumber
 * @returns {Promise<object>} Ritorna un oggetto con { cards, credits, ...}
 */
export async function getCards(pageNumber) {
  const response = await fetch(`http://localhost:3000/api/album/cards?page_number=${pageNumber}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
  }
  return response.json();
}

/**
 * GET /api/album/search?name_starts_with=:name
 * @param {string} name
 * @returns {Promise<Array>} Ritorna un array di carte
 */
export async function searchCardsByName(name) {
  const response = await fetch(`http://localhost:3000/api/album/search?name_starts_with=${name}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Errore nella richiesta al server (search). Status code: ${response.status}`);
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

