import express from 'express';
import userController from './controller.js';
import authenticateJWTMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - favorite_superhero
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Unique username
 *                 example: "JohnDoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password
 *                 example: "securePassword123"
 *               favorite_superhero:
 *                 type: string
 *                 description: User's favorite superhero
 *                 example: "Spider-Man"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registrazione avvenuta con successo"
 *                 user_id:
 *                   type: string
 *                   example: "60d5ec49b60e3f4d9c31a2b8"
 *         headers:
 *           Set-Cookie:
 *             description: JWT token cookie
 *             schema:
 *               type: string
 *               example: "jwtToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=3600"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Email già in uso"
 *               statusCode: 409
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: User ID
 *                   example: "60d5ec49b60e3f4d9c31a2b8"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         headers:
 *           Set-Cookie:
 *             description: JWT token cookie
 *             schema:
 *               type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Credenziali non valide"
 *               statusCode: 401
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /users/info:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/info', authenticateJWTMiddleware, userController.getUserInfo);

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: New username
 *                 example: "NewUsername"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address
 *                 example: "newemail@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (optional)
 *                 example: "newSecurePassword123"
 *               favorite_superhero:
 *                 type: string
 *                 description: New favorite superhero
 *                 example: "Iron Man"
 *     responses:
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Informazioni aggiornate con successo"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Email already in use by another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/update', authenticateJWTMiddleware, userController.update);

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Account eliminato con successo"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/delete', authenticateJWTMiddleware, userController.delete);

/**
 * @swagger
 * /users/credits:
 *   get:
 *     summary: Get user credits
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User credits retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 credits:
 *                   type: integer
 *                   minimum: 0
 *                   description: Current user credits
 *                   example: 150
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/credits', authenticateJWTMiddleware, userController.getCredits);


/**
 * @swagger
 * /users/buy-credits:
 *   post:
 *     summary: Buy credits for a user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 description: The number of credits to buy
 *                 example: 10
 *     responses:
 *       200:
 *         description: Credits purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Credits purchased successfully"
 *                 credits:
 *                   type: integer
 *                   description: User's total credits after purchase
 *                   example: 150
 *       400:
 *         description: Invalid credit amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Amount di crediti non valido"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utente non trovato"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/buy-credits', authenticateJWTMiddleware, userController.buyCredits);

/**
 * @swagger
 * /users/buy-packet:
 *   post:
 *     summary: Buy a card packet for a user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Packet purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 credits:
 *                   type: integer
 *                 purchasedCardIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         description: Insufficient credits
 */
router.post('/buy-packet', authenticateJWTMiddleware, userController.buyCardPacket);

export default router;
