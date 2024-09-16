// Gestione del caricamento iniziale e della paginazione
document.addEventListener('DOMContentLoaded', () => {

});

// Funzione per mostrare il messaggio di acquisto crediti o pacchetto
function showOverlayMessage(message, credits) {
    const overlayBackground = document.getElementById('overlay-background');
    const overlayMessage = document.getElementById('overlay-message');

    // Imposta il contenuto del messaggio
    overlayMessage.innerHTML = `<h2>Complimenti!</h2><p>${message}</p>`;

    // Mostra l'overlay
    overlayBackground.style.display = 'block';

    // Nasconde l'overlay dopo 3 secondi
    setTimeout(() => {
        overlayBackground.style.display = 'none';
    }, 3000);

    // Aggiorna i crediti nella navbar
    updateCredits(credits);
}

// Funzione per aggiornare il campo HTML che mostra i crediti nella navbar
function updateCredits(credits) {
    const creditsElement = document.getElementById('user-credits');
    if (creditsElement) {
        creditsElement.textContent = `Crediti: ${credits}`; // Aggiorna il testo con i crediti
    }
}

// Funzione per gestire l'acquisto di crediti
function buyCredits(credits) {
    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        alert('Devi essere autenticato per acquistare crediti.');
        return;
    }

    const creditAmount = parseInt(credits, 10);

    fetch('http://localhost:3000/api/users/buy-credits', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: creditAmount })
    })
    .then(response => response.json())
    .then(result => {
        if (result.message) {
            // Mostra il messaggio di successo
            showOverlayMessage(`Hai acquistato ${creditAmount} crediti.`, result.credits);
        } else {
            alert('Errore durante l\'acquisto dei crediti.');
        }
    })
    .catch(error => {
        console.error('Errore durante l\'acquisto dei crediti:', error);
        alert('Errore durante la richiesta.');
    });
}

// Funzione per gestire l'acquisto del pacchetto di carte
function buyCardPacket() {
    const jwtToken = localStorage.getItem('jwtTokenPWMMarvel');

    if (!jwtToken) {
        alert('Devi essere autenticato per acquistare un pacchetto.');
        return;
    }

    fetch('http://localhost:3000/api/users/buy-packet', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        if (!result.success) {
            // Mostra un messaggio se non ci sono abbastanza crediti
            showOverlayMessage(result.message, result.credits);
        } else {
            // Mostra le carte ricevute se l'acquisto è andato a buon fine
            showCardsInOverlay(result.newCards, result.credits);
        }
    })
    .catch(error => {
        console.error('Errore durante l\'acquisto del pacchetto:', error);
        alert('Errore durante la richiesta.');
    });
}

// Funzione per mostrare le carte nell'overlay usando il template
function showCardsInOverlay(cards, credits) {
    const overlayBackground = document.getElementById('overlay-background');
    const overlayMessage = document.getElementById('overlay-message');

    // Svuota il contenuto precedente
    overlayMessage.innerHTML = `<h2>Complimenti! Hai ricevuto le seguenti carte:</h2>`;

    const cardContainer = document.createElement('div');
    cardContainer.classList.add('row', 'card-container');

    // Crea le carte usando il template
    cards.forEach(card => {
        const cardElement = createCardHTML(card);
        cardContainer.appendChild(cardElement);
    });

    // Aggiungi le carte nell'overlay
    overlayMessage.appendChild(cardContainer);

    // Mostra l'overlay
    overlayBackground.style.display = 'block';

    // Nascondi l'overlay dopo 5 secondi
    setTimeout(() => {
        overlayBackground.style.display = 'none';
    }, 5000);

    // Aggiorna i crediti nella navbar
    updateCredits(credits);
}

// Funzione per creare la card in base ai dettagli ricevuti usando il template
function createCardHTML(card) {
    console.log('carta :'  + card);
    const template = document.getElementById('card-template').content.cloneNode(true);

    template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
    template.querySelector('.card-img-top').src = `${card.thumbnail.path}.${card.thumbnail.extension}`;

    return template;
}

// Aggiungi event listener ai bottoni per i crediti
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', () => {
        const credits = button.getAttribute('data-credits');
        buyCredits(credits);
    });
});

// Aggiungi event listener al pulsante per l'acquisto del pacchetto
document.getElementById('buyPacketBtn').addEventListener('click', () => {
    buyCardPacket();
});