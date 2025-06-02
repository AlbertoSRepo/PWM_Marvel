// buyController.js

import { buyCreditsAPI, buyCardPacketAPI } from './buyRoute.js';
import { showOverlayMessage, showPacketCardsOverlay } from './buyUI.js';
import { getFigurineDataOrThrow, mergeServerAndLocalData } from '../shared/cardUtils.js';

/**
 * Compra un certo numero di crediti
 */
export async function buyCredits(creditAmount) {
  try {
    const result = await buyCreditsAPI(creditAmount);
    // result = { message, credits, ... }
    showOverlayMessage(`Hai acquistato ${creditAmount} crediti.`, result.credits);
  } catch (error) {
    console.error('Errore durante l’acquisto dei crediti:', error);
    alert('Errore durante la richiesta.');
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
      // Caso: crediti insufficienti
      showOverlayMessage(result.message, result.credits);
      return;
    }

    // Ora uniamo "purchasedCardIds" con figurineData locale
    const figurineData = getFigurineDataOrThrow();
    const serverCards = result.purchasedCardIds.map(id => ({ id, quantity: 1 }));

    // Li “fondiamo” come fosse “posseduta” => quantity>0
    const merged = mergeServerAndLocalData(serverCards, figurineData, false);

    // merged conterrà [{ id, name, thumbnail, state:'posseduta', quantity: 1 }, ...]
    // Passiamo a una UI function che mostri le carte
    showPacketCardsOverlay(merged, result.credits);

  } catch (error) {
    console.error('Errore durante l’acquisto del pacchetto:', error);
    alert('Errore durante la richiesta.');
  }
}
