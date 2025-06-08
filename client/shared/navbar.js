// Funzione per inserire la navbar
export const loadNavbar = (activePage) => {
    console.log('Loading navbar for page:', activePage); // Debug log

    // Definisci le classi dei bottoni (ora tutti uguali, il colore sarà gestito dal CSS)
    const albumClass = 'btn me-2';
    const buyClass = 'btn me-2';
    const tradeClass = 'btn me-2';
    const userClass = 'btn me-2';

    const navbarHTML = `
        <nav class="navbar navbar-expand-lg">
            <div class="container-fluid">
                <a class="navbar-brand" onclick="window.location.href = '../home/home.html';">
                    <img src="./logo.svg" alt="PWM Marvel" height="100" class="d-inline-block align-text-top">
                </a>
                <div class="d-flex ms-auto">
                    <button class="${albumClass}" type="button" onclick="window.location.href = '../album/album.html';">Album</button>
                    <button class="${buyClass}" type="button" onclick="window.location.href = '../buy/buy.html';">Buy</button>
                    <button class="${tradeClass}" type="button" onclick="window.location.href = '../trade/trade.html';">Trade</button>
                    <button class="${userClass}" type="button" onclick="window.location.href = '../user/user.html';">User</button>
                    <!-- Aggiungi qui il campo non cliccabile per mostrare i crediti -->
                    <span id="user-credits" class="navbar-text ms-3">Crediti: <span id="credit-count">0</span></span>
                </div>
            </div>
        </nav>
    `;

    // Seleziona un elemento HTML dove vuoi inserire la navbar
    const navbarElement = document.getElementById('navbar');
    if (!navbarElement) {
        console.error('Navbar element not found!');
        return;
    }
    
    navbarElement.innerHTML = navbarHTML;
    console.log('Navbar HTML set successfully'); // Debug log
    
    sendRegisterRequest();
}

// Funzione per aggiornare il campo HTML che mostra i crediti nella navbar
const updateCredits = (credits) => {
    const creditsElement = document.getElementById('user-credits');
    if (creditsElement) {
        creditsElement.textContent = `Crediti: ${credits}`; // Aggiorna il testo con i crediti
    }
    
    // Aggiorna anche il count specifico se esiste
    const creditCount = document.getElementById('credit-count');
    if (creditCount) {
        creditCount.textContent = credits;
    }
}

// registrazione utente
const sendRegisterRequest = async() => {
    try {
  
      const response = await fetch(`http://localhost:3000/api/users/credits`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      });

      response.json().then(data => {
        updateCredits(data.credits);
      });
  
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
}

// Assicurati che questa funzione sia esportata se necessario
export { updateCredits };