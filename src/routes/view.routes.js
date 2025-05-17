const express = require('express');
const router = express.Router();
const viewController = require('../controllers/view.controller');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Views
 *   description: API quản lý lượt xem phim
 */

/**
 * @swagger
 * /api/movies/{movieId}/view:
 *   post:
 *     summary: Tăng lượt xem cho phim
 *     tags: [Views]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
 *     responses:
 *       200:
 *         description: Cập nhật lượt xem thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     view:
 *                       type: integer
 *       404:
 *         description: Không tìm thấy phim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/movies/:movieId/view', viewController.incrementView);

/**
 * @swagger
 * /api/movies/views/stats:
 *   get:
 *     summary: Lấy thống kê lượt xem
 *     tags: [Views]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *         description: Khoảng thời gian thống kê
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim muốn lấy
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     totalViews:
 *                       type: integer
 *                     topMovies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           view:
 *                             type: integer
 *                           posterUrl:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies/views/stats', adminAuth, viewController.getViewStats);

module.exports = router; 