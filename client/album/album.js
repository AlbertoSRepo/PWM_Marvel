
// Gestione del caricamento iniziale e della paginazione
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('albumPage').value = 1;
    updatePaginationButtons(1);

    fetchCards(1);

    document.getElementById('albumForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const pageNumber = parseInt(document.getElementById('albumPage').value);
        fetchCards(pageNumber);
        updatePaginationButtons(pageNumber);
    });

    document.getElementById('prevPageBtn').addEventListener('click', () => {
        let currentPage = parseInt(document.getElementById('albumPage').value);
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('albumPage').value = currentPage;
            fetchCards(currentPage);
            updatePaginationButtons(currentPage);
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        let currentPage = parseInt(document.getElementById('albumPage').value);
        if (currentPage < 105) {
            currentPage++;
            document.getElementById('albumPage').value = currentPage;
            fetchCards(currentPage);
            updatePaginationButtons(currentPage);
        }
    });
});

// Funzione per fare la richiesta al server e ottenere i dettagli del personaggio
async function fetchCharacterDetails(characterId) {
    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        console.error('Token JWT mancante');
        alert('Token JWT non trovato. Devi autenticarti.');
        return null;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/album/characters/${characterId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Errore durante il recupero dei dettagli del personaggio:', error);
        alert('Si è verificato un errore durante il caricamento dei dettagli del personaggio.');
        return null;
    }
}

// Funzione per creare la card in base ai dettagli ricevuti usando il template
function createCardHTML(card) {
    const template = document.getElementById('card-template').content.cloneNode(true);

    template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
    template.querySelector('.card-id').textContent = `ID: ${card.id}`;
    template.querySelector('.card-quantity').textContent = card.quantity ? `Quantità: ${card.quantity}` : '';

    if (card.thumbnail) {
        template.querySelector('.card-img-top').src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    } else {
        template.querySelector('.card-img-top').src = 'placeholder-image.jpg';
    }

    if (card.state === 'posseduta') {
        template.querySelector('.marvel-card').classList.add('posseduta');
        template.querySelector('.marvel-card').onclick = () => showOverlay(card.id);
    } else {
        template.querySelector('.marvel-card').classList.add('non-posseduta');
    }

    return template;
}

// Funzione per aggiornare le carte nella pagina
function updateCards(cardsData) {
    if (!cardsData || cardsData.length === 0) {
        alert('Nessuna carta trovata per la pagina selezionata.');
        return;
    }

    const row1 = document.querySelector('#row-1');
    const row2 = document.querySelector('#row-2');
    const row3 = document.querySelector('#row-3');

    row1.innerHTML = '';
    row2.innerHTML = '';
    row3.innerHTML = '';

    cardsData.slice(0, 5).forEach(card => row1.appendChild(createCardHTML(card)));
    cardsData.slice(5, 10).forEach(card => row2.appendChild(createCardHTML(card)));
    cardsData.slice(10, 15).forEach(card => row3.appendChild(createCardHTML(card)));
}

