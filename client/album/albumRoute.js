// albumRoute.js

/**
 * POST /api/album/cardsByIds
 * @param {number[]} idArray  array di ID (es. [101, 102, 103])
 * @returns {Promise<object>} { credits, cards: [ { id, quantity }, ... ] }
 */
export async function getCardsByIds(idArray) {
  const response = await fetch('http://localhost:3000/api/album/cardsByIds', { // Richiesta POST per ottenere carte per ID
    method: 'POST', // Metodo POST per inviare array ID
    headers: { 'Content-Type': 'application/json' }, // Header JSON per corpo richiesta
    body: JSON.stringify({ cardIds: idArray }) // Converte array ID in JSON
  });
  if (!response.ok) { // Controlla se risposta è valida
    throw new Error(`Errore nella richiesta al server (cardsByIds). Status code: ${response.status}`); // Lancia errore con status code
  }
  return response.json(); // Restituisce dati JSON parsati
}

/**
 * GET /api/album/characters/:characterId
 * @param {number} characterId
 * @returns {Promise<object>} Dettagli del personaggio
 */
export async function getCharacterDetails(characterId) {
  const response = await fetch(`http://localhost:3000/api/album/characters/${characterId}`, { // Richiesta GET per dettagli personaggio
    method: 'GET', // Metodo GET per recuperare dati
    headers: { 'Content-Type': 'application/json' }, // Header JSON standard
  });
  if (!response.ok) { // Verifica successo richiesta
    throw new Error(`Errore nella richiesta al server (dettagli). Status code: ${response.status}`); // Errore con codice status
  }
  return response.json(); // Parsing JSON della risposta
}

/**
 * PUT /api/album/sell/:cardId
 * @param {number} cardId
 * @returns {Promise<any>} Risposta JSON dal server
 */
export async function sellCardAPI(cardId) {
  const response = await fetch(`http://localhost:3000/api/album/sell/${cardId}`, { // Richiesta PUT per vendere carta
    method: 'PUT', // Metodo PUT per aggiornare stato carta
    headers: { 'Content-Type': 'application/json' }, // Header tipo contenuto JSON
  });
  if (!response.ok) { // Controllo validità risposta server
    throw new Error('Errore durante la vendita della carta.'); // Messaggio errore generico vendita
  }
  return response.json(); // Ritorna risposta JSON del server
}
