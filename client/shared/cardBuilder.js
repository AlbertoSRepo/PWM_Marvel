// shared/cardBuilder.js
export function createCardHTML(card, options = {}) {
  const { 
    showQuantity = true, 
    showId = true,
    clickHandler = null,
    templateId = 'card-template'
  } = options;

  const template = document.getElementById(templateId).content.cloneNode(true);
  
  template.querySelector('.card-title').textContent = card.name || 'Carta sconosciuta';
  
  if (showId) {
    const idElement = template.querySelector('.card-id');
    if (idElement) idElement.textContent = `ID: ${card.id}`;
  }
  
  if (showQuantity) {
    const qtyElement = template.querySelector('.card-quantity');
    if (qtyElement) {
      if (card.state === 'posseduta') {
        qtyElement.textContent = `${card.quantity}`;
      } else {
        qtyElement.textContent = '';
      }
    }
  }

  const imgTop = template.querySelector('.card-img-top');
  if (card.thumbnail) {
    imgTop.src = `${card.thumbnail.path}.${card.thumbnail.extension}`;
  } else {
    imgTop.src = 'placeholder-image.jpg';
  }

  const marvelCard = template.querySelector('.marvel-card');
  if (card.state) {
    marvelCard.classList.add(card.state);
  }
  
  if (clickHandler && card.state === 'posseduta') {
    marvelCard.addEventListener('click', () => clickHandler(card.id));
  }

  return template;
}