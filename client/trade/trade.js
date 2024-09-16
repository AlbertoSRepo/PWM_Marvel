import { postTradeProposal } from './route.js';
import { getCardsByName } from './route.js';
import { getUserCards } from './route.js';
import { deleteTrade } from './route.js';
import { deleteOffer } from './route.js';
import { putAcceptOffer } from './route.js';
import { getUserProposalWithOffers } from './route.js';
import { getOfferedCards } from './route.js';
import { postOffer } from './route.js';
// Variabile per tenere traccia delle carte selezionate
let selectedCards = [];

// Massimo numero di carte che si possono selezionare
const maxCards = 5;

// Variabile per tenere traccia della pagina corrente
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {

    // Aggiungi l'evento per aprire l'overlay al click sul bottone "Crea Nuova Proposta"
    document.getElementById('create-trade-btn').addEventListener('click', showOverlay);

    // Aggiungi l'evento per cercare le carte per nome
    document.getElementById('search-button').addEventListener('click', () => {
        const searchQuery = document.getElementById('search-input').value.trim();
        if (searchQuery) {
            searchCardsByName(searchQuery);
        }
    });

    // Eventi per la paginazione nell'overlay
    document.getElementById('prev-page-btn').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page-btn').addEventListener('click', () => changePage(1));

    // Assegna un listener al contenitore delle carte (event delegation)
    document.getElementById('card-selection').addEventListener('click', (event) => {
        const cardElement = event.target.closest('.card');

        if (!cardElement) return; // Ignora se non si clicca su una carta

        const cardId = cardElement.querySelector('.card-id').textContent.split(': ')[1];
        const cardName = cardElement.querySelector('.card-title').textContent;

        console.log('Carta selezionata:', cardName);

        toggleCardSelection({
            id: cardId,
            name: cardName,
            element: cardElement
        });
    });

    // Event delegation per i bottoni "Invia Offerta" nella tabella delle proposte
    document.getElementById('community-trades').addEventListener('click', (event) => {
        const offerButton = event.target.closest('.btn-primary');

        if (!offerButton) return; // Se non è il bottone "Invia Offerta", ignora

        const tradeId = offerButton.getAttribute('data-trade-id');
        console.log('Bottone "Invia Offerta" cliccato per il trade ID:', tradeId);
        if (tradeId) {
            showOfferOverlay(tradeId); // Apre l'overlay per inviare l'offerta con l'ID del trade
        }
    });

    // Event delegation per i bottoni "Elimina" nelle proposte personali
    document.getElementById('user-proposals').addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-danger');

        if (!deleteButton) return; // Se non è il bottone "Elimina", ignora

        const tradeId = deleteButton.getAttribute('data-trade-id');
        console.log('Bottone "Elimina" cliccato per il trade ID:', tradeId);
        if (tradeId) {
            deleteTrade(tradeId); // Chiama la funzione per cancellare la proposta
        }
    });

    // Event delegation per i bottoni "Elimina" nelle offerte dell'utente
    document.getElementById('user-offers').addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-danger');

        if (!deleteButton) return; // Se non è il bottone "Elimina", ignora

        const offerId = deleteButton.getAttribute('data-offer-id');
        console.log('Bottone "Elimina" cliccato per l\'offerta ID:', offerId);
        if (offerId) {
            deleteOffer(offerId); // Chiameremo la funzione `deleteOffer` per cancellare l'offerta
        }
    });

    // Event delegation per il bottone "Gestisci Proposta"
    document.getElementById('user-proposals').addEventListener('click', (event) => {
        const manageButton = event.target.closest('.btn-primary');

        if (!manageButton) return; // Ignora se non è il bottone "Gestisci Proposta"

        const tradeId = manageButton.getAttribute('data-trade-id');
        console.log('Bottone "Gestisci Proposta" cliccato per il trade ID:', tradeId);

        if (tradeId) {
            showManageProposalOverlay(tradeId); // Chiama la funzione per aprire l'overlay
        }
    });

    // Event delegation per chiudere l'overlay quando si clicca sulla "X"
    document.addEventListener('click', (event) => {
        const closeIcon = event.target.closest('.close-icon');
        if (closeIcon) {
            hideManageProposalOverlay(); // Chiama la funzione per chiudere l'overlay
        }
    });

    // Event delegation per il bottone "Accetta Offerta"
    document.getElementById('offer-list').addEventListener('click', (event) => {
        const acceptButton = event.target.closest('.accept-offer-btn');

        if (!acceptButton) return; // Se non è il bottone "Accetta Offerta", ignora

        const tradeId = acceptButton.getAttribute('data-trade-id');
        const offerId = acceptButton.getAttribute('data-offer-id');

        if (tradeId && offerId) {
            acceptOffer(tradeId, offerId); // Chiama la funzione per accettare l'offerta
        }
    });

    // Event delegation per chiudere l'overlay quando si clicca sull'icona "X"
    document.addEventListener('click', (event) => {
        const closeIcon = event.target.closest('.close-icon');
        if (closeIcon) {
            hideOverlay(); // Chiama la funzione per chiudere l'overlay
        }
    });

});

