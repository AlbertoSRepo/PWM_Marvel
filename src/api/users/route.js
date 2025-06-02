import express from 'express';
import userController from './controller.js';
import authenticateJWTMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user and get a JWT token
 *     tags: [User]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully and token generated
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               favorite_superhero:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /users/info:
 *   get:
 *     summary: Get current user's information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/info', authenticateJWTMiddleware, userController.getUserInfo);

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.put('/update', authenticateJWTMiddleware, userController.update);

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     summary: Delete a user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/delete', authenticateJWTMiddleware, userController.delete);

/**
 * @swagger
 * /users/credits:
 *   get:
 *     summary: Retrieve the current user's credits
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/credits', authenticateJWTMiddleware, userController.getCredits);

/**
 * @swagger
 * /users/buy-credits:
 *   post:
 *     summary: Buy credits for a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 */
router.post('/buy-credits', authenticateJWTMiddleware, userController.buyCredits);

/**
 * @swagger
 * /users/buy-packet:
 *   post:
 *     summary: Buy a card packet for the user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.post('/buy-packet', authenticateJWTMiddleware, userController.buyCardPacket);

export default router;
