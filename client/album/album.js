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
    populateAccordionSection('overlay-events', characterDetails, 'Events');
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

// Funzione per nascondere l'overlay e ripristinare la trasparenza
function hideOverlay() {
    document.getElementById('overlay-background').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.querySelector('.card-container').classList.remove('transparent');
}


// Funzione per creare la card in base ai dettagli ricevuti
createCard = (card) => {
    if (card.state === 'posseduta') {
        // Carta posseduta con dettagli completi, ID e quantità
        return `
            <div class="col-lg-2 col-md-4 col-12 marvel-card posseduta" onclick="showOverlay('${card.id}')">
                <div class="card">
                    <img src="${card.thumbnail.path}.${card.thumbnail.extension}" class="card-img-top" alt="${card.name}">
                    <div class="card-body">
                        <h5 class="card-title">${card.name}</h5>
                        <p class="card-id">ID: ${card.id}</p> <!-- Mostra l'ID della carta -->
                        <p class="card-quantity">Quantità: ${card.quantity}</p> <!-- Mostra la quantità solo per le carte possedute -->
                    </div>
                </div>
            </div>
        `;
    } else {
        // Carta non posseduta con un segnaposto e senza quantità
        return `
            <div class="col-lg-2 col-md-4 col-12 marvel-card non-posseduta">
                <div class="card">
                    <img src="placeholder-image.jpg" class="card-img-top" alt="Carta non posseduta">
                    <div class="card-body">
                        <h5 class="card-title">Carta sconosciuta</h5>
                        <p class="card-id">ID: ${card.id}</p> <!-- Mostra l'ID della carta -->
                        <div class="overlay-non-posseduta">Non posseduta</div>
                    </div>
                </div>
            </div>
        `;
    }
}




// Funzione per aggiornare le carte nella pagina
updateCards = (cardsData) => {
    if (!cardsData || cardsData.length === 0) {
        console.warn('Nessuna carta trovata per la pagina selezionata');
        alert('Nessuna carta trovata per la pagina selezionata.');
        return;
    }

    const row1 = document.querySelector('#row-1');
    const row2 = document.querySelector('#row-2');
    const row3 = document.querySelector('#row-3');

    let cardsHTML1 = '', cardsHTML2 = '', cardsHTML3 = '';

    // Suddividi le carte in 3 righe
    for (let i = 0; i < 5 && i < cardsData.length; i++) cardsHTML1 += createCard(cardsData[i]);
    for (let i = 5; i < 10 && i < cardsData.length; i++) cardsHTML2 += createCard(cardsData[i]);
    for (let i = 10; i < 15 && i < cardsData.length; i++) cardsHTML3 += createCard(cardsData[i]);

    row1.innerHTML = cardsHTML1;
    row2.innerHTML = cardsHTML2;
    row3.innerHTML = cardsHTML3;
}

// Funzione per ottenere le carte dal server
fetchCards = (pageNumber) => {
    showLoadingSpinner();

    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        console.error('Token JWT mancante');
        alert('Token JWT non trovato. Devi autenticarti.');
        hideLoadingSpinner();
        return;
    }

    fetch(`http://localhost:3000/api/album/cards?page_number=${pageNumber}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateCards(data);
            hideLoadingSpinner();
        })
        .catch(error => {
            console.error('Errore durante il caricamento delle carte:', error);
            alert('Si è verificato un errore durante il caricamento delle carte.');
            hideLoadingSpinner();
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Imposta il numero della pagina iniziale a 1 nella barra di ricerca
    document.getElementById('albumPage').value = 1;
    updatePaginationButtons(1); // Aggiorna lo stato dei pulsanti alla pagina iniziale

    // Carica la pagina 1 all'avvio
    fetchCards(1);

    // Gestione dell'invio del form per cambiare pagina
    document.getElementById('albumForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const pageNumber = parseInt(document.getElementById('albumPage').value);
        fetchCards(pageNumber);
        updatePaginationButtons(pageNumber); // Aggiorna i pulsanti
    });

    // Gestione del pulsante "Pagina Precedente"
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        let currentPage = parseInt(document.getElementById('albumPage').value);
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('albumPage').value = currentPage;
            fetchCards(currentPage);
            updatePaginationButtons(currentPage); // Aggiorna i pulsanti
        }
    });

    // Gestione del pulsante "Pagina Successiva"
    document.getElementById('nextPageBtn').addEventListener('click', () => {
        let currentPage = parseInt(document.getElementById('albumPage').value);
        if (currentPage < 105) { // Assumendo che 105 sia il numero massimo di pagine
            currentPage++;
            document.getElementById('albumPage').value = currentPage;
            fetchCards(currentPage);
            updatePaginationButtons(currentPage); // Aggiorna i pulsanti
        }
    });
});

// Funzione per aggiornare lo stato dei pulsanti di paginazione
function updatePaginationButtons(currentPage) {
    const prevButton = document.getElementById('prevPageBtn');
    const nextButton = document.getElementById('nextPageBtn');

    // Disabilita il pulsante "Pagina Precedente" se siamo alla prima pagina
    if (currentPage <= 1) {
        prevButton.disabled = true;
    } else {
        prevButton.disabled = false;
    }

    // Disabilita il pulsante "Pagina Successiva" se siamo all'ultima pagina
    if (currentPage >= 105) { // Assumendo che 105 sia il numero massimo di pagine
        nextButton.disabled = true;
    } else {
        nextButton.disabled = false;
    }
}
// Funzione per cercare figurine possedute per nome del supereroe
function searchCardsByName(name) {
    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        console.error('Token JWT mancante');
        alert('Token JWT non trovato. Devi autenticarti.');
        return;
    }

    // Mostra lo spinner quando inizia la ricerca
    showLoadingSpinner();

    fetch(`http://localhost:3000/api/album/search?name_starts_with=${name}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Errore nella richiesta al server. Status code: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Nascondi lo spinner e mostra i risultati della ricerca
            updateCards(data);
            hideLoadingSpinner();
        })
        .catch(error => {
            console.error('Errore durante la ricerca delle carte:', error);
            alert('Si è verificato un errore durante la ricerca delle carte.');
            hideLoadingSpinner(); // Nascondi lo spinner anche in caso di errore
        });
}


// Event listener per il pulsante di ricerca
document.getElementById('search-button').addEventListener('click', () => {
    const searchQuery = document.getElementById('search-input').value.trim();
    if (searchQuery) {
        searchCardsByName(searchQuery);
    }
});