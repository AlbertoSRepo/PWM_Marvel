// src/api/v1/users/model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorite_superhero: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    default: 0,
  },
  album: [
    {
      card_id: {
        type: Number,  // <-- Change from ObjectId to Number
        required: true,
      },
      quantity: { 
        type: Number, 
        default: 0 
      },
      available_quantity: { 
        type: Number, 
        default: 0 
      },
    }
  ]
});

// Password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model('User', UserSchema);
