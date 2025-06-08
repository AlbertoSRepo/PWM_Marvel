// albumUI.js
import { createCardHTML } from '../shared/cardBuilder.js';

/**
 * Mostra lo spinner principale e nasconde il container delle carte.
 */
export function showLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'block'; // Mostra spinner di caricamento
  document.querySelector('.card-container').classList.add('d-none'); // Nasconde container carte
}

/**
 * Nasconde lo spinner principale e mostra il container delle carte.
 */
export function hideLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'none'; // Nasconde spinner caricamento
  document.querySelector('.card-container').classList.remove('d-none'); // Mostra container carte
}

/**
 * Mostra lo spinner dell'overlay e nasconde l'accordion dei dettagli.
 */
export function showOverlayLoader() {
  document.getElementById('overlay-background').style.display = 'block'; // Mostra sfondo overlay
  document.getElementById('overlay').style.display = 'block'; // Mostra overlay principale
  document.getElementById('loading-spinner-overlay').style.display = 'block'; // Mostra spinner overlay
  document.getElementById('detailsAccordion').style.display = 'none'; // Nasconde accordion dettagli

  // Setup "initial" overlay state
  const overlayTitle = document.getElementById('overlay-title');
  overlayTitle.textContent = 'Caricamento...'; // Imposta testo caricamento
  overlayTitle.removeAttribute('data-card-id'); // Rimuove attributo ID carta

  document.getElementById('overlay-img').src = 'placeholder-image.jpeg'; // Imposta immagine placeholder
  document.getElementById('sell-card-btn').style.display = 'none'; // Nasconde bottone vendita
  document.getElementById('overlay-description').textContent = ''; // Svuota descrizione

  // Svuota le sezioni
  document.getElementById('overlay-comics').innerHTML = ''; // Pulisce sezione comics
  document.getElementById('overlay-series').innerHTML = ''; // Pulisce sezione series
  document.getElementById('overlay-stories').innerHTML = ''; // Pulisce sezione stories
  document.getElementById('overlay-events').innerHTML = ''; // Pulisce sezione events
}

/**
 * Nasconde lo spinner dell'overlay e mostra l'accordion dei dettagli.
 */
export function hideOverlayLoader() {
  document.getElementById('loading-spinner-overlay').style.display = 'none'; // Nasconde spinner overlay
  document.getElementById('detailsAccordion').style.display = 'block'; // Mostra accordion dettagli
}

/**
 * Funzione per nascondere l'overlay completamente.
 */
export function hideOverlay() {
  document.getElementById('overlay-background').style.display = 'none'; // Nasconde sfondo overlay
  document.getElementById('overlay').style.display = 'none'; // Nasconde overlay completo
}

/**
 * Aggiorna lo stato dei pulsanti di paginazione
 */
export function updatePaginationButtons(currentPage) {
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  prevPageBtn.disabled = (currentPage <= 1); // Disabilita se prima pagina
  nextPageBtn.disabled = (currentPage >= 105); // Disabilita se ultima pagina
}

/**
 * Aggiorna la UI con 3 righe da 6 carte ciascuna.
 */
export function updateCards(cardsData) {
  if (!cardsData || cardsData.length === 0) {
    alert('Nessuna carta trovata per la pagina selezionata.'); // Alert se nessuna carta
    return;
  }

  const row1 = document.getElementById('row-1');
  const row2 = document.getElementById('row-2');
  const row3 = document.getElementById('row-3');

  row1.innerHTML = ''; // Pulisce prima riga
  row2.innerHTML = ''; // Pulisce seconda riga
  row3.innerHTML = ''; // Pulisce terza riga

  cardsData.slice(0, 6).forEach(card => row1.appendChild(createCardHTML(card))); // Prime 6 carte
  cardsData.slice(6, 12).forEach(card => row2.appendChild(createCardHTML(card))); // Carte 7-12
  cardsData.slice(12, 18).forEach(card => row3.appendChild(createCardHTML(card))); // Carte 13-18
}

/**
 * Aggiorna la UI con una divisione "equilibrata" (per la ricerca).
 */
export function updateNameCards(cardsData) {
  if (!cardsData || cardsData.length === 0) {
    alert('Nessuna carta trovata per la ricerca effettuata.'); // Alert se ricerca vuota
    return;
  }

  const row1 = document.getElementById('row-1');
  const row2 = document.getElementById('row-2');
  const row3 = document.getElementById('row-3');

  row1.innerHTML = ''; // Pulisce prima riga
  row2.innerHTML = ''; // Pulisce seconda riga
  row3.innerHTML = ''; // Pulisce terza riga

  const totalCards = cardsData.length;
  const perRow = Math.ceil(totalCards / 3); // Calcola carte per riga

  // Dividi le carte
  const firstSlice = cardsData.slice(0, perRow); // Prima porzione carte
  const secondSlice = cardsData.slice(perRow, perRow * 2); // Seconda porzione carte
  const thirdSlice = cardsData.slice(perRow * 2); // Terza porzione carte

  firstSlice.forEach(card => row1.appendChild(createCardHTML(card))); // Popola prima riga
  secondSlice.forEach(card => row2.appendChild(createCardHTML(card))); // Popola seconda riga
  thirdSlice.forEach(card => row3.appendChild(createCardHTML(card))); // Popola terza riga
}

