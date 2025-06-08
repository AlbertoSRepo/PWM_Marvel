// cardsUtils.js

/**
 * Restituisce il file figurineData (JSON) dal localStorage,
 * oppure lancia un errore se non è presente.
 */
export function getFigurineDataOrThrow() {
    const data = localStorage.getItem('figurineData');
    if (!data) {
      throw new Error('figurineData non presente in LocalStorage');
    }
    return JSON.parse(data);
  }
  
/**
 * Converte una thumbnail string (es. "http://.../image.jpg")
 * in un oggetto { path, extension } compatibile con la UI.
 */
export function convertThumbnailStringToObj(thumbnailUrl) {
  if (!thumbnailUrl) {
    return { path: 'image-not-found', extension: 'jpeg' };
  }
  
  // Se è già un oggetto, restituiscilo così com'è
  if (typeof thumbnailUrl === 'object') {
    return thumbnailUrl;
  }
  
  // RIMUOVI: Non trattare più image_not_available come caso speciale
  // Lascia che il browser gestisca il fallback tramite onerror
  
  // Per URL completi, estrai solo la parte prima dell'estensione
  const lastDot = thumbnailUrl.lastIndexOf('.');
  const lastSlash = thumbnailUrl.lastIndexOf('/');
  
  if (lastDot === -1) {
    // Nessuna estensione trovata
    return { path: thumbnailUrl, extension: 'jpeg' };
  }
  
  // Se l'URL è completo (contiene protocollo), restituisci l'URL completo come path
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
    return {
      path: thumbnailUrl.substring(0, lastDot),
      extension: thumbnailUrl.substring(lastDot + 1),
    };
  }
  
  // Per path relativi, funziona come prima
  return {
    path: thumbnailUrl.substring(0, lastDot),
    extension: thumbnailUrl.substring(lastDot + 1),
  };
}
  
  /**
   * Unisce i dati provenienti dal server (serverCards)
   *   es.  [ {id, quantity}, ... ]
   * con i dati "local" (localCards)
   *   es.  [ {id, name, thumbnail: "http://..." }, ... ]
   *
   * Se onlyPossessed=true, filtra le carte con quantity <= 0.
   * Ritorna un array pronto per la UI, con campi:
   *   { id, name, thumbnail: {path, extension}, state, quantity }
   */
  export function mergeServerAndLocalData(serverCards, localCards, onlyPossessed = false) {
  // Se vogliamo mostrare solo le carte possedute, filtra serverCards
  const filteredServer = onlyPossessed
    ? serverCards.filter(sc => sc.quantity > 0)
    : serverCards;

  return filteredServer.map(sc => {
    // Trova la carta corrispondente in local
    const localFig = localCards.find(lc => lc.id === sc.id);

    // Decidi "posseduta" vs "non posseduta"
    const isPossessed = sc.quantity > 0;
    const state = isPossessed ? 'posseduta' : 'non posseduta';
    const quantity = isPossessed ? sc.quantity : 0;

    if (!localFig) {
      // Fallback se non la troviamo in local
      return {
        id: sc.id,
        name: 'Carta sconosciuta',
        thumbnail: { path: 'image-not-found', extension: 'jpeg' },
        state,
        quantity
      };
    }

    // Converto la thumbnail da stringa a oggetto
    const thumbObj = convertThumbnailStringToObj(localFig.thumbnail);
    return {
      id: sc.id,
      name: localFig.name,
      thumbnail: thumbObj,
      state,
      quantity
    };
  });
}
