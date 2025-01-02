import { getUserInfo, putDataChanges } from './route.js'
import { loadNavbar } from '../shared/navbar.js';
// Al caricamento della pagina, fai una richiesta al server per ottenere i dati dell'utente
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar('user');

    populateUserInfo();

    document.getElementById('editBtn').addEventListener('click', editUserData);

    document.getElementById('submitBtn').addEventListener('click', sumbitChanges);

});

const inputs = document.querySelectorAll('.form-control');

const populateUserInfo = async () => {
    try {
        const userData = await getUserInfo();

        document.getElementById('username').value = userData.username || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('favorite_superhero').value = userData.favorite_superhero || '';
        document.getElementById('password').value = userData.password || '';
    } catch (error) {
        alert(error);
    }

}

const editUserData = () => {
    inputs.forEach(input => {
        input.disabled = !input.disabled; // Abilita/disabilita i campi
    });
    submitBtn.style.display = inputs[0].disabled ? 'none' : 'block'; // Mostra il bottone "Invia" se i campi sono abilitati
}

const sumbitChanges = async () => {
    try {
        const updatedUserData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            favorite_superhero: document.getElementById('favorite_superhero').value,
            password: document.getElementById('password').value,
        };

        await putDataChanges(updatedUserData);
    } catch (error) {
        alert(error);
    }
}

