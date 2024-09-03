// src/api/v1/users/route.js

import express from 'express';
import userController from './controller.js';

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
 *         username:
 *           type: string
 *           description: Unique username of the user
 *         email:
 *           type: string
 *           description: Unique email of the user
 *         password:
 *           type: string
 *           description: User's password
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
 *         username: JohnDoe
 *         email: johndoe@example.com
 *         password: plainpassword
 *         favorite_superhero: Spider-Man
 *         credits: 0
 *         album: []
 */

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
 *                 user_id:
 *                   type: string
 *       400:
 *         description: Bad request
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the user to update
 *               username:
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
 *       400:
 *         description: Bad request
 */
router.put('/update', userController.update);

/**
 * @swagger
 * /users/delete:
 *   delete:
 *     summary: Delete a user account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
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
 *       400:
 *         description: Bad request
 */
router.delete('/delete', userController.delete);

/**
 * @swagger
 * /users/buy-credits:
 *   post:
 *     summary: Buy credits for a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the user
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
 */
router.post('/buy-credits', userController.buyCredits);

/**
 * @swagger
 * /users/buy-packet:
 *   post:
 *     summary: Buy a card packet for a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: The ID of the user
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
 *                 credits:
 *                   type: integer
 *                 newCards:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: The card IDs in the purchased packet
 *       400:
 *         description: Bad request
 */
router.post('/buy-packet', userController.buyCardPacket);

export default router;
