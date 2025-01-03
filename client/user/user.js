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
      passwordInput.value = userData.password || '';
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
  }

  async function submitChanges() {
    try {
      const updatedUserData = {
        username: usernameInput.value,
        email: emailInput.value,
        favorite_superhero: favoriteInput.value,
        password: passwordInput.value,
      };
      await putDataChanges(updatedUserData);
    } catch (error) {
      alert(error);
    }
  }
});
