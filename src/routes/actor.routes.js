const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { createActor } = require('../controllers/actor.controller');

/**
 * @swagger
 * /api/actors:
 *   post:
 *     summary: Thêm mới diễn viên (Admin)
 *     tags: [Actors]
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
 *     responses:
 *       201:
 *         description: Thêm diễn viên thành công
 */
router.post('/actors', adminAuth, createActor);

module.exports = router; 