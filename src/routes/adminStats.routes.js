const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/auth').adminAuth;
const stats = require('../controllers/adminStats.controller');

/**
 * @swagger
 * tags:
 *   name: AdminStats
 *   description: API thống kê cho admin
 */

/**
 * @swagger
 * /api/admin/stats/categories:
 *   get:
 *     summary: Thống kê số lượng phim theo từng thể loại
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thể loại và số lượng phim
 */
router.get('/admin/stats/categories', adminAuth, stats.statsByCategory);

/**
 * @swagger
 * /api/admin/stats/countries:
 *   get:
 *     summary: Thống kê số lượng phim theo từng quốc gia
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách quốc gia và số lượng phim
 */
router.get('/admin/stats/countries', adminAuth, stats.statsByCountry);

/**
 * @swagger
 * /api/admin/stats/top-rated:
 *   get:
 *     summary: Top phim có rating trung bình cao nhất
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim muốn lấy
 *     responses:
 *       200:
 *         description: Danh sách phim rating cao nhất
 */
router.get('/admin/stats/top-rated', adminAuth, stats.topRatedMovies);

/**
 * @swagger
 * /api/admin/stats/top-viewed:
 *   get:
 *     summary: Top phim có lượt xem cao nhất
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim muốn lấy
 *     responses:
 *       200:
 *         description: Danh sách phim view cao nhất
 */
router.get('/admin/stats/top-viewed', adminAuth, stats.topViewedMovies);

/**
 * @swagger
 * /api/admin/stats/top-favorite:
 *   get:
 *     summary: Top phim được yêu thích nhiều nhất
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim muốn lấy
 *     responses:
 *       200:
 *         description: Danh sách phim yêu thích nhiều nhất
 */
router.get('/admin/stats/top-favorite', adminAuth, stats.topFavoriteMovies);

/**
 * @swagger
 * /api/admin/stats/top-commented:
 *   get:
 *     summary: Top phim có nhiều bình luận nhất
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim muốn lấy
 *     responses:
 *       200:
 *         description: Danh sách phim nhiều bình luận nhất
 */
router.get('/admin/stats/top-commented', adminAuth, stats.topCommentedMovies);

module.exports = router; 