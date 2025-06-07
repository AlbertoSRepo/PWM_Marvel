// albumListeners.js

import { loadNavbar } from '../shared/navbar.js';  // ipotetico file comune
import { fetchFigurineDataIfNeeded } from '../shared/initialData.js';
import {
  fetchCardsAndUpdate,
  searchCardsLocallyAndUpdate,
  sellCard
} from './albumController.js';

import { hideOverlay } from './albumUI.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Carica la navbar
  loadNavbar('album');

  const figurineData = await fetchFigurineDataIfNeeded();

  // 2. Referenze ai nodi DOM
  const albumPage = document.getElementById('albumPage');
  const albumForm = document.getElementById('albumForm');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  const sellCardBtn = document.getElementById('sell-card-btn');
  const closeOverlayBtn = document.getElementById('close-overlay');
  const overlayBackground = document.getElementById('overlay-background');

  // 3. Inizializzazione pagina
  albumPage.value = 1;
  fetchCardsAndUpdate(1);

  // 4. Event listener sul form “Vai alla Pagina”
  albumForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const pageNumber = parseInt(albumPage.value, 10);
    if (!pageNumber || pageNumber < 1 || pageNumber > 105) {
      alert('Inserisci una pagina valida (1-105).');
      return;
    }
    fetchCardsAndUpdate(pageNumber);
  });

  // Pulsante “Pagina Precedente”
  prevPageBtn.addEventListener('click', () => {
    let currentPage = parseInt(albumPage.value, 10);
    if (currentPage > 1) {
      currentPage--;
      albumPage.value = currentPage;
      fetchCardsAndUpdate(currentPage);
    }
  });

  // Pulsante “Pagina Successiva”
  nextPageBtn.addEventListener('click', () => {
    let currentPage = parseInt(albumPage.value, 10);
    if (currentPage < 105) {
      currentPage++;
      albumPage.value = currentPage;
      fetchCardsAndUpdate(currentPage);
    }
  });

  // Pulsante "Cerca"
  searchButton.addEventListener('click', () => {
    const searchQuery = searchInput.value.trim();
    // Rimuovi la condizione if(searchQuery) per permettere ricerche vuote
    searchCardsLocallyAndUpdate(searchQuery);
  });

  // Aggiungi anche l'evento per il tasto "Enter"
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const searchQuery = event.target.value.trim();
      searchCardsLocallyAndUpdate(searchQuery);
    }
  });

  // Pulsante “Vendi carta” nell’overlay
  sellCardBtn.addEventListener('click', () => {
    const cardId = document.getElementById('overlay-title').getAttribute('data-card-id');
    const currentPage = parseInt(albumPage.value, 10);

    if (cardId) {
      const confirmed = confirm('Sei sicuro di voler vendere questa carta?');
      if (confirmed) {
        sellCard(cardId, currentPage);
      }
    }
  });

  // Chiusura overlay con la X
  closeOverlayBtn.addEventListener('click', hideOverlay);
  // Chiusura overlay cliccando sul background (opzionale)
  overlayBackground.addEventListener('click', hideOverlay);
});
