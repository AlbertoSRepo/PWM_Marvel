// buyRoute.js

/**
 * POST /api/users/buy-credits
 * @param {number} creditAmount
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
    return response.json(); // { message, credits, ... }
  }
  
  /**
   * POST /api/users/buy-packet
   * Ritorna { message, success, credits, purchasedCardIds: [101, 123, ...] }
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
  