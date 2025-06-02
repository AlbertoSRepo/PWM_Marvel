import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { User } from './model.js';

class UserService {
  // 1) LOGIN
  async loginUser(email, password) {
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
  async registerUser({ username, email, password, favorite_superhero }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email già in uso');
      error.statusCode = 409;
      throw error;
    }

    // Carico tutte le card ID dal file, per inizializzare l’album con quantity=0
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
      password,
      favorite_superhero,
      credits: 10,
      album
    };

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  };

  // 3) GET USER INFO
  async getUserInfo(userId) {
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
  async updateUser(userId, updateData) {
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
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return true;
  };

  // 6) GET CREDITS AMOUNT
  async getCreditsAmount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }
    return user.credits;
  };

  // 7) BUY CREDITS
  async buyCredits(userId, amount) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Utente non trovato');
      error.statusCode = 404;
      throw error;
    }

    // Esempio: se l’utente non può comprare quantità negative
    if (amount <= 0) {
      const error = new Error('Amount di crediti non valido');
      error.statusCode = 400;
      throw error;
    }

    user.credits += amount;
    await user.save();

    return user.credits;
  };

  // 8) BUY CARD PACKET
  async buyCardPacket(userId) {
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

    // Addebito costi
    user.credits -= packetCost;

    // Caricamento potenziali ID carte da un file o DB
    const allCardIds = this.loadCardIdsFromFile(); 
    const purchasedCardIds = [];

    for (let i = 0; i < packetSize; i++) {
      const randomIndex = Math.floor(Math.random() * allCardIds.length);
      const card_id = allCardIds[randomIndex];
      purchasedCardIds.push(card_id);

      // Aggiorna l'album
      const albumCard = user.album.find(c => c.card_id === card_id);
      if (albumCard) {
        albumCard.quantity += 1;
        albumCard.available_quantity += 1;
      } else {
        user.album.push({
          card_id,
          quantity: 1,
          available_quantity: 1
        });
      }
    }

    await user.save();

    // Restituiamo solo i card IDs
    return {
      success: true,
      credits: user.credits,
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