// Funzione per selezionare o deselezionare una carta
function toggleCardSelection(card) {
    const cardId = card.id;

    // Se la carta è già selezionata, rimuovila
    if (selectedCards.some(selectedCard => selectedCard.id === cardId)) {
        selectedCards = selectedCards.filter(selectedCard => selectedCard.id !== cardId);
        card.element.classList.remove('selected-card'); // Rimuovi il bordo
    } else {
        // Se non è selezionata, aggiungila (fino a 5 carte)
        if (selectedCards.length < maxCards) {
            selectedCards.push(card);
            card.element.classList.add('selected-card'); // Aggiungi il bordo
        } else {
            alert('Puoi selezionare solo 5 carte.');
        }
    }

    // Aggiorna la visualizzazione delle carte selezionate
    updateSelectedCards();
}

// Funzione per aggiornare la visualizzazione delle carte selezionate
function updateSelectedCards() {
    const selectedCardsContainer = document.getElementById('selected-cards');
    selectedCardsContainer.innerHTML = ''; // Pulisce il contenitore

    // Aggiungi le carte selezionate al contenitore
    selectedCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('selected-card');
        cardElement.innerHTML = `
        <p>${card.name}</p>
        <p>ID: ${card.id}</p>
      `;
        selectedCardsContainer.appendChild(cardElement);
    });

    // Aggiorna il contatore delle carte selezionate
    document.querySelector('#selected-cards-container h5').textContent = `Carte Selezionate (${selectedCards.length}/5)`;
}

// Funzione per gestire la logica di invio proposta con feedback UI
async function submitTradeProposal() {
    if (selectedCards.length === 0) {
        alert('Devi selezionare almeno una carta per inviare la proposta.');
        return;
    }

    const proposedCards = selectedCards.map(card => ({
        card_id: card.id,
        quantity: 1
    }));

    try {
        // Invia la proposta di trade e attendi la risposta
        await postTradeProposal(proposedCards);

        // Mostra feedback e aggiorna l'interfaccia utente
        alert('Proposta di trade creata con successo!');
        selectedCards = [];
        updateSelectedCards();
        hideOverlay();

    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Funzione per aggiornare le carte nell'overlay
function updateCards(cardsData) {
    const cardSelectionContainer = document.getElementById('card-selection');
    cardSelectionContainer.innerHTML = ''; // Pulisce il contenitore

    // Aggiungi tutte le carte usando il template
    cardsData.forEach(card => {
        const cardHTML = createCardHTML(card);
        cardSelectionContainer.appendChild(cardHTML);
    });
}

// Funzione per cambiare pagina e caricare le carte
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) {
        currentPage = 1; // Non permette di andare sotto la pagina 1
    }
    loadUserCards(currentPage);
}

// Funzione per mostrare l'overlay e caricare le carte
function showOverlay() {
    document.getElementById('overlay-background').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Evento per inviare le carte selezionate quando si clicca "Invia Proposta"
    document.getElementById('submit-trade-offer-btn').addEventListener('click', submitTradeProposal);
    // Carica le carte dell'utente per la selezione
    loadUserCards(1); // Carica la prima pagina
}

// Funzione per aprire l'overlay per inviare un'offerta
function showOfferOverlay(tradeId) {
    // Mostra l'overlay
    document.getElementById('overlay-background').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Configura il titolo dell'overlay e il bottone per inviare l'offerta
    document.getElementById('overlay-title').textContent = 'Seleziona le carte da offrire';
    document.getElementById('submit-trade-offer-btn').textContent = 'Invia Offerta';

    // Imposta l'evento di click per inviare l'offerta
    document.getElementById('submit-trade-offer-btn').onclick = function () {

        postOffer(tradeId, selectedCards); // Chiama la funzione per inviare l'offerta con l'ID della proposta
        alert('Offerta inviata con successo!');
        // Reset delle carte selezionate e chiusura dell'overlay
        selectedCards = [];
        updateSelectedCards();
        hideOverlay();
    };

    // Carica le carte dell'utente per la selezione (ad esempio, pagina 1)
    loadUserCards(1); // Funzione già esistente per caricare le carte
}

