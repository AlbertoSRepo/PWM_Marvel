// src/api/trades/model.js
import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offered_cards: [{
        card_id: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});

const tradeSchema = new mongoose.Schema({
    proposer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proposed_cards: [{
        card_id: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    offers: [offerSchema],  // Offerte collegate a questa proposta
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});

export const Trade = mongoose.model('Trade', tradeSchema);
