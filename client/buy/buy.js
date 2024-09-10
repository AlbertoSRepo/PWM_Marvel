  // Funzione per mostrare il messaggio di acquisto crediti o pacchetto
  function showOverlayMessage(message) {
    const overlay = document.getElementById('overlay-message');
    overlay.textContent = message;
    overlay.style.display = 'block';
    
    // Nasconde il messaggio dopo 3 secondi
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 3000);
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
            showOverlayMessage(`Hai acquistato ${creditAmount} crediti.`);
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
        if (result.newCards) {
            // Mostra gli identificativi delle carte ricevute
            const cardIds = result.newCards.join(', ');
            showOverlayMessage(`Hai ricevuto le seguenti carte: ${cardIds}`);
        } else {
            alert('Errore durante l\'acquisto del pacchetto.');
        }
    })
    .catch(error => {
        console.error('Errore durante l\'acquisto del pacchetto:', error);
        alert('Errore durante la richiesta.');
    });
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