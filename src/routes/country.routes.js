const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { createCountry } = require('../controllers/country.controller');

/**
 * @swagger
 * /api/countries:
 *   post:
 *     summary: Thêm mới quốc gia (Admin)
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thêm quốc gia thành công
 */
router.post('/countries', adminAuth, createCountry);

module.exports = router; 