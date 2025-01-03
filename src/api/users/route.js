// src/api/users/route.js
import express from 'express';
import userController from './controller.js';
import authenticateJWTMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - favorite_superhero
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the user (ObjectId)
 *         username:
 *           type: string
 *           description: Unique username of the user
 *         email:
 *           type: string
 *           description: Unique email of the user
 *         password:
 *           type: string
 *           description: User's password (hashed server-side, plain in requests)
 *         favorite_superhero:
 *           type: string
 *           description: The user's favorite superhero
 *         credits:
 *           type: integer
 *           description: The number of credits the user has
 *         album:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               card_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               available_quantity:
 *                 type: integer
 *       example:
 *         _id: 64aefecb5f1234abcd987654
 *         username: JohnDoe
 *         email: johndoe@example.com
 *         password: plainpassword
 *         favorite_superhero: Spider-Man
 *         credits: 0
 *         album: []
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

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
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User logged in successfully and token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       409:
 *         description: Email already in use
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
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: User not found
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: User not found
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
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: User not found
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
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's credits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 credits:
 *                   type: integer
 *               example:
 *                 message: Credits retrieved successfully
 *                 credits: 100
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: User not found
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
 *                 description: The number of credits to buy
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
 *                 credits:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (invalid or missing token)
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
 *     requestBody:
 *       description: Optionally, specify a different packet_size if your code supports it. (Currently read from .env)
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packet_size:
 *                 type: integer
 *                 description: The size of the card packet to buy
 *     responses:
 *       200:
 *         description: Card packet purchased successfully
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
 *                 newCards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       thumbnail:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: string
 *                           extension:
 *                             type: string
 *       400:
 *         description: Bad request (e.g. insufficient credits)
 *       401:
 *         description: Unauthorized (invalid or missing token)
 */
router.post('/buy-packet', authenticateJWTMiddleware, userController.buyCardPacket);

export default router;
