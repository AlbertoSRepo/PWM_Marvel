// buyRoute.js

/**
 * POST /api/buy/credits
 * @param {number} creditAmount - Quantità crediti da acquistare
 * @returns {Promise<object>} Risposta con crediti aggiornati
 */
export async function buyCreditsAPI(creditAmount) {
  const response = await fetch('http://localhost:3000/api/users/buy-credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: creditAmount })
  });
  if (!response.ok) {
    throw new Error('Errore durante l’acquisto crediti.');
  }
  return response.json();
}

/**
 * POST /api/buy/packet
 * @returns {Promise<object>} Risposta con carte acquistate e crediti
 */
export async function buyCardPacketAPI() {
  const response = await fetch('http://localhost:3000/api/users/buy-packet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Errore durante l’acquisto del pacchetto.');
  }
  return response.json();
}
