import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { User } from './model.js';
import { MD5 } from '../shared/utils/md5.js';

class UserService {

  // 1) LOGIN
  loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Credenziali non valide');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
  };

  // 2) REGISTER
  registerUser = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error = new Error('Email già in uso');
      error.statusCode = 409;
      throw error;
    }

    // Carico tutte le card ID dal file
    const cardIds = this.loadCardIdsFromFile();
    const album = cardIds.map(card_id => ({
      card_id: card_id,
      quantity: 0,
      available_quantity: 0,
    }));

    // Imposto i valori iniziali
    userData.credits = 10;
    userData.album = album;

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  };

  // 3) GET USER INFO
  getUserInfo = async (userId) => {
    const user = await User.findById(userId)
      .select('_id username email favorite_superhero credits password');
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return user;
  };

  // 4) UPDATE USER
  updateUser = async (userId, updateData) => {
    const fieldsToUpdate = {};
    if (updateData.email) fieldsToUpdate.email = updateData.email;
    if (updateData.username) fieldsToUpdate.username = updateData.username;
    if (updateData.password) fieldsToUpdate.password = updateData.password;
    if (updateData.favorite_superhero) fieldsToUpdate.favorite_superhero = updateData.favorite_superhero;

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, { new: true });
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return user;
  };

  // 5) DELETE USER
  deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return true;
  };

  // 6) GET CREDITS AMOUNT
  getCreditsAmount = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return user.credits;
  };

  // 7) BUY CREDITS
  buyCredits = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }

    user.credits += amount;
    await user.save();

    return user.credits;
  };

  // 8) BUY CARD PACKET
  buyCardPacket = async (userId) => {
    const packetSize = parseInt(process.env.PACKET_SIZE, 10);
    const packetCost = parseInt(process.env.PACKET_COST, 10);

    const user = await User.findById(userId);
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

    // Addebito dei crediti
    user.credits -= packetCost;

    const cardIds = this.loadCardIdsFromFile();
    const newCards = [];

    // Genero le carte da inserire
    for (let i = 0; i < packetSize; i++) {
      const randomIndex = Math.floor(Math.random() * cardIds.length);
      const card_id = cardIds[randomIndex];
      newCards.push(card_id);

      // Aggiorno l'album
      const albumCard = user.album.find(c => c.card_id === card_id);
      if (albumCard) {
        albumCard.quantity += 1;
        albumCard.available_quantity += 1;
      } else {
        user.album.push({
          card_id: card_id,
          quantity: 1,
          available_quantity: 1,
        });
      }
    }

    // Salvo l’utente con i nuovi dati
    await user.save();

    // Ottengo i dettagli delle carte dal servizio Marvel
    const cardDetails = await this.getCharacterDetails(newCards);

    // Restituisco i dati in un formato semplificato
    const simplifiedCardDetails = cardDetails.map(card => ({
      name: card.name,
      thumbnail: card.thumbnail,
    }));

    return {
      success: true,
      credits: user.credits,
      newCards: simplifiedCardDetails
    };
  };

  // Caricamento file JSON con gli ID delle carte
  loadCardIdsFromFile = () => {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const filePath = path.join(__dirname, '../../../data/marvel_character_ids.json');
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const card_ids = JSON.parse(fileContents);
      return card_ids;
    } catch (error) {
      throw error;
    }
  };

  // Ottenimento dei dettagli dalla Marvel API
  getCharacterDetails = async (characterIds) => {
    try {
      const baseUrl = process.env.CHARACTERS_URL;
      const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
      const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;

      const timestamp = Date.now();
      const hash = MD5(timestamp + privateApiKey + publicApiKey);
      const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;

      const requests = characterIds.map(async (characterId) => {
        const response = await fetch(`${baseUrl}/${characterId}?${authParams}`);
        const data = await response.json();
        if (data && data.data && data.data.results && data.data.results.length > 0) {
          return data.data.results[0];
        }
        return null;
      });

      const detailedCharacters = await Promise.all(requests);
      return detailedCharacters.filter(Boolean);
    } catch (error) {
      throw error;
    }
  };
}

export default new UserService();
