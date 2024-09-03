// src/server.js
import dotenv from 'dotenv';
import startServer from './app.js';

dotenv.config();

startServer().then(app => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Server failed to start:', error);
});
