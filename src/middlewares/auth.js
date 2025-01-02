import jwt from 'jsonwebtoken';

const authenticateJWTMiddleware = (req, res, next) => {
  const token = req.cookies.jwtToken;

  // 1) Se il token non esiste, gestisci come preferisci (JSON/redirect)
  if (!token) {
    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      return res.status(401).json({ message: 'Accesso negato, nessun token fornito' });
    } else {
      return res.redirect('/homeNoLogin');
    }
  }

  // 2) Verifica e decodifica il token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Controlla quanto manca alla scadenza
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - nowInSeconds; // exp è in secondi

    // Soglia di rinnovamento, es. 5 minuti (300 secondi)
    const RENEW_THRESHOLD = 300;

    // Se mancano meno di 5 minuti, rigenero il token
    if (timeLeft < RENEW_THRESHOLD) {
      // Ricrea il token con una nuova scadenza di 1 ora
      const newToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Reinvia il cookie con il nuovo token
      res.cookie('jwtToken', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });
    }

    // 4) Salva i dati dell’utente decodificati in req.user e vai avanti
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Token non valido:', error);

    // Gestione di token scaduto o non valido
    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
      return res.status(401).json({ message: 'Token non valido o scaduto' });
    } else {
      return res.redirect('/homeNoLogin');
    }
  }
};

export default authenticateJWTMiddleware;
