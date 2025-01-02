// src/api/users/service.js
import { User } from './model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { MD5 } from '../shared/utils/md5.js';
class UserService {
  loginUser = async (userData, res) => {
    const { email, password } = userData;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        const error = new Error('Credenziali non valide');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 36000000
      });

    } catch (error) {
      throw error;
    }
  };

  registerUser = async (userData, res) => {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        const error = new Error('Email già in uso');
        error.statusCode = 409;
        throw error;
      }

      const cardIds = this.loadCardIdsFromFile();

      const album = cardIds.map(card_id => ({
        card_id: card_id,
        quantity: 0,
        available_quantity: 0,
      }));

      userData.credits = 10;
      userData.album = album;

      const user = new User(userData);
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 36000000
      });

      return user;
    }
    catch (error) {
      throw error;
    }
  }

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
  }

  updateUser = async (userId, updateData) => {
    try {
      const fieldsToUpdate = {};
      if (updateData.email) fieldsToUpdate.email = updateData.email;
      if (updateData.username) fieldsToUpdate.username = updateData.username;
      if (updateData.password) fieldsToUpdate.password = updateData.password;
      if (updateData.favorite_superhero) fieldsToUpdate.favorite_superhero = updateData.favorite_superhero;

      const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, { new: true });
      return user;
    } catch (error) {
      throw error;
    }
  }

  deleteUser = async (userId) => {
    try {
      await User.findByIdAndDelete(userId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  buyCredits = async (userId, amount) => {
    try {
      const user = await User.findById(userId);

      user.credits += amount;
      await user.save();

      return user.credits;
    } catch (error) {
      throw error;
    }
  }

  getCreditsAmount = async (userId) => { 
      try {
        const user = await User.findById(userId);
  
        return user.credits;
      } catch (error) {
        throw error;
      }
    }

  buyCardPacket = async (userId) => {
    try {
      const packetSize = parseInt(process.env.PACKET_SIZE, 10);
      const packetCost = parseInt(process.env.PACKET_COST, 10);

      const user = await User.findById(userId);

      if (user.credits < packetCost) {
        const error = new Error('Crediti insufficienti');
        error.statusCode = 400;
        throw error;
      }

      user.credits -= packetCost;

      const cardIds = this.loadCardIdsFromFile();

      const newCards = [];
      for (let i = 0; i < packetSize; i++) {
        const randomIndex = Math.floor(Math.random() * cardIds.length);
        const card_id = cardIds[randomIndex];
        newCards.push(card_id);

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

      const cardDetails = await this.getCharacterDetails(newCards);

      const simplifiedCardDetails = cardDetails.map(card => ({
        name: card.name,
        thumbnail: card.thumbnail,
      }));

      return {
        success: true,
        credits: user.credits,
        newCards: simplifiedCardDetails
      };
    }
    catch (error) {
      throw error;
    }
  }

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
  }

}

export default new UserService();
