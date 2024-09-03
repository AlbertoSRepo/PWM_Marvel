// src/api/v1/users/controller.js
import userService from './service.js';

class UserController {
  register = async (req, res, next) => {
    try {
      const user = await userService.registerUser(req.body);
      res.status(201).json({ message: 'Registrazione avvenuta con successo', user_id: user._id });
    } catch (error) {
      next(error);
    }
  }

  update = async (req, res, next) => {
    try {
      const user = await userService.updateUser(req.body.user_id, req.body);
      res.status(200).json({ message: 'Informazioni aggiornate con successo' });
    } catch (error) {
      next(error);
    }
  }

  delete = async (req, res, next) => {
    try {
      await userService.deleteUser(req.body.user_id);
      res.status(200).json({ message: 'Account eliminato con successo' });
    } catch (error) {
      next(error);
    }
  }

  buyCredits = async (req, res, next) => {
    try {
      const { user_id, amount } = req.body;
      const credits = await userService.buyCredits(user_id, amount);
      res.status(200).json({ message: 'Credits purchased successfully', credits });
    } catch (error) {
      next(error);
    }
  }

  buyCardPacket = async (req, res, next) =>{
    try {
      const { user_id, packet_size } = req.body;
      const result = await userService.buyCardPacket(user_id, packet_size);
      res.status(200).json({ message: 'Card packet purchased successfully', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
