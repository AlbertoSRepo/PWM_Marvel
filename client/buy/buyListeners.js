// buyListeners.js

// Import navbar per caricamento interfaccia superiore
import { loadNavbar } from '../shared/navbar.js';
// Import per recupero dati figurine iniziali
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js';
// Import funzioni controller per gestione acquisti
import { buyCredits, buyCardPacket, loadUserCredits } from './buyController.js';

// Event listener principale per inizializzazione pagina
document.addEventListener('DOMContentLoaded', async () => {
  
  // Carica navbar con sezione buy attiva
  try {
    loadNavbar('buy');
    console.log('Navbar loaded successfully'); // Log debug caricamento navbar
  } catch (error) {
    console.error('Error loading navbar:', error);
  }

  // Verifica e carica figurineData se non presente
  try {
    await fetchFigurineDataIfNeeded();  
    console.log('figurineData caricata o già presente.');
  } catch (error) {
    console.error('Errore caricamento figurineData:', error);
  }

  // Carica crediti utente e aggiorna UI bottone
  try {
    await loadUserCredits();
  } catch (error) {
    console.error('Errore nel caricamento dei crediti:', error);
  }

  // Attacca listener ai pulsanti acquisto crediti
  document.querySelectorAll('.coin-button').forEach(button => {
    button.addEventListener('click', () => {
      const credits = parseInt(button.getAttribute('data-credits'), 10); // Ottiene crediti da attributo
      buyCredits(credits); // Esegue acquisto crediti
    });
  });

  // Attacca listener al pulsante acquisto pacchetto
  const buyPacketBtn = document.getElementById('buyPacketBtn');
  buyPacketBtn.addEventListener('click', () => {
    if (!buyPacketBtn.disabled) { // Controlla se bottone abilitato
      buyCardPacket(); // Esegue acquisto pacchetto
    }
  });
});