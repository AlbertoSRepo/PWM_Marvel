// Function to show the loading spinner
function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Function to create a card HTML based on the data received from the API
createCard = (card) => {
    return `
        <div class="col-lg-2 col-md-4 col-12 marvel-card">
            <div class="card">
                <img src="${card.thumbnail.path}.${card.thumbnail.extension}" class="card-img-top" alt="${card.name}">
                <div class="card-body">
                    <h5 class="card-title">${card.name}</h5>
                    <a href="${card.urls[0].url}" target="_blank" class="btn btn-primary">Dettagli</a>
                </div>
            </div>
        </div>
    `;
}

// Function to update cards on the page
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

    for (let i = 0; i < 5 && i < cardsData.length; i++) cardsHTML1 += createCard(cardsData[i]);
    for (let i = 5; i < 10 && i < cardsData.length; i++) cardsHTML2 += createCard(cardsData[i]);
    for (let i = 10; i < 15 && i < cardsData.length; i++) cardsHTML3 += createCard(cardsData[i]);

    row1.innerHTML = cardsHTML1;
    row2.innerHTML = cardsHTML2;
    row3.innerHTML = cardsHTML3;
}

// Function to fetch cards from the server
fetchCards = (pageNumber) => {
    showLoadingSpinner(); // Show the spinner

    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        console.error('Token JWT mancante');
        alert('Token JWT non trovato. Devi autenticarti.');
        hideLoadingSpinner(); // Hide spinner on error
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
        hideLoadingSpinner(); // Hide the spinner after loading cards
    })
    .catch(error => {
        console.error('Errore durante il caricamento delle carte:', error);
        alert('Si è verificato un errore durante il caricamento delle carte.');
        hideLoadingSpinner(); // Hide spinner on error
    });
}

// Load the initial page (page 1)
document.addEventListener('DOMContentLoaded', () => {
    fetchCards(1);

    document.getElementById('albumForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const pageNumber = document.getElementById('albumPage').value;
        fetchCards(pageNumber);
    });
});
