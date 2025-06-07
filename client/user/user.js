import { getUserInfo, putDataChanges } from './route.js';
import { loadNavbar } from '../shared/navbar.js';

document.addEventListener('DOMContentLoaded', () => {
  // Carica navbar
  loadNavbar('user');

  // Reference DOM
  const form = document.getElementById('userForm');
  const editBtn = document.getElementById('editBtn');
  const submitBtn = document.getElementById('submitBtn');

  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const favoriteInput = document.getElementById('favorite_superhero');
  const passwordInput = document.getElementById('password');

  const allInputs = [usernameInput, emailInput, favoriteInput, passwordInput];

  // Popola i campi
  populateUserInfo();

  // Event Listener: click su Edit
  editBtn.addEventListener('click', () => {
    toggleInputs(allInputs, submitBtn);
    // Quando si abilita la modifica, svuota il campo password
    if (!passwordInput.disabled) {
      passwordInput.value = '';
      passwordInput.placeholder = 'Inserisci nuova password (lascia vuoto per non modificare)';
    }
  });

  // Event Listener: invio del form
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitChanges();
  });

  // Funzioni
  async function populateUserInfo() {
    try {
      const userData = await getUserInfo();
      usernameInput.value = userData.username || '';
      emailInput.value = userData.email || '';
      favoriteInput.value = userData.favorite_superhero || '';
      // NON popolare il campo password per sicurezza
      passwordInput.value = '';
      passwordInput.placeholder = 'Lascia vuoto per non modificare';
    } catch (error) {
      alert(error);
    }
  }

  function toggleInputs(inputsArray, btn) {
    inputsArray.forEach(input => {
      input.disabled = !input.disabled;
    });
    // Se il primo input è abilitato, mostra il btn, altrimenti nascondilo
    btn.style.display = inputsArray[0].disabled ? 'none' : 'block';
    
    // Quando si disabilita, svuota di nuovo la password
    if (inputsArray[0].disabled) {
      passwordInput.value = '';
      passwordInput.placeholder = 'Lascia vuoto per non modificare';
    }
  }

  async function submitChanges() {
    try {
      const updatedUserData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        favorite_superhero: favoriteInput.value.trim()
      };
      
      // Solo includi password se è stata inserita
      if (passwordInput.value.trim() !== '') {
        updatedUserData.password = passwordInput.value.trim();
      }
      
      await putDataChanges(updatedUserData);
      
      // Dopo il salvataggio, disabilita i campi e nascondi il bottone
      toggleInputs(allInputs, submitBtn);
      
      alert('Informazioni aggiornate con successo!');
      
    } catch (error) {
      alert(error);
    }
  }
});
