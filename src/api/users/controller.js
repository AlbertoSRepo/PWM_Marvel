import userService from './service.js';

class UserController {
  // 1) LOGIN
  login = async (req, res, next) => {
    try {
      const { token, user } = await userService.loginUser(req.body);

      res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });

      return res.status(200).json({
        message: 'Login avvenuto con successo',
        user: { _id: user._id, email: user.email }
      });
    } catch (error) {
      next(error);
    }
  }

  // 2) REGISTER
  register = async (req, res, next) => {
    try {
      const { user, token } = await userService.registerUser(req.body);

      res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });

      return res.status(201).json({
        message: 'Registrazione avvenuta con successo',
        user: { _id: user._id, email: user.email }
      });
    } catch (error) {
      next(error);
    }
  };

  // 3) GET USER INFO
  getUserInfo = async (req, res, next) => {
    try {
      const user = await userService.getUserInfo(req.user.userId);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  // 4) UPDATE USER
  update = async (req, res, next) => {
    try {
      await userService.updateUser(req.user.userId, req.body);
      res.status(200).json({ message: 'Informazioni aggiornate con successo' });
    } catch (error) {
      next(error);
    }
  }

  // 5) DELETE USER
  delete = async (req, res, next) => {
    try {
      await userService.deleteUser(req.user.userId);
      res.status(200).json({ message: 'Account eliminato con successo' });
    } catch (error) {
      next(error);
    }
  }

  // 6) GET CREDITS
  getCredits = async (req, res, next) => {
    try {
      const credits = await userService.getCreditsAmount(req.user.userId);
      res.status(200).json({
        message: 'Credits retrieved successfully',
        credits
      });
    } catch (error) {
      next(error);
    }
  }

  // 7) BUY CREDITS
  buyCredits = async (req, res, next) => {
    try {
      const { amount } = req.body;
      const credits = await userService.buyCredits(req.user.userId, amount);
      res.status(200).json({ message: 'Credits purchased successfully', credits });
    } catch (error) {
      next(error);
    }
  }

  // 8) BUY CARD PACKET
  buyCardPacket = async (req, res, next) => {
    try {
      // Nel service carichiamo packetSize e packetCost da .env
      const result = await userService.buyCardPacket(req.user.userId);
      res.status(200).json({ message: 'Card packet purchased successfully', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
