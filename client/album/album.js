
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

    document.getElementById('sell-card-btn').addEventListener('click', () => {
        const cardId = document.getElementById('overlay-title').getAttribute('data-card-id'); // Recupera l'ID della carta
        let currentPage = parseInt(document.getElementById('albumPage').value);
        if (cardId) {
            const confirmed = confirm('Sei sicuro di voler vendere questa carta?');
            if (confirmed) {
                sellCard(cardId, currentPage); // Chiamata alla funzione di vendita della carta
            }
        }
    });
});


// Funzione per creare la card in base ai dettagli ricevuti usando il template
function createCardHTML(card) {
    const template = document.getElementById('card-template').content.cloneNode(true);

    template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
    template.querySelector('.card-id').textContent = `ID: ${card.id}`;
    template.querySelector('.card-quantity').textContent = card.quantity ? `${card.quantity}` : '';

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

    cardsData.slice(0, 6).forEach(card => row1.appendChild(createCardHTML(card)));
    cardsData.slice(6, 12).forEach(card => row2.appendChild(createCardHTML(card)));
    cardsData.slice(12, 18).forEach(card => row3.appendChild(createCardHTML(card)));
}

// Funzione per aggiornare le carte nella pagina
function updateNameCards(cardsData) {
    if (!cardsData || cardsData.length === 0) {
        alert('Nessuna carta trovata per la pagina selezionata.');
        return;
    }

    const row1 = document.querySelector('#row-1');
    const row2 = document.querySelector('#row-2');
    const row3 = document.querySelector('#row-3');

    // Svuota le righe
    row1.innerHTML = '';
    row2.innerHTML = '';
    row3.innerHTML = '';

    const totalCards = cardsData.length;
    const perRow = Math.ceil(totalCards / 3);

    // Dividi le carte in tre parti
    const firstSlice = cardsData.slice(0, perRow);
    const secondSlice = cardsData.slice(perRow, perRow * 2);
    const thirdSlice = cardsData.slice(perRow * 2);

    // Aggiungi le carte alle rispettive righe
    firstSlice.forEach(card => row1.appendChild(createCardHTML(card)));
    secondSlice.forEach(card => row2.appendChild(createCardHTML(card)));
    thirdSlice.forEach(card => row3.appendChild(createCardHTML(card)));
}

