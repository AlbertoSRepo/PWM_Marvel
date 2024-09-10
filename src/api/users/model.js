//src/api/users/model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorite_superhero: { type: String, required: true },
    credits: { type: Number, default: 10 },
    album: [{
        card_id: Number,
        quantity: { type: Number, default: 0 },
        available_quantity: { type: Number, default: 0 }
    }]
});

// Hash password before saving the user model
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    //development only
    console.log('\nHashed password:', this.password);  // Log hashed password
    //end development only
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);
