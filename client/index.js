// Aspetta che il DOM sia completamente caricato prima di eseguire il codice
document.addEventListener('DOMContentLoaded', function() {
    // Trova il form di login nel DOM
    const loginForm = document.getElementById('loginForm');
    
    // Verifica se il form esiste
    if (loginForm) {
        // Aggiungi un event listener per l'evento 'submit' del form
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impedisce il comportamento di default del form

            // Ottieni i dati inseriti nel form
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Costruisci il payload da inviare al server
            const data = {
                email: email,
                password: password
            };

            // Invia la richiesta al server usando fetch
            fetch('http://localhost:3000/api/users/login', { // Sostituisci con il tuo endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Specifica che stai inviando dati in formato JSON
                },
                body: JSON.stringify(data) // Trasforma l'oggetto `data` in una stringa JSON
            })
            .then(response => response.json()) // Converti la risposta in formato JSON
            .then(result => {
                // Se il server restituisce un token JWT
                if (result.token) {
                    // Salva il token JWT nel localStorage
                    localStorage.setItem('jwtTokenPWMMarvel', result.token);

                    // Mostra un messaggio di successo (opzionale)
                    alert('Login avvenuto con successo!');

                    // Redirigi l'utente alla pagina di registrazione o un'altra pagina
                    window.location.href = 'user.html'; // Sostituisci con l'URL della tua pagina
                } else {
                    // Se il login fallisce, mostra un messaggio di errore
                    alert('Login fallito: ' + (result.message || 'Credenziali non valide'));
                }
            })
            .catch(error => {
                // Se c'è un errore nella comunicazione con il server, mostra un messaggio di errore
                console.error('Errore durante il login:', error);
                alert('Si è verificato un errore. Per favore riprova.');
            });
        });
    } else {
        // Se il form non viene trovato, stampa un errore nella console
        console.error("Il form di login non è stato trovato.");
    }
});