/**
 * Popola l'overlay con i dati di un character (name, descrizione, ecc.)
 */
export function populateCharacterOverlay(characterDetails) {
  // Titolo e attributo data-card-id
  const overlayTitle = document.getElementById('overlay-title');
  overlayTitle.textContent = characterDetails.name; // Imposta nome personaggio
  overlayTitle.setAttribute('data-card-id', characterDetails.id); // Imposta ID carta

  // Rendi visibile il bottone vendi carta
  document.getElementById('sell-card-btn').style.display = 'block'; // Mostra bottone vendita

  // Immagine
  const thumbnail = characterDetails.thumbnail;
  if (thumbnail && thumbnail.path && thumbnail.extension) {
    document.getElementById('overlay-img').src = `${thumbnail.path}.${thumbnail.extension}`; // Imposta immagine personaggio
  }

  // Descrizione migliorata
  const desc = (characterDetails.description || '').trim();
  const descriptionElement = document.getElementById('overlay-description');
  
  if (desc && desc.length > 0) {
    descriptionElement.textContent = desc; // Imposta descrizione se presente
  } else {
    // Nascondi completamente la sezione descrizione se non c'è contenuto
    descriptionElement.style.display = 'none'; // Nasconde descrizione se vuota
    // Oppure mostra un messaggio più informativo
    // descriptionElement.textContent = `${characterDetails.name} è un personaggio dell'universo Marvel.`;
  }

  // Comics, Series, Stories, Events
  populateAccordionSection('overlay-comics', characterDetails.comics, 'Comics'); // Popola sezione fumetti
  populateAccordionSection('overlay-series', characterDetails.series, 'Series'); // Popola sezione serie
  populateAccordionSection('overlay-stories', characterDetails.stories, 'Stories'); // Popola sezione storie
  populateAccordionSection('overlay-events', characterDetails.events, 'Events'); // Popola sezione eventi
}

// --------------------------------------------------------
// Helper per le sezioni dell'accordion (Comics, Series,...)
// --------------------------------------------------------
function populateAccordionSection(sectionId, items, sectionName) {
  const section = document.getElementById(sectionId);
  section.innerHTML = ''; // Pulisce sezione accordion

  if (!items || items.length === 0) {
    let message;
    switch (sectionName) {
      case 'Comics':  message = 'Nessun fumetto associato.';    break; // Messaggio comics vuoti
      case 'Series':  message = 'Nessuna serie associata.';      break; // Messaggio serie vuote
      case 'Stories': message = 'Nessuna storia associata.';     break; // Messaggio storie vuote
      case 'Events':  message = 'Nessun evento associato.';      break; // Messaggio eventi vuoti
      default:        message = 'Nessun dato disponibile.';       break; // Messaggio default
    }
    section.innerHTML = `<p>${message}</p>`; // Mostra messaggio vuoto
    return;
  }

  items.forEach((item, index) => {
    const uniqueId = `${sectionId}-${index}`; // Crea ID unico per accordion

    let thumbnailSrc = 'placeholder-image.jpeg'; // Immagine default
    let showImage = true; // Flag per mostrare immagine
    
    if (item.thumbnail && item.thumbnail.path && item.thumbnail.extension) {
      thumbnailSrc = `${item.thumbnail.path}.${item.thumbnail.extension}`; // Imposta thumbnail se disponibile
    } else if (sectionName === 'Stories') {
      // Per le stories, nascondi completamente l'immagine
      showImage = false; // Nasconde immagine per storie
    }

    const imageHtml = showImage ? `
      <img 
        src="${thumbnailSrc}"
        alt="${item.name}"
        class="img-thumbnail accordion-image"
      />
    ` : ''; // HTML immagine condizionale

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
            <div class="accordion-content ${showImage ? 'd-flex align-items-start' : ''}">
              ${imageHtml}
              <div class="accordion-text ${showImage ? '' : 'w-100'}">
                <p>${item.description || 'Nessuna descrizione disponibile.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `; // HTML completo elemento accordion
    section.appendChild(listItem); // Aggiunge elemento alla sezione
  });
}
