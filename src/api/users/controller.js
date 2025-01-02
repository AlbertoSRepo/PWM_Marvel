//src/api/users/controller.js
import userService from './service.js';
import { User } from './model.js';

class UserController {
  login = async (req, res, next) => {
    try {
      await userService.loginUser(req.body, res);
      res.status(200).json({ message: 'Login avvenuto con successo' });
    } catch (error) {
      next(error);
    }
  }

  register = async (req, res, next) => {
    try {
      await userService.registerUser(req.body, res);
      res.status(201).json({ message: 'Registrazione avvenuta con successo' });
    } catch (error) {
      next(error);
    }
  };

  getUserInfo = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('_id username email favorite_superhero credits password');

      if (!user) {
        const error = new Error('Utente non trovato');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  update = async (req, res, next) => {
    try {
      await userService.updateUser(req.user.userId, req.body);

      res.status(200).json({ message: 'Informazioni aggiornate con successo' });
    } catch (error) {
      next(error);
    }
  }

  delete = async (req, res, next) => {
    try {
      await userService.deleteUser(req.user.userId);
      res.status(200).json({ message: 'Account eliminato con successo' });
    } catch (error) {
      next(error);
    }
  }

  getCredits = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      res.status(200).json({ message: 'Credits purchased successfully', credits: user.credits });
    } catch (error) {
      next(error);
    }
  }

  buyCredits = async (req, res, next) => {
    try {
      const { amount } = req.body;
      const credits = await userService.buyCredits(req.user.userId, amount);
      res.status(200).json({ message: 'Credits purchased successfully', credits });
    } catch (error) {
      next(error);
    }
  }

  buyCardPacket = async (req, res, next) => {
    try {
      const { packet_size } = req.body;
      const result = await userService.buyCardPacket(req.user.userId, packet_size);
      res.status(200).json({ message: 'Card packet purchased successfully', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
