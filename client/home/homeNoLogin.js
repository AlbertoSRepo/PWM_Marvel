import { sendLoginRequest, sendRegisterRequest } from './route.js';

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('loginForm').addEventListener('submit', handleLoginFormSubmit);

    document.querySelector('#registerModal form').addEventListener('submit', handleRegisterFormSubmit);

});

const handleLoginFormSubmit = async(event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const data = { email, password };
    
    try {
        await sendLoginRequest(data);
    } catch (error) {
        alert(error.message);
    }
}

const handleRegisterFormSubmit = async(event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const confirmedPassword = document.getElementById('confirmedPassword').value;
    const favorite_superhero = document.getElementById('superhero').value;

    // Controlla che le password corrispondano
    if (password !== confirmedPassword) {
        alert('Le password non corrispondono.');
        return;
    }

    const data = {
        email,
        username,
        password,
        favorite_superhero
    };

    try {
        await sendRegisterRequest(data);
    } catch (error) {
        alert(error.message);
    }
}