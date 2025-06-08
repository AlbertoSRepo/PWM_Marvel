// buyListeners.js
import { loadNavbar } from '../shared/navbar.js';
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js';
import { buyCredits, buyCardPacket, loadUserCredits } from './buyController.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Carica la navbar - Make sure this is the first thing
  try {
    loadNavbar('buy');
    console.log('Navbar loaded successfully'); // Add debug log
  } catch (error) {
    console.error('Error loading navbar:', error);
  }

  // 2) Verifica e carica figurineData in localStorage se non presente
  try {
    await fetchFigurineDataIfNeeded();  
    console.log('figurineData caricata o già presente.');
  } catch (error) {
    console.error('Errore caricamento figurineData:', error);
  }

  // 3) Carica i crediti dell'utente e aggiorna l'UI del bottone pacchetto
  try {
    await loadUserCredits();
  } catch (error) {
    console.error('Errore nel caricamento dei crediti:', error);
  }

  // 4) Attacca listener ai pulsanti "coin-button" per i crediti
  document.querySelectorAll('.coin-button').forEach(button => {
    button.addEventListener('click', () => {
      const credits = parseInt(button.getAttribute('data-credits'), 10);
      buyCredits(credits);
    });
  });

  // 5) Attacca listener al pulsante "buyPacketBtn"
  const buyPacketBtn = document.getElementById('buyPacketBtn');
  buyPacketBtn.addEventListener('click', () => {
    if (!buyPacketBtn.disabled) {
      buyCardPacket();
    }
  });
});