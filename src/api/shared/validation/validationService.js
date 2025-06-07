// src/api/shared/validation/validationService.js
import bcrypt from 'bcryptjs';

class ValidationService {
    // Validazione email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validazione username
    isValidUsername(username) {
        return username && username.length >= 3;
    }

    // Validazione password
    isValidPassword(password) {
        return password && password.length >= 6;
    }

    // Validazione supereroe preferito
    isValidSuperhero(superhero) {
        return superhero && superhero.trim().length > 0;
    }

    // Hash password
    async hashPassword(password) {
        const bcrypt = (await import('bcryptjs')).default;
        return bcrypt.hash(password, 10);
    }

    // Confronto password
    async comparePassword(password, hashedPassword) {
        const bcrypt = (await import('bcryptjs')).default;
        return bcrypt.compare(password, hashedPassword);
    }

    // Validazione dati registrazione utente
    validateUserRegistration(userData) {
        const errors = [];

        if (!this.isValidEmail(userData.email)) {
            errors.push('Email non valida');
        }

        if (!this.isValidUsername(userData.username)) {
            errors.push('Username deve essere di almeno 3 caratteri');
        }

        if (!this.isValidPassword(userData.password)) {
            errors.push('Password deve essere di almeno 6 caratteri');
        }

        if (!this.isValidSuperhero(userData.favorite_superhero)) {
            errors.push('Supereroe preferito è richiesto');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validazione dati aggiornamento utente
    validateUserUpdate(updateData) {
        const errors = [];

        if (updateData.email !== undefined && !this.isValidEmail(updateData.email)) {
            errors.push('Email non valida');
        }

        if (updateData.username !== undefined && !this.isValidUsername(updateData.username)) {
            errors.push('Username deve essere di almeno 3 caratteri');
        }

        // CORREZIONE: Solo valida la password se è stata effettivamente fornita e non è vuota
        if (updateData.password !== undefined && updateData.password !== '' && !this.isValidPassword(updateData.password)) {
            errors.push('Password deve essere di almeno 6 caratteri');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Helper per parsare card_id
    parseCardId(cardId) {
        if (typeof cardId === 'number') {
            return cardId;
        }
        if (typeof cardId === 'string') {
            const parsed = parseInt(cardId, 10);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }

    // Helper per parsare quantity
    parseQuantity(quantity) {
        if (typeof quantity === 'number') {
            return quantity;
        }
        if (typeof quantity === 'string') {
            const parsed = parseInt(quantity, 10);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }

    // Validazione dati trade
    validateTradeData(tradeData) {
        const errors = [];

        if (!tradeData.proposed_cards || !Array.isArray(tradeData.proposed_cards) || tradeData.proposed_cards.length === 0) {
            errors.push('Proposed cards deve essere un array non vuoto');
        }

        if (tradeData.proposed_cards) {
            tradeData.proposed_cards.forEach((card, index) => {
                const cardId = this.parseCardId(card.card_id);
                if (cardId === null) {
                    errors.push(`Card ${index + 1}: card_id deve essere un numero valido`);
                }

                const quantity = this.parseQuantity(card.quantity);
                if (quantity === null || quantity <= 0) {
                    errors.push(`Card ${index + 1}: quantity deve essere un numero positivo`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validazione dati offerta
    validateOfferData(offerData) {
        const errors = [];

        if (!offerData.offered_cards || !Array.isArray(offerData.offered_cards) || offerData.offered_cards.length === 0) {
            errors.push('Offered cards deve essere un array non vuoto');
        }

        if (offerData.offered_cards) {
            offerData.offered_cards.forEach((card, index) => {
                const cardId = this.parseCardId(card.card_id);
                if (cardId === null) {
                    errors.push(`Card ${index + 1}: card_id deve essere un numero valido`);
                }
                
                const quantity = this.parseQuantity(card.quantity);
                if (quantity === null || quantity <= 0) {
                    errors.push(`Card ${index + 1}: quantity deve essere un numero positivo`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Helper per normalizzare i card_id nell'album
    normalizeAlbumCardIds(album) {
        return album.map(card => ({
            ...card,
            card_id: Number(card.card_id)
        }));
    }

    // Helper per pulire inconsistenze nell'album
    cleanupAlbum(album) {
        return album.map(card => {
            if (card.quantity <= 0) {
                return {
                    ...card,
                    quantity: 0,
                    available_quantity: 0
                };
            }
            
            if (card.available_quantity > card.quantity) {
                return {
                    ...card,
                    available_quantity: card.quantity
                };
            }
            
            return card;
        }).filter(card => card.quantity > 0);
    }
}

export default new ValidationService();