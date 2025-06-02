// buyListeners.js
import { loadNavbar } from '../shared/navbar.js';
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js';
import { buyCredits, buyCardPacket } from './buyController.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Carica la navbar
  loadNavbar('buy');

  // 2) Verifica e carica figurineData in localStorage se non presente
  try {
    await fetchFigurineDataIfNeeded();  
    console.log('figurineData caricata o già presente.');
  } catch (error) {
    console.error('Errore caricamento figurineData:', error);
  }

  // 3) Attacca listener ai pulsanti "buy-button" per i crediti
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', () => {
      const credits = parseInt(button.getAttribute('data-credits'), 10);
      buyCredits(credits);
    });
  });

  // 4) Attacca listener al pulsante "buyPacketBtn"
  const buyPacketBtn = document.getElementById('buyPacketBtn');
  buyPacketBtn.addEventListener('click', () => {
    buyCardPacket();
  });
});
