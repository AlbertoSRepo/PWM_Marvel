// src/api/shared/database/dbService.js
import { ObjectId } from 'mongodb';
import { getDB } from '../../../loaders/dbLoader.js';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // Inizializza il servizio database
  init() {
    this.db = getDB();
  }

  // Ottieni una collezione
  getCollection(collectionName) {
    if (!this.db) this.init();
    return this.db.collection(collectionName);
  }

  // Converti string ID in ObjectId se necessario
  toObjectId(id) {
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return id;
  }

  // USERS COLLECTION METHODS
  async createUser(userData) {
    const collection = this.getCollection('users');
    const result = await collection.insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...userData, _id: result.insertedId };
  }

  async findUserById(userId) {
    const collection = this.getCollection('users');
    return await collection.findOne({ _id: this.toObjectId(userId) });
  }

  async findUserByEmail(email) {
    const collection = this.getCollection('users');
    return await collection.findOne({ email });
  }

  /**
   * Aggiorna un utente per ID
   */
  async updateUser(userId, updateData) {
    try {
      const usersCollection = this.getCollection('users');
      
      // Prima aggiorna
      const updateResult = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
      
      // Se nessun documento è stato modificato, l'utente non esiste
      if (updateResult.matchedCount === 0) {
        return null;
      }
      
      // Poi recupera l'utente aggiornato
      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
      
      return updatedUser;
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'utente:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    const collection = this.getCollection('users');
    const result = await collection.deleteOne({ _id: this.toObjectId(userId) });
    return result.deletedCount > 0;
  }

  // TRADES COLLECTION METHODS
  async createTrade(tradeData) {
    const collection = this.getCollection('trades');
    const result = await collection.insertOne({
      ...tradeData,
      status: 'open',
      offers: [],
      created_at: new Date(),
      updated_at: new Date()
    });
    return { ...tradeData, _id: result.insertedId };
  }

  async findTradeById(tradeId) {
    const collection = this.getCollection('trades');
    return await collection.findOne({ _id: this.toObjectId(tradeId) });
  }

  async findTradesByProposer(proposerId) {
    const collection = this.getCollection('trades');
    return await collection.find({ proposer_id: this.toObjectId(proposerId) }).toArray();
  }

  async findTradesExcludingUser(userId) {
    const collection = this.getCollection('trades');
    return await collection.find({ proposer_id: { $ne: this.toObjectId(userId) } }).toArray();
  }

  async findTradesWithUserOffers(userId) {
    const collection = this.getCollection('trades');
    return await collection.find({ 'offers.user_id': this.toObjectId(userId) }).toArray();
  }

  async updateTrade(tradeId, updateData) {
    const collection = this.getCollection('trades');
    const result = await collection.findOneAndUpdate(
      { _id: this.toObjectId(tradeId) },
      { 
        $set: { 
          ...updateData, 
          updated_at: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async addOfferToTrade(tradeId, offerData) {
    const collection = this.getCollection('trades');
    const offerId = new ObjectId();
    const result = await collection.findOneAndUpdate(
      { _id: this.toObjectId(tradeId) },
      { 
        $push: { 
          offers: {
            _id: offerId,
            ...offerData,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
          }
        },
        $set: { updated_at: new Date() }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async removeOfferFromTrade(tradeId, offerId) {
    const collection = this.getCollection('trades');
    const result = await collection.findOneAndUpdate(
      { _id: this.toObjectId(tradeId) },
      { 
        $pull: { offers: { _id: this.toObjectId(offerId) } },
        $set: { updated_at: new Date() }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async deleteTrade(tradeId) {
    const collection = this.getCollection('trades');
    const result = await collection.deleteOne({ _id: this.toObjectId(tradeId) });
    return result.deletedCount > 0;
  }

  // Popolamento manuale per sostituire populate di Mongoose
  async populateTradesWithUsers(trades) {
    const userIds = [...new Set(trades.map(trade => trade.proposer_id.toString()))];
    const users = await this.getCollection('users').find(
      { _id: { $in: userIds.map(id => this.toObjectId(id)) } },
      { projection: { username: 1 } }
    ).toArray();

    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    return trades.map(trade => ({
      ...trade,
      proposer_id: userMap[trade.proposer_id.toString()] || trade.proposer_id
    }));
  }
}

export default new DatabaseService();