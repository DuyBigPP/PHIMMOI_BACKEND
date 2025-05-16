const express = require('express');
const { getMovies, getMovieBySlug } = require('../controllers/movie.controller');

const router = express.Router();

// Lấy danh sách phim
router.get('/', getMovies);

// Lấy chi tiết phim theo slug
router.get('/:slug', getMovieBySlug);

module.exports = router; 