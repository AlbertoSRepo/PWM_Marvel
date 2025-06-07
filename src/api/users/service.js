// src/api/users/service.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import dbService from '../shared/database/dbService.js';
import validationService from '../shared/validation/validationService.js';

class UserService {
  // 1) LOGIN
  async loginUser(email, password) {
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      const error = new Error('Credenziali non valide');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await validationService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Credenziali non valide');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
  };

  // 2) REGISTER
  async registerUser({ username, email, password, favorite_superhero }) {
    // Validazione dati
    const validation = validationService.validateUserRegistration({
      username, email, password, favorite_superhero
    });
    
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    // Controlla se l'email esiste già
    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      const error = new Error('Email già in uso');
      error.statusCode = 409;
      throw error;
    }

    // Hash della password
    const hashedPassword = await validationService.hashPassword(password);

    // Carico tutte le card ID dal file, per inizializzare l'album con quantity=0
    const cardIds = this.loadCardIdsFromFile();
    const album = cardIds.map(card_id => ({
      card_id,
      quantity: 0,
      available_quantity: 0,
    }));

    // Imposto i valori iniziali
    const userData = {
      username,
      email,
      password: hashedPassword,
      favorite_superhero,
      credits: 10,
      album
    };

    const user = await dbService.createUser(userData);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  };

  // 3) GET USER INFO
  async getUserInfo(userId) {
    const user = await dbService.findUserById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    
    // Rimuovi la password dalla risposta
    const { password, ...userInfo } = user;
    return userInfo;
  };

  // 4) UPDATE USER
  async updateUser(userId, updateData) {
    // Rimuovi campi vuoti o undefined prima della validazione
    const cleanedData = {};
    
    if (updateData.email && updateData.email.trim() !== '') {
      cleanedData.email = updateData.email.trim();
    }
    
    if (updateData.username && updateData.username.trim() !== '') {
      cleanedData.username = updateData.username.trim();
    }
    
    if (updateData.favorite_superhero && updateData.favorite_superhero.trim() !== '') {
      cleanedData.favorite_superhero = updateData.favorite_superhero.trim();
    }
    
    // Solo includi password se è stata fornita e non è vuota
    if (updateData.password && updateData.password.trim() !== '') {
      cleanedData.password = updateData.password.trim();
    }

    // Validazione dati update
    const validation = validationService.validateUserUpdate(cleanedData);
    
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    const fieldsToUpdate = {};
    
    if (cleanedData.email) fieldsToUpdate.email = cleanedData.email;
    if (cleanedData.username) fieldsToUpdate.username = cleanedData.username;
    if (cleanedData.favorite_superhero) fieldsToUpdate.favorite_superhero = cleanedData.favorite_superhero;
    
    // Hash password solo se fornita
    if (cleanedData.password) {
      fieldsToUpdate.password = await validationService.hashPassword(cleanedData.password);
    }

    // Verifica che l'email non sia già in uso da un altro utente
    if (cleanedData.email) {
      const existingUser = await dbService.findUserByEmail(cleanedData.email);
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        const error = new Error('Email già in uso');
        error.statusCode = 409;
        throw error;
      }
    }

    const user = await dbService.updateUser(userId, fieldsToUpdate);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return user;
  };

  // 5) DELETE USER
  async deleteUser(userId) {
    const deleted = await dbService.deleteUser(userId);
    if (!deleted) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return true;
  };

  // 6) GET CREDITS AMOUNT
  async getCreditsAmount(userId) {
    const user = await dbService.findUserById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return user.credits;
  };

  // 7) BUY CREDITS
  async buyCredits(userId, amount) {
    if (amount <= 0) {
      const error = new Error('Amount di crediti non valido');
      error.statusCode = 400;
      throw error;
    }

    const user = await dbService.findUserById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }

    const newCredits = user.credits + amount;
    await dbService.updateUser(userId, { credits: newCredits });

    return newCredits;
  };

  // 8) BUY CARD PACKET
  async buyCardPacket(userId) {
    const packetSize = parseInt(process.env.PACKET_SIZE, 10);
    const packetCost = parseInt(process.env.PACKET_COST, 10);

    const user = await dbService.findUserById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }

    if (user.credits < packetCost) {
      const error = new Error('Crediti insufficienti');
      error.statusCode = 400;
      throw error;
    }

    // Addebito costi
    const newCredits = user.credits - packetCost;

    // Caricamento potenziali ID carte da un file o DB
    const allCardIds = this.loadCardIdsFromFile(); 
    const purchasedCardIds = [];
    const updatedAlbum = [...user.album];

    for (let i = 0; i < packetSize; i++) {
      const randomIndex = Math.floor(Math.random() * allCardIds.length);
      const card_id = allCardIds[randomIndex];
      purchasedCardIds.push(card_id);

      // Aggiorna l'album
      const albumCardIndex = updatedAlbum.findIndex(c => c.card_id === card_id);
      if (albumCardIndex !== -1) {
        updatedAlbum[albumCardIndex].quantity += 1;
        updatedAlbum[albumCardIndex].available_quantity += 1;
      } else {
        updatedAlbum.push({
          card_id,
          quantity: 1,
          available_quantity: 1
        });
      }
    }

    // Aggiorna l'utente con i nuovi crediti e album
    await dbService.updateUser(userId, { 
      credits: newCredits, 
      album: updatedAlbum 
    });

    // Restituiamo solo i card IDs
    return {
      success: true,
      credits: newCredits,
      purchasedCardIds
    };
  };

  // Caricamento file JSON con gli ID delle carte
  loadCardIdsFromFile() {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const filePath = path.join(__dirname, '../../../data/marvel_character_ids.json');
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContents); // array di ID
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();