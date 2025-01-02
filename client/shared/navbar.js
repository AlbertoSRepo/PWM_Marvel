// Funzione per inserire la navbar
export const loadNavbar = (activePage) => {

    // Definisci le  classi dei bottoni, modificando la classe del bottone attivo
    const albumClass = activePage === 'album' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';
    const buyClass = activePage === 'buy' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';
    const tradeClass = activePage === 'trade' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';
    const userClass = activePage === 'user' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';

    const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" onclick="window.location.href = '../home/home.html';">PWM Marvel</a>
                <div class="d-flex ms-auto">
                    <button class="${albumClass}" type="button" onclick="window.location.href = '../album/album.html';">Album</button>
                    <button class="${buyClass}" type="button" onclick="window.location.href = '../buy/buy.html';">Buy</button>
                    <button class="${tradeClass}" type="button" onclick="window.location.href = '../trade/trade.html';">Trade</button>
                    <button class="${userClass}" type="button" onclick="window.location.href = '../user/user.html';">User</button>
                    <!-- Aggiungi qui il campo non cliccabile per mostrare i crediti -->
                    <span id="user-credits" class="navbar-text ms-3">Crediti: <span id="credit-count">0</span>
                </div>
            </div>
        </nav>
    `;

    // Seleziona un elemento HTML dove vuoi inserire la navbar
    document.getElementById('navbar').innerHTML = navbarHTML;
    sendRegisterRequest();
}

// Funzione per aggiornare il campo HTML che mostra i crediti nella navbar
const updateCredits = (credits) => {
    const creditsElement = document.getElementById('user-credits');
    if (creditsElement) {
        creditsElement.textContent = `Crediti: ${credits}`; // Aggiorna il testo con i crediti
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