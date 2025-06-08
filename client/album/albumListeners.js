// albumListeners.js

// Import navbar per caricamento interfaccia superiore
import { loadNavbar } from '../shared/navbar.js';  
// Import per recupero dati figurine iniziali
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js';
// Import funzioni controller per gestione carte e overlay
import {
  fetchCardsAndUpdate,
  searchCardsLocallyAndUpdate,
  sellCard,
  showOverlayWithDetails 
} from './albumController.js';

// Import funzione per chiusura overlay
import { hideOverlay } from './albumUI.js';

// Event listener principale per inizializzazione pagina
document.addEventListener('DOMContentLoaded', async () => {
  
  loadNavbar('album'); // Carica navbar con sezione album attiva

  const figurineData = await fetchFigurineDataIfNeeded(); // Recupera dati figurine se necessario

  // Ottiene riferimenti elementi DOM per interazioni
  const albumPage = document.getElementById('albumPage');
  const albumForm = document.getElementById('albumForm');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  const sellCardBtn = document.getElementById('sell-card-btn');
  const closeOverlayBtn = document.getElementById('close-overlay');
  const overlayBackground = document.getElementById('overlay-background');

  // Imposta pagina iniziale a 1 e carica carte
  albumPage.value = 1;
  fetchCardsAndUpdate(1);

  // Gestisce submit form per navigazione pagina specifica
  albumForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Previene submit default
    const pageNumber = parseInt(albumPage.value, 10);
    
    // Valida input pagina tra 1 e 105
    if (!pageNumber || pageNumber < 1 || pageNumber > 105) {
      alert('Inserisci una pagina valida (1-105).');
      return;
    }
    fetchCardsAndUpdate(pageNumber); // Carica carte della pagina richiesta
  });

  // Gestisce click pulsante pagina precedente
  prevPageBtn.addEventListener('click', () => {
    let currentPage = parseInt(albumPage.value, 10);
    if (currentPage > 1) {
      currentPage--; // Decrementa pagina
      albumPage.value = currentPage; // Aggiorna input
      fetchCardsAndUpdate(currentPage); // Carica nuova pagina
    }
  });

  // Gestisce click pulsante pagina successiva
  nextPageBtn.addEventListener('click', () => {
    let currentPage = parseInt(albumPage.value, 10);
    if (currentPage < 105) {
      currentPage++; // Incrementa pagina
      albumPage.value = currentPage; // Aggiorna input
      fetchCardsAndUpdate(currentPage); // Carica nuova pagina
    }
  });

  // Gestisce click pulsante ricerca
  searchButton.addEventListener('click', () => {
    const searchQuery = searchInput.value.trim(); // Ottiene testo ricerca
    searchCardsLocallyAndUpdate(searchQuery); // Esegue ricerca locale
  });

  // Gestisce pressione Enter nel campo ricerca
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const searchQuery = event.target.value.trim(); // Ottiene testo ricerca
      searchCardsLocallyAndUpdate(searchQuery); // Esegue ricerca locale
    }
  });

  // Gestisce click pulsante vendita carta nell'overlay
  sellCardBtn.addEventListener('click', () => {
    const cardId = document.getElementById('overlay-title').getAttribute('data-card-id'); // Ottiene ID carta
    const currentPage = parseInt(albumPage.value, 10); // Ottiene pagina corrente

    if (cardId) {
      const confirmed = confirm('Sei sicuro di voler vendere questa carta?'); // Conferma vendita
      if (confirmed) {
        sellCard(cardId, currentPage); // Esegue vendita carta
      }
    }
  });

  // Gestisce chiusura overlay con icona X
  closeOverlayBtn.addEventListener('click', hideOverlay);
  
  // Gestisce chiusura overlay cliccando background
  overlayBackground.addEventListener('click', hideOverlay);

  // Gestisce click su carte possedute per mostrare dettagli
  document.addEventListener('click', (event) => {
    const card = event.target.closest('.marvel-card.posseduta'); // Trova carta posseduta cliccata
    if (card) {
      const cardId = card.querySelector('.card-id').textContent.replace('ID: ', ''); // Estrae ID carta
      showOverlayWithDetails(cardId); // Mostra overlay con dettagli personaggio
    }
  });
});
