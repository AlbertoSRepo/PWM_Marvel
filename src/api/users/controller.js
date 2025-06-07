import userService from './service.js';

class UserController {
  // 1) LOGIN
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await userService.loginUser(email, password);

      // Impostiamo il cookie, se serve
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
      const { username, email, password, favorite_superhero } = req.body;
      const { user, token } = await userService.registerUser({
        username,
        email,
        password,
        favorite_superhero
      });

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
      const userId = req.user.userId;  // dal token JWT
      const user = await userService.getUserInfo(userId);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  // 4) UPDATE USER
  update = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const updatedUser = await userService.updateUser(userId, req.body);
      
      // Il service ora dovrebbe restituire l'utente aggiornato o lanciare un errore se non trovato
      res.status(200).json({ 
        message: 'Informazioni aggiornate con successo',
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          favorite_superhero: updatedUser.favorite_superhero
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 5) DELETE USER
  delete = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      await userService.deleteUser(userId);
      res.status(200).json({ message: 'Account eliminato con successo' });
    } catch (error) {
      next(error);
    }
  }

  // 6) GET CREDITS
  getCredits = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const credits = await userService.getCreditsAmount(userId);
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
      const userId = req.user.userId;
      const { amount } = req.body;
      const credits = await userService.buyCredits(userId, amount);

      res.status(200).json({ message: 'Credits purchased successfully', credits });
    } catch (error) {
      next(error);
    }
  }

  // 8) BUY CARD PACKET
  buyCardPacket = async (req, res, next) => {
    try {
      const userId = req.user.userId;

      // Esempio: packet_size se lo passassi dal body (opzionale)
      // const { packet_size } = req.body; 
      // In service puoi decidere se ignorarlo o sovrascrivere .env

      const result = await userService.buyCardPacket(userId);
      // result = { success, credits, purchasedCardIds: [...], ... }

      res.status(200).json({
        message: 'Card packet purchased successfully',
        success: result.success,
        credits: result.credits,
        purchasedCardIds: result.purchasedCardIds
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
