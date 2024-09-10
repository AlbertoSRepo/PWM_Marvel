// Funzione per popolare i campi con i dati dell'utente

function populateUserInfo(userData) {
    document.getElementById('username').value = userData.username || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('favorite_superhero').value = userData.favorite_superhero || '';
    document.getElementById('password').value = userData.password || '';
}

// Al caricamento della pagina, fai una richiesta al server per ottenere i dati dell'utente
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/api/users/info', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtTokenPWMMarvel')}`, // Inserisce il token JWT
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Popola i campi con le informazioni dell'utente ricevute dal server
        console.log("User data :" + JSON.stringify(data));
        populateUserInfo(data);
    })
    .catch(error => {
        console.error('Errore durante la richiesta delle informazioni utente:', error);
        alert('Si è verificato un errore nel recupero delle informazioni utente.');
    });
});

// Seleziona i campi e i pulsanti
const editBtn = document.getElementById('editBtn');
const submitBtn = document.getElementById('submitBtn');
const inputs = document.querySelectorAll('.form-control');

// Funzione per abilitare/disabilitare la modifica dei campi
editBtn.addEventListener('click', function() {
    inputs.forEach(input => {
        input.disabled = !input.disabled; // Abilita/disabilita i campi
    });
    submitBtn.style.display = inputs[0].disabled ? 'none' : 'block'; // Mostra il bottone "Invia" se i campi sono abilitati
});

// Aggiungi la logica per inviare i dati modificati al server
submitBtn.addEventListener('click', function() {
    const updatedUserData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        favorite_superhero: document.getElementById('favorite_superhero').value,
        password: document.getElementById('password').value,
    };

    // Invia i dati al server (aggiorna l'endpoint con il corretto indirizzo del tuo server)
    fetch('http://localhost:3000/api/users/update', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtTokenPWMMarvel')}`, // Inserisce il token JWT
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUserData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Dati utente aggiornati con successo!');
        window.location.reload(); // Ricarica la pagina dopo l'aggiornamento
    })
    .catch(error => {
        console.error('Errore durante l\'aggiornamento:', error);
    });
});