// Funzione per ottenere le carte dal server
async function fetchCards(pageNumber) {
    try {
        showLoadingSpinner();
        const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');
        if (!jwtToken) throw new Error('Token JWT mancante');

        const response = await fetch(`http://localhost:3000/api/album/cards?page_number=${pageNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
        const data = await response.json();
        updateCards(data);
    } catch (error) {
        console.error('Errore durante il caricamento delle carte:', error);
        alert('Si è verificato un errore durante il caricamento delle carte.');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per aggiornare lo stato dei pulsanti di paginazione
function updatePaginationButtons(currentPage) {
    const prevButton = document.getElementById('prevPageBtn');
    const nextButton = document.getElementById('nextPageBtn');

    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= 105;
}


// Funzione per cercare figurine possedute per nome del supereroe
document.getElementById('search-button').addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.trim();
    if (searchQuery) {
        searchCardsByName(searchQuery);
    }
});

// Funzione per cercare carte per nome del supereroe
async function searchCardsByName(name) {
    try {
        showLoadingSpinner();
        const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');
        if (!jwtToken) throw new Error('Token JWT mancante');

        const response = await fetch(`http://localhost:3000/api/album/search?name_starts_with=${name}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
        const data = await response.json();
        updateCards(data);
    } catch (error) {
        console.error('Errore durante la ricerca delle carte:', error);
        alert('Si è verificato un errore durante la ricerca delle carte.');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per fare la richiesta al server e ottenere i dettagli del personaggio
async function fetchCharacterDetails(characterId) {
    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        console.error('Token JWT mancante');
        alert('Token JWT non trovato. Devi autenticarti.');
        return null;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/album/characters/${characterId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Errore durante il recupero dei dettagli del personaggio:', error);
        alert('Si è verificato un errore durante il caricamento dei dettagli del personaggio.');
        return null;
    }
}

// Funzione per mostrare l'overlay con uno spinner iniziale
async function showOverlay(characterId) {
    // Mostra l'overlay subito
    document.getElementById('overlay-background').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Mostra il caricamento e nascondi i dettagli
    document.getElementById('loading-spinner-overlay').style.display = 'block';
    document.getElementById('detailsAccordion').style.display = 'none';

    // Mostra placeholder mentre carica i dettagli
    document.getElementById('overlay-title').textContent = 'Caricamento...';
    document.getElementById('overlay-img').src = 'placeholder-image.jpg';

    // Azzera i dettagli nelle varie sezioni
    document.getElementById('overlay-comics').innerHTML = '';
    document.getElementById('overlay-series').innerHTML = '';
    document.getElementById('overlay-stories').innerHTML = '';
    document.getElementById('overlay-events').innerHTML = '';

    // Richiedi i dettagli del personaggio al server
    const characterDetails = await fetchCharacterDetails(characterId);

    if (!characterDetails) {
        hideOverlay(); // Nascondi l'overlay se non ci sono dettagli disponibili
        return;
    }

    // Nascondi il caricamento e mostra i dettagli
    document.getElementById('loading-spinner-overlay').style.display = 'none';
    document.getElementById('detailsAccordion').style.display = 'block';

    // Aggiorna l'overlay con i dettagli del personaggio
    document.getElementById('overlay-title').textContent = characterDetails.name;
    document.getElementById('overlay-img').src = `${characterDetails.thumbnail.path}.${characterDetails.thumbnail.extension}`;

    // Popola le sezioni relative a comics, series, stories, events
    populateAccordionSection('overlay-comics', characterDetails.comics, 'Comics');
    populateAccordionSection('overlay-series', characterDetails.series, 'Series');
    populateAccordionSection('overlay-stories', characterDetails.stories, 'Stories');
    populateAccordionSection('overlay-events', characterDetails.events, 'Events');
}

// Funzione per popolare ogni sezione della lista a tendina
function populateAccordionSection(sectionId, items, sectionName) {
    const section = document.getElementById(sectionId);
    section.innerHTML = '';  // Resetta il contenuto precedente

    if (!items || items.length === 0) {
        section.innerHTML = `<p>Nessun ${sectionName.toLowerCase()} disponibile.</p>`;
    } else {
        items.forEach(item => {
            const listItem = document.createElement('div');
            listItem.innerHTML = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${item.id}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${item.id}">
                            <strong>${item.title || item.name}</strong>
                        </button>
                    </h2>
                    <div id="collapse${item.id}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <img src="${item.thumbnail?.path}.${item.thumbnail?.extension}" alt="${item.title || item.name}" class="img-thumbnail" style="max-width: 100px;">
                            <p>${item.description || 'Nessuna descrizione disponibile.'}</p>
                            <a href="${item.resourceURI}" target="_blank">Dettagli</a>
                        </div>
                    </div>
                </div>
            `;
            section.appendChild(listItem);
        });
    }
}

// Funzione per nascondere l'overlay
function hideOverlay() {
    document.getElementById('overlay-background').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Funzione per mostrare il caricamento delle carte (spinner)
function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
    document.querySelector('.card-container').classList.add('d-none');
}

// Funzione per nascondere il caricamento delle carte (spinner)
function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
    document.querySelector('.card-container').classList.remove('d-none');
}