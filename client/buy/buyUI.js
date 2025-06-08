// Import helper per aggiornamento crediti navbar
import { updateNavbarCredits } from '../shared/uiHelpers.js';
// Import builder per creazione HTML carte
import { createCardHTML } from '../shared/cardBuilder.js';

/**
 * Mostra overlay con messaggio di acquisto generico
 */
export function showOverlayMessage(message, credits) {
  const overlayBackground = document.getElementById('overlay-background'); // Sfondo overlay
  const overlayMessage = document.getElementById('overlay-message'); // Contenuto messaggio

  overlayMessage.innerHTML = `<h2>Complimenti!</h2><p>${message}</p>`; // Imposta HTML messaggio
  overlayBackground.style.display = 'block'; // Mostra overlay

  setTimeout(() => {
    overlayBackground.style.display = 'none'; // Nasconde overlay dopo 3 secondi
  }, 3000);

  updateNavbarCredits(credits); // Aggiorna crediti navbar
  updateBuyPacketButton(credits); // Aggiorna stato bottone pacchetto
}

/**
 * Mostra le carte in overlay dopo acquisto pacchetto
 */
export function showPacketCardsOverlay(cards, credits) {
  const overlayBackground = document.getElementById('overlay-background'); // Sfondo overlay
  const overlayMessage = document.getElementById('overlay-message'); // Contenuto messaggio

  overlayMessage.innerHTML = '<h2>Complimenti! Hai ricevuto le seguenti carte:</h2>'; // Titolo overlay

  const cardContainer = document.createElement('div'); // Contenitore carte
  cardContainer.classList.add('row', 'card-container'); // Aggiunge classi Bootstrap

  cards.forEach(card => {
    const cardElement = createCardHTML(card); // Crea HTML per ogni carta
    cardContainer.appendChild(cardElement); // Aggiunge carta al contenitore
  });
  overlayMessage.appendChild(cardContainer); // Aggiunge contenitore al messaggio

  overlayBackground.style.display = 'block'; // Mostra overlay

  setTimeout(() => {
    overlayBackground.style.display = 'none'; // Nasconde overlay dopo 5 secondi
  }, 5000);

  updateNavbarCredits(credits); // Aggiorna crediti navbar
  updateBuyPacketButton(credits); // Aggiorna stato bottone pacchetto
}

/**
 * Aggiorna lo stato del bottone "Compra Pacchetto"
 */
export function updateBuyPacketButton(credits) {
  const buyPacketBtn = document.getElementById('buyPacketBtn'); // Riferimento bottone pacchetto
  const warningMessage = document.getElementById('credits-warning'); // Messaggio warning crediti
  
  if (credits <= 0) {
    // Disabilita bottone e mostra warning se crediti insufficienti
    buyPacketBtn.disabled = true; // Disabilita bottone
    buyPacketBtn.classList.remove('btn-success'); // Rimuove classe successo
    buyPacketBtn.classList.add('btn-secondary'); // Aggiunge classe secondaria
    
    if (warningMessage) {
      warningMessage.style.display = 'block'; // Mostra messaggio warning
    }
  } else {
    // Abilita bottone e nascondi warning se crediti sufficienti
    buyPacketBtn.disabled = false; // Abilita bottone
    buyPacketBtn.classList.remove('btn-secondary'); // Rimuove classe secondaria
    buyPacketBtn.classList.add('btn-success'); // Aggiunge classe successo
    
    if (warningMessage) {
      warningMessage.style.display = 'none'; // Nasconde messaggio warning
    }
  }
}