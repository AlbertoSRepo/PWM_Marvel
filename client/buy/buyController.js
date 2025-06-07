// buyController.js

import { buyCreditsAPI, buyCardPacketAPI } from './buyRoute.js';
import { showOverlayMessage, showPacketCardsOverlay, updateBuyPacketButton } from './buyUI.js';
import { getFigurineDataOrThrow, mergeServerAndLocalData } from '../shared/cardUtils.js';

/**
 * Aggiorna i crediti nella navbar
 */
function updateNavbarCredits(credits) {
  const creditsElement = document.getElementById('user-credits');
  if (creditsElement) {
    creditsElement.textContent = `Crediti: ${credits}`;
  }
  
  // Aggiorna anche il count specifico se esiste
  const creditCount = document.getElementById('credit-count');
  if (creditCount) {
    creditCount.textContent = credits;
  }
}

/**
 * Compra un certo numero di crediti
 */
export async function buyCredits(creditAmount) {
  try {
    const result = await buyCreditsAPI(creditAmount);
    // result = { message, credits, ... }
    
    // Aggiorna i crediti nella navbar
    updateNavbarCredits(result.credits);
    
    // Mostra messaggio di successo
    showOverlayMessage(`Hai acquistato ${creditAmount} crediti.`, result.credits);
    
    // Aggiorna il bottone del pacchetto dopo l'acquisto di crediti
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
    const result = await buyCardPacketAPI();
    // result = { message, success, credits, purchasedCardIds }

    if (!result.success) {
      // Caso: crediti insufficienti o altro errore
      showOverlayMessage(result.message, result.credits);
      updateBuyPacketButton(result.credits);
      updateNavbarCredits(result.credits);
      return;
    }

    // Verifica che ci siano carte acquistate
    if (!result.purchasedCardIds || result.purchasedCardIds.length === 0) {
      showOverlayMessage('Nessuna carta ricevuta nel pacchetto.', result.credits);
      updateBuyPacketButton(result.credits);
      updateNavbarCredits(result.credits);
      return;
    }

    // Ora uniamo "purchasedCardIds" con figurineData locale
    const figurineData = getFigurineDataOrThrow();
    const serverCards = result.purchasedCardIds.map(id => ({ id, quantity: 1 }));

    // Li "fondiamo" come fosse "posseduta" => quantity>0
    const merged = mergeServerAndLocalData(serverCards, figurineData, false);

    // merged conterrà [{ id, name, thumbnail, state:'posseduta', quantity: 1 }, ...]
    // Passiamo a una UI function che mostri le carte
    showPacketCardsOverlay(merged, result.credits);
    
    // Aggiorna il bottone del pacchetto dopo l'acquisto
    updateBuyPacketButton(result.credits);
    
    // Aggiorna i crediti nella navbar
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
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Verifica che la risposta contenga i crediti
    if (typeof data.credits !== 'number') {
      throw new Error('Formato crediti non valido ricevuto dal server');
    }
    
    // Aggiorna l'UI del bottone pacchetto
    updateBuyPacketButton(data.credits);
    
    // Aggiorna i crediti nella navbar
    updateNavbarCredits(data.credits);
    
    return data.credits;
    
  } catch (error) {
    console.error('Errore durante il recupero dei crediti:', error);
    
    // In caso di errore, disabilita il bottone pacchetto per sicurezza
    updateBuyPacketButton(0);
    updateNavbarCredits(0);
    
    return 0;
  }
}
