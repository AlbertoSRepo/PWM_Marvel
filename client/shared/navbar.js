import { updateNavbarCredits } from "./uiHelpers.js";

// Funzione per inserire la navbar
export const loadNavbar = (activePage) => {
    console.log('Loading navbar for page:', activePage); // Debug log

    // Definisci le classi dei bottoni in base alla pagina attiva
    const albumClass = activePage === 'album' ? 'btn me-2 active' : 'btn me-2';
    const buyClass = activePage === 'buy' ? 'btn me-2 active' : 'btn me-2';
    const tradeClass = activePage === 'trade' ? 'btn me-2 active' : 'btn me-2';
    const userClass = activePage === 'user' ? 'btn me-2 active' : 'btn me-2';

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
    console.log('Navbar HTML set successfully for page:', activePage); // Debug log aggiornato
    
    sendRegisterRequest();
}

// registrazione utente
const sendRegisterRequest = async() => {
    try {
  
      const response = await fetch(`http://localhost:3000/api/users/credits`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      });

      response.json().then(data => {
        updateNavbarCredits(data.credits);
      });
  
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
}
