// Funzione per inserire la navbar
export const loadNavbar = (activePage) => {
    console.log('Loading navbar for page:', activePage);

    // Definisci le classi dei bottoni, modificando la classe del bottone attivo
    const albumClass = activePage === 'album' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';
    const buyClass = activePage === 'buy' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';
    const tradeClass = activePage === 'trade' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';
    const userClass = activePage === 'user' ? 'btn btn-primary me-2' : 'btn btn-secondary me-2';

    const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" onclick="window.location.href = '../home/home.html';">
                    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
                        <!-- Sfondo rosso Marvel -->
                        <rect width="200" height="80" fill="#dc2626" rx="5"/>
                        
                        <!-- Testo PWM -->
                        <text x="100" y="35" font-family="Arial Black, sans-serif" font-size="28" font-weight="900" fill="white" text-anchor="middle">PWM</text>
                        
                        <!-- Testo MARVEL -->
                        <rect x="30" y="45" width="140" height="25" fill="white" rx="3"/>
                        <text x="100" y="62" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="3">MARVEL</text>
                    </svg>
                </a>
                <div class="d-flex ms-auto">
                    <button class="${albumClass}" type="button" onclick="window.location.href = '../album/album.html';">Album</button>
                    <button class="${buyClass}" type="button" onclick="window.location.href = '../buy/buy.html';">Buy</button>
                    <button class="${tradeClass}" type="button" onclick="window.location.href = '../trade/trade.html';">Trade</button>
                    <button class="${userClass}" type="button" onclick="window.location.href = '../user/user.html';">User</button>
                    <!-- Campo non cliccabile per mostrare i crediti -->
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
    console.log('Navbar HTML set successfully');
    
    sendRegisterRequest();
}

// Funzione per aggiornare il campo HTML che mostra i crediti nella navbar
const updateCredits = (credits) => {
    const creditsElement = document.getElementById('user-credits');
    if (creditsElement) {
        creditsElement.textContent = `Crediti: ${credits}`;
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