const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { createCategory } = require('../controllers/category.controller');

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Thêm mới thể loại (Admin)
 *     tags: [Categories]
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
 *         description: Thêm thể loại thành công
 */
router.post('/categories', adminAuth, createCategory);

module.exports = router; 