document.addEventListener('DOMContentLoaded', function() {
    // Funzione per gestire il form di login (esiste già)
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const data = { email, password };

            fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.token) {
                    localStorage.setItem('jwtTokenPWMMarvel', result.token);
                    alert('Login avvenuto con successo!');
                    window.location.href = '../album/album.html';
                } else {
                    alert('Login fallito: ' + (result.message || 'Credenziali non valide'));
                }
            })
            .catch(error => {
                console.error('Errore durante il login:', error);
                alert('Si è verificato un errore. Per favore riprova.');
            });
        });
    }

    // Funzione per gestire il form di registrazione
    const registerForm = document.querySelector('#registerModal form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const username = document.getElementById('name').value;
            const password = document.getElementById('password').value;
            const confirmedPassword = document.getElementById('confirmedPassword').value;
            const favorite_superhero = document.getElementById('superhero').value;

            // Controlla che le password corrispondano
            if (password !== confirmedPassword) {
                alert('Le password non corrispondono.');
                return;
            }

            const data = {
                email,
                username,
                password,
                favorite_superhero
            };

            fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.token) {
                    // Salva il token JWT nel localStorage
                    localStorage.setItem('jwtTokenPWMMarvel', result.token);

                    // Mostra un messaggio di successo
                    alert('Registrazione avvenuta con successo!');

                    // Redirigi l'utente alla pagina dell'album
                    window.location.href = '../album/album.html';
                } else {
                    alert('Registrazione fallita: ' + (result.message || 'Errore sconosciuto'));
                }
            })
            .catch(error => {
                console.error('Errore durante la registrazione:', error);
                alert('Si è verificato un errore. Per favore riprova.');
            });
        });
    }
});
