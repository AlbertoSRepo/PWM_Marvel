// albumUI.js

import { showOverlayWithDetails } from './albumController.js';

/**
 * Mostra lo spinner principale e nasconde il container delle carte.
 */
export function showLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'block';
  document.querySelector('.card-container').classList.add('d-none');
}

/**
 * Nasconde lo spinner principale e mostra il container delle carte.
 */
export function hideLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'none';
  document.querySelector('.card-container').classList.remove('d-none');
}

/**
 * Mostra lo spinner dell'overlay e nasconde l’accordion dei dettagli.
 */
export function showOverlayLoader() {
  document.getElementById('overlay-background').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('loading-spinner-overlay').style.display = 'block';
  document.getElementById('detailsAccordion').style.display = 'none';

  // Setup “initial” overlay state
  const overlayTitle = document.getElementById('overlay-title');
  overlayTitle.textContent = 'Caricamento...';
  overlayTitle.removeAttribute('data-card-id');

  document.getElementById('overlay-img').src = 'placeholder-image.jpeg';
  document.getElementById('sell-card-btn').style.display = 'none';
  document.getElementById('overlay-description').textContent = '';

  // Svuota le sezioni
  document.getElementById('overlay-comics').innerHTML = '';
  document.getElementById('overlay-series').innerHTML = '';
  document.getElementById('overlay-stories').innerHTML = '';
  document.getElementById('overlay-events').innerHTML = '';
}

/**
 * Nasconde lo spinner dell’overlay e mostra l’accordion dei dettagli.
 */
export function hideOverlayLoader() {
  document.getElementById('loading-spinner-overlay').style.display = 'none';
  document.getElementById('detailsAccordion').style.display = 'block';
}

/**
 * Funzione per nascondere l'overlay completamente.
 */
