const express = require('express');
const { getMovies, getMovieBySlug, getPopularMovies } = require('../controllers/movie.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: API quản lý phim
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Lấy danh sách phim
 *     tags: [Movies]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Loại phim (single, series)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Slug của thể loại phim
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Slug của quốc gia
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm phát hành
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Lấy danh sách phim thành công
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
router.get('/movies', getMovies);

/**
 * @swagger
 * /api/movies/popular:
 *   get:
 *     summary: Lấy danh sách phim phổ biến
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim muốn lấy
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Loại phim (single, series)
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 */
router.get('/movies/popular', getPopularMovies);

/**
 * @swagger
 * /api/movies/{slug}:
 *   get:
 *     summary: Lấy chi tiết phim theo slug
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của phim
 *     responses:
 *       200:
 *         description: Lấy chi tiết phim thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Không tìm thấy phim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies/:slug', getMovieBySlug);

module.exports = router; 