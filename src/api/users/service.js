// src/api/v1/users/service.js
import { User } from './model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken'; 

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
          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          console.log('Generated Token:', token);
          return { userId: user._id, token };
      } catch (error) {
          console.error('Error generating token:', error);
          throw new Error('Token generation failed');
      }
  }

  async verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
  }

  async registerUser(userData) {
    // Load card IDs from the JSON file
    const cardIds = this.loadCardIdsFromFile();

    // Populate the album array with card IDs
    const album = cardIds.map(card_id => ({
      card_id: card_id, // Numeric IDs
      quantity: 0,
      available_quantity: 0,
    }));

    // Set initial credits and album
    userData.credits = 10;
    userData.album = album;

    // Create and save the user
    const user = new User(userData);
    await user.save();
    return user;
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

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.credits < packetCost) throw new Error('Not enough credits');

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

    return {
      credits: user.credits,
      newCards: newCards,
    };
  }

}

export default new UserService();
