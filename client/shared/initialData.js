// initialData.js

/**
 * Scarica il JSON principale delle figurine dal server
 * e lo salva in localStorage, se non già presente.
 * Ritorna sempre l'oggetto JSON finale.
 */
export async function fetchFigurineDataIfNeeded() {
    try {
      // 1. Controllo se ho già i dati in localStorage
      const existingData = localStorage.getItem('figurineData');
      if (existingData) {
        console.log('Figurine data trovato in localStorage.');
        return JSON.parse(existingData);
      }
  
      // 2. Altrimenti, chiamo l'endpoint del server
      console.log('Nessun figurine data in localStorage, chiamo il server...');
      const response = await fetch('http://localhost:3000/api/album/initialData', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error(`Errore nella richiesta al server (initialData). Status code: ${response.status}`);
      }
  
      const data = await response.json();
  
      // 3. Salvo il JSON nel localStorage per usi futuri
      localStorage.setItem('figurineData', JSON.stringify(data));
  
      return data;
  
    } catch (error) {
      console.error('Errore durante fetchFigurineDataIfNeeded:', error);
      return null;
    }
  }
  