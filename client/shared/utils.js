if (!response.ok) {
    // Estrai il messaggio di errore e lo status code dalla risposta
    const errorResponse = await response.json();
    const errorMessage = errorResponse.message || 'Errore sconosciuto';
    const statusCode = response.status;

    // Lancia un errore con il messaggio e lo status code
    throw new Error(`Errore: ${errorMessage}. Status code: ${statusCode}`);
  }