import userService from './service.js';
import { User } from './model.js';

class UserController {
  login = async (req, res) => {
    console.log('Received login request for:', req.body.email);
    try {
        const { email, password } = req.body;
        const { userId, token } = await userService.loginUser(email, password);  // Destructure userId and token

        console.log('Login successful, sending response');
        // Send back both userId and token in the response
        res.status(200).json({ userId, token });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(401).json({ message: error.message });
    }
  }

  register = async (req, res, next) => {
    try {
      const user = await userService.registerUser(req.body);
      res.status(201).json({ message: 'Registrazione avvenuta con successo', user_id: user._id });
    } catch (error) {
      next(error);
    }
  }

  getUserInfo = async (req, res) => {
    try {
        // Use req.user.userId (extracted from the token) to find the user
        const user = await User.findById(req.user.userId).select('_id username email favorite_superhero credits password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Server error' });
    }
  }

  update = async (req, res, next) => {
    try {
      // Use userId from the JWT token
      const user = await userService.updateUser(req.user.userId, req.body);
      res.status(200).json({ message: 'Informazioni aggiornate con successo' });
    } catch (error) {
      next(error);
    }
  }

  delete = async (req, res, next) => {
    try {
      // Use userId from the JWT token
      await userService.deleteUser(req.user.userId);
      res.status(200).json({ message: 'Account eliminato con successo' });
    } catch (error) {
      next(error);
    }
  }

  buyCredits = async (req, res, next) => {
    try {
      // Use userId from the JWT token
      const { amount } = req.body;
      const credits = await userService.buyCredits(req.user.userId, amount);
      res.status(200).json({ message: 'Credits purchased successfully', credits });
    } catch (error) {
      next(error);
    }
  }

  buyCardPacket = async (req, res, next) =>{
    try {
      // Use userId from the JWT token
      const { packet_size } = req.body;
      const result = await userService.buyCardPacket(req.user.userId, packet_size);
      res.status(200).json({ message: 'Card packet purchased successfully', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
