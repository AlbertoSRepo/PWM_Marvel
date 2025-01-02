// route.js
export const getUserInfo = async(data) => {
    try {
  
      const response = await fetch(`http://localhost:3000/api/users/info`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Errore sconosciuto';
        const statusCode = response.status;
  
        throw new Error(`Errore: ${errorMessage}. Status code: ${statusCode}`);
      }
  
      return response.json();
    } catch (error) {
      console.error('Errore durante il recupero dei dati:', error);
      throw error;
    }
}

export const putDataChanges = async(data) => {
    try {
  
      const response = await fetch(`http://localhost:3000/api/users/update`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Errore sconosciuto';
        const statusCode = response.status;
  
        throw new Error(`Errore: ${errorMessage}. Status code: ${statusCode}`);
      }
  
      window.location.reload();
    } catch (error) {
      throw error;
    }
}