export function hideOverlay() {
  document.getElementById('overlay-background').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

/**
 * Aggiorna i crediti nella navbar.
 */
export function updateCredits(credits) {
  const creditsElement = document.getElementById('user-credits');
  if (creditsElement) {
    creditsElement.textContent = `Crediti: ${credits}`;
  }
}

/**
 * Aggiorna lo stato dei pulsanti di paginazione
 */
export function updatePaginationButtons(currentPage) {
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  prevPageBtn.disabled = (currentPage <= 1);
  nextPageBtn.disabled = (currentPage >= 105);
}

/**
 * Crea l'elemento card dal template e gestisce gli eventi.
 */
function createCardHTML(card) {
  const template = document.getElementById('card-template').content.cloneNode(true);

  // Titolo, ID e quantità
  template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
  template.querySelector('.card-id').textContent = `ID: ${card.id}`;
  template.querySelector('.card-quantity').textContent = card.quantity
    ? `${card.quantity}`
    : '';

  // Immagine
  const imgTop = template.querySelector('.card-img-top');
  if (card.thumbnail) {
    imgTop.src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
  } else {
    imgTop.src = 'placeholder-image.jpg';
  }

  // Stato "posseduta" vs "non-posseduta"
  const marvelCard = template.querySelector('.marvel-card');
  if (card.state === 'posseduta') {
    marvelCard.classList.add('posseduta');
    // Al click, mostra i dettagli
    marvelCard.addEventListener('click', () => showOverlayWithDetails(card.id));
  } else {
    marvelCard.classList.add('non-posseduta');
  }

  return template;
}

/**
 * Aggiorna la UI con 3 righe da 6 carte ciascuna.
 */
export function updateCards(cardsData) {
  if (!cardsData || cardsData.length === 0) {
    alert('Nessuna carta trovata per la pagina selezionata.');
    return;
  }

  const row1 = document.getElementById('row-1');
  const row2 = document.getElementById('row-2');
  const row3 = document.getElementById('row-3');

  row1.innerHTML = '';
  row2.innerHTML = '';
  row3.innerHTML = '';

  cardsData.slice(0, 6).forEach(card => row1.appendChild(createCardHTML(card)));
  cardsData.slice(6, 12).forEach(card => row2.appendChild(createCardHTML(card)));
  cardsData.slice(12, 18).forEach(card => row3.appendChild(createCardHTML(card)));
}

/**
 * Aggiorna la UI con una divisione "equilibrata" (per la ricerca).
 */
export function updateNameCards(cardsData) {
  if (!cardsData || cardsData.length === 0) {
    alert('Nessuna carta trovata per la ricerca effettuata.');
    return;
  }

  const row1 = document.getElementById('row-1');
  const row2 = document.getElementById('row-2');
  const row3 = document.getElementById('row-3');

  row1.innerHTML = '';
  row2.innerHTML = '';
  row3.innerHTML = '';

  const totalCards = cardsData.length;
  const perRow = Math.ceil(totalCards / 3);

  // Dividi le carte
  const firstSlice = cardsData.slice(0, perRow);
  const secondSlice = cardsData.slice(perRow, perRow * 2);
  const thirdSlice = cardsData.slice(perRow * 2);

  firstSlice.forEach(card => row1.appendChild(createCardHTML(card)));
  secondSlice.forEach(card => row2.appendChild(createCardHTML(card)));
  thirdSlice.forEach(card => row3.appendChild(createCardHTML(card)));
}

/**
 * Popola l'overlay con i dati di un character (name, descrizione, ecc.)
 */
export function populateCharacterOverlay(characterDetails) {
  // Titolo e attributo data-card-id
  const overlayTitle = document.getElementById('overlay-title');
  overlayTitle.textContent = characterDetails.name;
  overlayTitle.setAttribute('data-card-id', characterDetails.id);

  // Rendi visibile il bottone vendi carta
  document.getElementById('sell-card-btn').style.display = 'block';

  // Immagine
  const thumbnail = characterDetails.thumbnail;
  if (thumbnail && thumbnail.path && thumbnail.extension) {
    document.getElementById('overlay-img').src = `${thumbnail.path}.${thumbnail.extension}`;
  }

  // Descrizione
  const desc = (characterDetails.description || '').trim();
  document.getElementById('overlay-description').textContent =
    desc || 'Nessuna descrizione disponibile.';

  // Comics, Series, Stories, Events
  populateAccordionSection('overlay-comics', characterDetails.comics, 'Comics');
  populateAccordionSection('overlay-series', characterDetails.series, 'Series');
  populateAccordionSection('overlay-stories', characterDetails.stories, 'Stories');
  populateAccordionSection('overlay-events', characterDetails.events, 'Events');
}

// --------------------------------------------------------
// Helper per le sezioni dell'accordion (Comics, Series,...)
// --------------------------------------------------------
function populateAccordionSection(sectionId, items, sectionName) {
  const section = document.getElementById(sectionId);
  section.innerHTML = '';

  if (!items || items.length === 0) {
    let message;
    switch (sectionName) {
      case 'Comics':  message = 'Nessun fumetto associato.';    break;
      case 'Series':  message = 'Nessuna serie associata.';      break;
      case 'Stories': message = 'Nessuna storia associata.';     break;
      case 'Events':  message = 'Nessun evento associato.';      break;
      default:        message = 'Nessun dato disponibile.';       break;
    }
    section.innerHTML = `<p>${message}</p>`;
    return;
  }

  items.forEach((item, index) => {
    const uniqueId = `${sectionId}-${index}`;

    let thumbnailSrc = 'placeholder-image.jpeg';
    if (item.thumbnail && item.thumbnail.path && item.thumbnail.extension) {
      thumbnailSrc = `${item.thumbnail.path}.${item.thumbnail.extension}`;
    }

    const listItem = document.createElement('div');
    listItem.innerHTML = `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${uniqueId}">
          <button 
            class="accordion-button collapsed" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#collapse-${uniqueId}" 
            aria-expanded="false" 
            aria-controls="collapse-${uniqueId}"
          >
            <strong>${item.name}</strong>
          </button>
        </h2>
        <div 
          id="collapse-${uniqueId}" 
          class="accordion-collapse collapse" 
          aria-labelledby="heading-${uniqueId}" 
          data-bs-parent="#${sectionId}"
        >
          <div class="accordion-body">
            <div class="accordion-content d-flex align-items-start">
              <img 
                src="${thumbnailSrc}"
                alt="${item.name}"
                class="img-thumbnail accordion-image"
              />
              <div class="accordion-text">
                <p>${item.description || 'Nessuna descrizione disponibile.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    section.appendChild(listItem);
  });
}
