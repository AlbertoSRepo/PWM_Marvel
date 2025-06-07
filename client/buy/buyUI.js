// buyUI.js

// Overlay con messaggio di acquisto generico
export function showOverlayMessage(message, credits) {
  const overlayBackground = document.getElementById('overlay-background');
  const overlayMessage = document.getElementById('overlay-message');

  overlayMessage.innerHTML = `<h2>Complimenti!</h2><p>${message}</p>`;
  overlayBackground.style.display = 'block';

  setTimeout(() => {
    overlayBackground.style.display = 'none';
  }, 3000);

  updateCredits(credits);
}

// Mostra le carte in overlay dopo aver comprato un pacchetto
export function showPacketCardsOverlay(cards, credits) {
  const overlayBackground = document.getElementById('overlay-background');
  const overlayMessage = document.getElementById('overlay-message');

  overlayMessage.innerHTML = '<h2>Complimenti! Hai ricevuto le seguenti carte:</h2>';

  const cardContainer = document.createElement('div');
  cardContainer.classList.add('row', 'card-container');

  cards.forEach(card => {
    const cardElement = createCardHTML(card);
    cardContainer.appendChild(cardElement);
  });
  overlayMessage.appendChild(cardContainer);

  overlayBackground.style.display = 'block';

  setTimeout(() => {
    overlayBackground.style.display = 'none';
  }, 5000);

  updateCredits(credits);
}

// Aggiorna i crediti nella navbar
function updateCredits(credits) {
  const creditsElement = document.getElementById('user-credits');
  if (creditsElement) {
    creditsElement.textContent = `Crediti: ${credits}`;
  }
}

// Aggiorna lo stato del bottone "Compra Pacchetto"
export function updateBuyPacketButton(credits) {
  const buyPacketBtn = document.getElementById('buyPacketBtn');
  const warningMessage = document.getElementById('credits-warning');
  
  if (credits <= 0) {
    // Disabilita il bottone e mostra il messaggio di warning
    buyPacketBtn.disabled = true;
    buyPacketBtn.classList.remove('btn-success');
    buyPacketBtn.classList.add('btn-secondary');
    
    if (warningMessage) {
      warningMessage.style.display = 'block';
    }
  } else {
    // Abilita il bottone e nascondi il messaggio di warning
    buyPacketBtn.disabled = false;
    buyPacketBtn.classList.remove('btn-secondary');
    buyPacketBtn.classList.add('btn-success');
    
    if (warningMessage) {
      warningMessage.style.display = 'none';
    }
  }
}

// Crea un elemento card dal template (come in album/trade)
function createCardHTML(card) {
  // card = { id, name, thumbnail, ... }
  const template = document.getElementById('card-template').content.cloneNode(true);
  template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';

  const imgTop = template.querySelector('.card-img-top');
  if (card.thumbnail) {
    imgTop.src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
  } else {
    imgTop.src = 'placeholder-image.jpg';
  }

  return template;
}
