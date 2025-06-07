// src/api/shared/database/indexes.js
// Script per creare gli indici necessari nel database MongoDB

import { getDB } from '../../../loaders/dbLoader.js';

export async function createIndexes() {
  const db = getDB();
  
  try {
    // Indici per la collezione users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 });
    await db.collection('users').createIndex({ 'album.card_id': 1 });
    
    // Indici per la collezione trades
    await db.collection('trades').createIndex({ proposer_id: 1 });
    await db.collection('trades').createIndex({ status: 1 });
    await db.collection('trades').createIndex({ created_at: -1 });
    await db.collection('trades').createIndex({ 'offers.user_id': 1 });
    await db.collection('trades').createIndex({ 'offers.status': 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

// Script per inizializzare il database con dati di esempio
export async function seedDatabase() {
  const db = getDB();
  
  try {
    // Verifica se esistono già dati
    const userCount = await db.collection('users').countDocuments();
    if (userCount > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }
    
    // Qui puoi aggiungere dati di esempio se necessario
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Funzione per verificare la salute del database
export async function checkDatabaseHealth() {
  const db = getDB();
  
  try {
    // Test di connessione base
    await db.admin().ping();
    
    // Verifica collezioni esistenti
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Database health check passed');
    console.log('Available collections:', collectionNames);
    
    return {
      status: 'healthy',
      collections: collectionNames
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}