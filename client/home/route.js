// route.js

// login utente
export const sendLoginRequest = async(data) => {
    try {
  
      const response = await fetch(`http://localhost:3000/api/users/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Errore sconosciuto';
        const statusCode = response.status;

        throw new Error(`Errore: ${errorMessage}. Status code: ${statusCode}`);
      }
  
      handleResponseToRedirect();
    } catch (error) {
      console.error(error);
      throw error;
    }
}

// registrazione utente
export const sendRegisterRequest = async(data) => {
    try {
  
      const response = await fetch(`http://localhost:3000/api/users/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Errore sconosciuto';
        const statusCode = response.status;
  
        throw new Error(`Errore: ${errorMessage}. Status code: ${statusCode}`);
      }
  
      handleResponseToRedirect();
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
}

// reindirizzazione alla pagina album
const handleResponseToRedirect = () => {
    alert('Operazione avvenuta con successo!');
    window.location.href = '../album/album.html'; 
};