// Funzione per nascondere l'overlay
function hideOverlay() {
    document.getElementById('overlay-background').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Funzione per cercare carte per nome del supereroe
async function searchCardsByName(name) {
    try {
        const data = await getCardsByName(name);
        updateCards(data); // Usa la funzione per aggiornare le carte
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Funzione per creare la card in base ai dettagli ricevuti usando il template
function createCardHTML(card) {
    const template = document.getElementById('card-template').content.cloneNode(true);

    template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
    template.querySelector('.card-id').textContent = `ID: ${card.id}`;
    template.querySelector('.card-quantity').textContent = card.quantity ? `Quantità: ${card.quantity}` : '';

    if (card && card.thumbnail) {
        template.querySelector('.card-img-top').src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
    } else {
        template.querySelector('.card-img-top').src = 'placeholder-image.jpg';
    }

    return template;
}

// Funzione per caricare le carte dell'utente per la selezione (28 per pagina)
async function loadUserCards(pageNumber) {
    try {
        const data = await getUserCards(pageNumber);

        const cards = data || [];

        if (cards.length === 0) {
            alert('Nessuna carta trovata per la pagina selezionata.');
        } else {
            updateCards(cards); // Usa la stessa logica per aggiornare l'overlay con le carte
        }

        // Aggiorna lo stato dei bottoni di paginazione
        updatePaginationButtons(pageNumber);
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}

// Funzione per aggiornare lo stato dei bottoni di paginazione
function updatePaginationButtons(page) {
    // Disabilita il bottone "Pagina Precedente" se siamo alla prima pagina
    document.getElementById('prev-page-btn').disabled = (page === 1);

    // Se non ci sono carte nella risposta, disabilita il bottone "Pagina Successiva"
    const cardsExist = document.getElementById('card-selection').childElementCount > 0;
    document.getElementById('next-page-btn').disabled = !cardsExist;
}

// Funzione per aprire l'overlay per gestire la proposta
function showManageProposalOverlay(tradeId) {
    // Mostra l'overlay per la gestione delle offerte
    document.getElementById('manage-proposal-overlay-background').style.display = 'block';
    document.getElementById('manage-proposal-overlay').style.display = 'block';

    // Cambia il titolo dell'overlay
    document.getElementById('manage-proposal-overlay-title').textContent = 'Gestisci Proposta';

    // Carica la proposta e le offerte associate
    loadUserProposalWithOffers(tradeId);
}

// Funzione per nascondere l'overlay "Gestisci Proposta"
function hideManageProposalOverlay() {
    document.getElementById('manage-proposal-overlay-background').style.display = 'none';
    document.getElementById('manage-proposal-overlay').style.display = 'none';
}

// Funzione per caricare la proposta e le offerte associate (GET a /api/trade/user/proposals/:tradeId)
async function loadUserProposalWithOffers(tradeId) {
    try {
        // Recupera la proposta con le offerte
        const trade = await getUserProposalWithOffers(tradeId);
        const offerListContainer = document.getElementById('offer-list');
        offerListContainer.innerHTML = ''; // Pulisce il contenitore

        // Verifica se ci sono offerte
        if (!trade.offers || trade.offers.length === 0) {
            offerListContainer.innerHTML = '<p>Nessuna offerta per questa proposta.</p>';
            return;
        }

        // Ciclo attraverso ogni offerta e recupera i dettagli delle carte offerte
        for (const offer of trade.offers) {
            const offerElement = document.createElement('div');
            offerElement.classList.add('offer-item');

            // Aggiungi i dettagli dell'offerta
            offerElement.innerHTML = `
          <p>Offerta da: ${offer.user_id}</p>
          <p>Stato: ${offer.status}</p>
          <p>Data: ${new Date(offer.created_at).toLocaleString()}</p>
          <div class="offer-cards" id="offer-cards-${offer._id}"></div> <!-- Contenitore delle carte -->
          <button class="btn btn-success accept-offer-btn" data-trade-id="${trade._id}" data-offer-id="${offer._id}">Accetta Offerta</button> <!-- Bottone "Accetta Offerta" -->
        `;

            offerListContainer.appendChild(offerElement);

            // Recupera i dettagli delle carte offerte per questa offerta
            const offersWithDetails = await getOfferedCards(offer.offered_cards);
            const cards = offersWithDetails[0].cards; // Ottieni i dettagli delle carte

            // Aggiungi le carte al container usando il template
            const container = document.getElementById(`offer-cards-${offer._id}`);
            cards.forEach(card => {
                const cardElement = document.getElementById('card-template').content.cloneNode(true);

                // Popola il template con i dettagli della carta
                cardElement.querySelector('.card-title').textContent = card.name;
                cardElement.querySelector('.card-id').textContent = `ID: ${card.id}`;
                cardElement.querySelector('.card-quantity').textContent = `Quantità Offerta: ${offer.offered_cards.find(c => c.card_id === card.id).quantity}`;
                cardElement.querySelector('.card-img-top').src = `${card.thumbnail.path}.${card.thumbnail.extension}`;

                container.appendChild(cardElement);
            });
        }

    } catch (error) {
        console.error('Errore durante il caricamento della proposta e delle carte offerte:', error);
        alert('Errore durante il caricamento della proposta e delle carte offerte.');
    }
}

async function acceptOffer(tradeId, offerId) {
    try {
        // Invia la richiesta per accettare l'offerta
        await putAcceptOffer(tradeId, offerId);
        alert('Offerta accettata con successo!');
        hideManageProposalOverlay(); // Chiudi l'overlay
    } catch (error) {
        alert(`Errore: ${error.message}`);
    }
}