const express = require('express');
const { getMovies, getMovieBySlug, getPopularMovies } = require('../controllers/movie.controller');

const router = express.Router();

router.get('/movies', getMovies);
router.get('/movies/popular', getPopularMovies);
router.get('/movies/:slug', getMovieBySlug);

module.exports = router; 