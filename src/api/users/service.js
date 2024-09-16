// src/api/users/service.js
import { User } from './model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken'; 
import { MD5 } from '../shared/utils/md5.js';
class UserService {
  async loginUser(email, password) {
      console.log('Starting login process for email:', email);
      
      const user = await User.findOne({ email });
      if (!user) {
          console.log('User not found');
          throw new Error('Invalid credentials');
      }

      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);

      if (!isMatch) {
          throw new Error('Invalid credentials');
      }

      try {
          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
          console.log('Generated Token:', token);
          return { userId: user._id, token };
      } catch (error) {
          console.error('Error generating token:', error);
          throw new Error('Token generation failed');
      }
  }

  async registerUser(userData) {
    // Carica gli ID delle carte da un file JSON
    const cardIds = this.loadCardIdsFromFile();

    // Crea un album vuoto con gli ID delle carte
    const album = cardIds.map(card_id => ({
      card_id: card_id, 
      quantity: 0,
      available_quantity: 0,
    }));

    // Imposta crediti iniziali e album per il nuovo utente
    userData.credits = 10;
    userData.album = album;

    // Crea e salva il nuovo utente
    const user = new User(userData);
    await user.save();

    // Genera il token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Restituisce l'utente e il token
    return { user, token };
  }

  loadCardIdsFromFile() {
    // Convert import.meta.url to __dirname equivalent
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Use path.join to create the correct file path
    const filePath = path.join(__dirname, '../../../data/marvel_character_ids.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const card_ids = JSON.parse(fileContents);
    return card_ids;
  }

  async updateUser(userId, updateData) {
    // Restrict updates to only username, password, and favorite_superhero
    const fieldsToUpdate = {};
    if (updateData.username) fieldsToUpdate.username = updateData.username;
    if (updateData.password) fieldsToUpdate.password = updateData.password;
    if (updateData.favorite_superhero) fieldsToUpdate.favorite_superhero = updateData.favorite_superhero;

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, { new: true });
    return user;
  }

  async deleteUser(userId) {
    await User.findByIdAndDelete(userId);
    return true;
  }

  async buyCredits(userId, amount) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.credits += amount;
    await user.save();

    return user.credits;
  }

  async buyCardPacket(userId) {
    const packetSize = parseInt(process.env.PACKET_SIZE, 10);
    const packetCost = parseInt(process.env.PACKET_COST, 10);
    
    // Trova l'utente
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
  
    // Verifica se l'utente ha abbastanza crediti
    if (user.credits < packetCost) {
      return {
        success: false,
        message: 'Non hai abbastanza crediti',
        credits: user.credits,
      };
    }
  
    // Deduct the packet price from the user's credits
    user.credits -= packetCost;
  
    // Load card IDs from the JSON file to randomly pick cards
    const cardIds = this.loadCardIdsFromFile();
  
    // Randomly select cards to add to the user's album
    const newCards = [];
    for (let i = 0; i < packetSize; i++) {
      const randomIndex = Math.floor(Math.random() * cardIds.length);
      const card_id = cardIds[randomIndex];
      newCards.push(card_id);
  
      // Update the user's album
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
  
    await user.save();
  
    // Ottieni i dettagli delle carte dal Marvel API
    const cardDetails = await this.getCharacterDetails(newCards);
  
    // Filtrare per restituire solo nome e thumbnail
    const simplifiedCardDetails = cardDetails.map(card => ({
      name: card.name,
      thumbnail: card.thumbnail,
    }));
  
    // Restituisce i dettagli delle carte e i crediti rimanenti
    return {
      success: true,
      credits: user.credits,
      newCards: simplifiedCardDetails
    };
  }
  // Funzione per ottenere i dettagli delle carte dal Marvel API
  async getCharacterDetails(characterIds) {
    const baseUrl = process.env.CHARACTERS_URL;
    const publicApiKey = process.env.MARVELAPI_PUBLICKEY;
    const privateApiKey = process.env.MARVELAPI_PRIVATEKEY;

    // Genera i parametri di autenticazione
    const timestamp = Date.now();
    const hash = MD5(timestamp + privateApiKey + publicApiKey);
    const authParams = `ts=${timestamp}&apikey=${publicApiKey}&hash=${hash}`;

    // Mappa per tutte le richieste parallele
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
  }

}

export default new UserService();
