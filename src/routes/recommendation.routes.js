const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: API gợi ý phim liên quan và phim phổ biến
 */

/**
 * @swagger
 * /api/movies/{movieId}/related:
 *   get:
 *     summary: Lấy danh sách phim liên quan
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim liên quan muốn lấy
 *     responses:
 *       200:
 *         description: Lấy danh sách phim liên quan thành công
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
 *                     $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Không tìm thấy phim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies/:movieId/related', recommendationController.getRelatedMovies);

/**
 * @swagger
 * /api/movies/popular:
 *   get:
 *     summary: Lấy danh sách phim phổ biến
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số phim mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách phim phổ biến thành công
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
 *                     movies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/movies/popular', recommendationController.getPopularMovies);

module.exports = router; 