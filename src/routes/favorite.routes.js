const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favorite.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API quản lý phim yêu thích
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Lấy danh sách phim yêu thích của user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách phim yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 */
router.get('/favorites', auth, getFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Thêm phim vào danh sách yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: ID của phim
 *     responses:
 *       201:
 *         description: Thêm vào danh sách yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Lỗi dữ liệu đầu vào hoặc đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/favorites', auth, addFavorite);

/**
 * @swagger
 * /api/favorites:
 *   delete:
 *     summary: Xóa phim khỏi danh sách yêu thích
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: ID của phim
 *     responses:
 *       200:
 *         description: Xóa khỏi danh sách yêu thích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/favorites', auth, removeFavorite);

module.exports = router; 