// Funzione per aggiornare il campo HTML che mostra i crediti nella navbar
function updateCredits(credits) {
    const creditsElement = document.getElementById('user-credits');
    if (creditsElement) {
        creditsElement.textContent = `Crediti: ${credits}`; // Aggiorna il testo con i crediti
    }
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

        // Aggiorna le carte visualizzate nella pagina
        updateCards(data.cards);

        // Aggiorna i crediti nella navbar
        updateCredits(data.credits); // Aggiungi questa riga per aggiornare i crediti

    } catch (error) {
        console.error('Errore durante il caricamento delle carte:', error);
        alert('Si è verificato un errore durante il caricamento delle carte.');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per aggiornare lo stato dei pulsanti di paginazione
function updatePaginationButtons(currentPage) {
    document.getElementById('search-input').value = '';
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
        updateNameCards(data);
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

// Funzione per mostrare l'overlay e caricare i dettagli della carta
async function showOverlay(characterId) {
    // Mostra l'overlay subito
    document.getElementById('overlay-background').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Mostra il caricamento e nascondi i dettagli
    document.getElementById('loading-spinner-overlay').style.display = 'block';
    document.getElementById('detailsAccordion').style.display = 'none';

    // Mostra placeholder mentre carica i dettagli
    document.getElementById('overlay-title').textContent = 'Caricamento...';
    document.getElementById('overlay-img').src = 'placeholder-image.jpeg';
    document.getElementById('sell-card-btn').style.display = 'none';
    const descriptionElement = document.getElementById('overlay-description');
    descriptionElement.textContent = '';

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
    console.log('Dettagli del personaggio:', characterDetails);

    // Nascondi il caricamento e mostra i dettagli
    document.getElementById('loading-spinner-overlay').style.display = 'none';
    document.getElementById('detailsAccordion').style.display = 'block';

    // Aggiorna l'overlay con i dettagli del personaggio
    document.getElementById('overlay-title').textContent = characterDetails.name;
    document.getElementById('overlay-title').setAttribute('data-card-id', characterDetails.id); // Imposta l'ID della carta
    document.getElementById('overlay-img').src = `${characterDetails.thumbnail.path}.${characterDetails.thumbnail.extension}`;

    // Imposta la descrizione del personaggio
    if (characterDetails.description && characterDetails.description.trim() !== '') {
        descriptionElement.textContent = characterDetails.description;
    } else {
        descriptionElement.textContent = 'Nessuna descrizione disponibile.';
    }

    document.getElementById('sell-card-btn').style.display = 'block';


    // Popola le sezioni relative a comics, series, stories, events
    populateAccordionSection('overlay-comics', characterDetails.comics, 'Comics');
    populateAccordionSection('overlay-series', characterDetails.series, 'Series');
    populateAccordionSection('overlay-stories', characterDetails.stories, 'Stories');
    populateAccordionSection('overlay-events', characterDetails.events, 'Events');
}

function populateAccordionSection(sectionId, items, sectionName) {
    const section = document.getElementById(sectionId);
    section.innerHTML = '';  // Resetta il contenuto precedente

    if (!items || items.length === 0) {
        // Gestione del caso in cui non ci sono elementi...
        let message;
        switch (sectionName) {
            case 'Comics':
                message = 'Nessun fumetto associato';
                break;
            case 'Series':
                message = 'Nessuna serie associata';
                break;
            case 'Stories':
                message = 'Nessuna storia associata';
                break;
            case 'Events':
                message = 'Nessun evento associato';
                break;
            default:
                message = `Nessun ${sectionName.toLowerCase()} disponibile.`;
        }
        section.innerHTML = `<p>${message}</p>`;
    } else {
        items.forEach((item, index) => {
            // Genera un ID univoco per ogni elemento dell'accordion
            const uniqueId = `${sectionId}-${index}`;

            // Controlla se la thumbnail è disponibile
            let thumbnailSrc;
            if (item.thumbnail && item.thumbnail.path && item.thumbnail.extension) {
                thumbnailSrc = `${item.thumbnail.path}.${item.thumbnail.extension}`;
            } else {
                // Percorso dell'immagine alternativa
                thumbnailSrc = 'placeholder-image.jpeg'; // Sostituisci con il percorso dell'immagine alternativa
            }

            // Crea l'elemento dell'accordion
            const listItem = document.createElement('div');
            listItem.innerHTML = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${uniqueId}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${uniqueId}" aria-expanded="false" aria-controls="collapse-${uniqueId}">
                            <strong>${item.name}</strong>
                        </button>
                    </h2>
                    <div id="collapse-${uniqueId}" class="accordion-collapse collapse" aria-labelledby="heading-${uniqueId}" data-bs-parent="#${sectionId}">
                        <div class="accordion-body">
                            <div class="accordion-content d-flex align-items-start">
                                <img src="${thumbnailSrc}" alt="${item.name}" class="img-thumbnail accordion-image">
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

// Funzione per inviare la richiesta di vendita della carta
async function sellCard(cardId, currentPage) {
    try {
        const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

        if (!jwtToken) {
            console.error('Token JWT mancante');
            alert('Devi autenticarti per vendere una carta.');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/album/sell/${cardId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Errore durante la vendita della carta.');
        }

        const result = await response.json();
        alert(`Carta venduta con successo!`);

        // Aggiorna l'interfaccia dopo la vendita della carta
        hideOverlay();
        fetchCards(currentPage); // Ricarica la prima pagina del tuo album per aggiornare la visualizzazione
    } catch (error) {
        console.error('Errore durante la vendita della carta:', error);
        alert('Errore durante la vendita della carta.');
    }
}