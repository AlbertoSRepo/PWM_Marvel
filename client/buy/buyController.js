// buyController.js

// Import funzioni UI per aggiornamento interfaccia
import { showOverlayMessage, showPacketCardsOverlay, updateBuyPacketButton } from './buyUI.js';
// Import API routes per chiamate server
import { buyCreditsAPI, buyCardPacketAPI } from './buyRoute.js';
// Import helper per aggiornamento crediti navbar
import { updateNavbarCredits } from '../shared/uiHelpers.js';
// Import utility per gestione dati carte
import { getFigurineDataOrThrow, mergeServerAndLocalData } from '../shared/cardUtils.js';

/**
 * Compra un certo numero di crediti
 */
export async function buyCredits(creditAmount) {
  try {
    const result = await buyCreditsAPI(creditAmount); // Richiesta acquisto crediti al server
    
    // Aggiorna crediti nella navbar
    updateNavbarCredits(result.credits);
    
    // Mostra messaggio di successo
    showOverlayMessage(`Hai acquistato ${creditAmount} crediti.`, result.credits);
    
    // Aggiorna bottone pacchetto dopo acquisto crediti
    updateBuyPacketButton(result.credits);
    
  } catch (error) {
    console.error('Errore durante l\'acquisto dei crediti:', error);
    alert('Errore durante l\'acquisto dei crediti. Riprova più tardi.');
  }
}

/**
 * Compra un pacchetto di carte
 */
export async function buyCardPacket() {
  try {
    const result = await buyCardPacketAPI(); // Richiesta acquisto pacchetto al server
    
    // Recupera dati figurine da localStorage
    const figurineData = getFigurineDataOrThrow();
    
    // Mappa carte acquistate con quantità 1
    const serverCards = result.purchasedCardIds.map(id => ({ id, quantity: 1 }));

    // Combina dati server con locali come possedute
    const merged = mergeServerAndLocalData(serverCards, figurineData, false);

    // Mostra carte acquistate in overlay
    showPacketCardsOverlay(merged, result.credits);
    
    // Aggiorna bottone pacchetto dopo acquisto
    updateBuyPacketButton(result.credits);
    
    // Aggiorna crediti nella navbar
    updateNavbarCredits(result.credits);

  } catch (error) {
    console.error('Errore durante l\'acquisto del pacchetto:', error);
    alert('Errore durante l\'acquisto del pacchetto. Riprova più tardi.');
  }
}

/**
 * Recupera i crediti dell'utente e aggiorna l'UI
 */
export async function loadUserCredits() {
  try {
    const response = await fetch(`http://localhost:3000/api/users/credits`, {
      method: 'GET', // Metodo GET per recupero crediti
      headers: {
        'Content-Type': 'application/json' // Header tipo contenuto JSON
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json(); // Parse risposta JSON
    
    // Verifica formato crediti valido
    if (typeof data.credits !== 'number') {
      throw new Error('Formato crediti non valido ricevuto dal server');
    }
    
    // Aggiorna UI bottone pacchetto
    updateBuyPacketButton(data.credits);
    
    // Aggiorna crediti nella navbar
    updateNavbarCredits(data.credits);
    
    return data.credits; // Restituisce crediti utente
    
  } catch (error) {
    console.error('Errore durante il recupero dei crediti:', error);
    
    // In caso errore, disabilita bottone per sicurezza
    updateBuyPacketButton(0);
    updateNavbarCredits(0);
    
    return 0; // Restituisce 0 crediti in caso errore
  }
}
