const express = require('express');
const router = express.Router();
const movieController = require('../../controllers/admin/movie.controller');
const { adminAuth } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Movies
 *   description: API quản lý phim cho admin
 */

/**
 * @swagger
 * /api/admin/movies:
 *   post:
 *     summary: Thêm phim mới
 *     description: |
 *       API này cho phép admin thêm một phim mới vào hệ thống.
 *       
 *       ### Các bước thêm phim:
 *       1. Chuẩn bị thông tin phim:
 *          - Tên phim (name)
 *          - Slug phim (slug)
 *          - Tên gốc (origin_name)
 *          - Mô tả (content)
 *          - Loại phim (type): single hoặc series
 *          - URL poster (poster_url)
 *          - URL thumbnail (thumb_url)
 *          - URL trailer (trailer_url)
 *          - Thời lượng (time)
 *          - Chất lượng (quality)
 *          - Ngôn ngữ (lang)
 *          - Năm sản xuất (year)
 *       
 *       2. Thêm thông tin diễn viên và đạo diễn:
 *          - Danh sách tên diễn viên (actor)
 *          - Danh sách tên đạo diễn (director)
 *       
 *       3. Chọn thể loại và quốc gia:
 *          - Danh sách thể loại (category): mỗi thể loại cần có id, name, slug
 *          - Danh sách quốc gia (country): mỗi quốc gia cần có id, name, slug
 *       
 *       4. Thêm thông tin tập phim:
 *          - Danh sách server (episodes)
 *          - Mỗi server có tên (server_name) và danh sách tập phim (server_data)
 *          - Mỗi tập phim cần có tên (name), slug, link m3u8 và link embed
 *       
 *       ### Ví dụ request body:
 *       ```json
 *       {
 *         "name": "Buồng Giam Mặt Nạ",
 *         "slug": "buong-giam-mat-na",
 *         "origin_name": "Masked Ward",
 *         "content": "Phim Buồng Giam Mặt Nạ...",
 *         "type": "single",
 *         "poster_url": "https://phimimg.com/...",
 *         "thumb_url": "https://phimimg.com/...",
 *         "trailer_url": "https://www.youtube.com/...",
 *         "time": "114 phút",
 *         "quality": "HD",
 *         "lang": "Vietsub + Thuyết Minh",
 *         "year": 2020,
 *         "actor": ["Aki Asakura", "Kentaro Sakaguchi", "Mei Nagano"],
 *         "director": ["Hisashi Kimura"],
 *         "category": [
 *           {
 *             "id": "a7b065b92ad356387ef2e075dee66529",
 *             "name": "Tâm Lý",
 *             "slug": "tam-ly"
 *           }
 *         ],
 *         "country": [
 *           {
 *             "id": "d4097fbffa8f7149a61281437171eb83",
 *             "name": "Nhật Bản",
 *             "slug": "nhat-ban"
 *           }
 *         ],
 *         "episodes": [
 *           {
 *             "server_name": "#Hà Nội (Vietsub)",
 *             "server_data": [
 *               {
 *                 "name": "Full",
 *                 "slug": "full",
 *                 "link_m3u8": "https://s5.phim1280.tv/...",
 *                 "link_embed": "https://player.phimapi.com/..."
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *       ```
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovieRequest'
 *     responses:
 *       201:
 *         description: Thêm phim thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tạo phim thành công
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Phim đã tồn tại trong hệ thống
 *       401:
 *         description: Chưa đăng nhập hoặc không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.post('/movies', adminAuth, movieController.createMovie);

/**
 * @swagger
 * /api/admin/movies/{movieId}:
 *   put:
 *     summary: Cập nhật thông tin phim
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
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
 *               originName:
 *                 type: string
 *               type:
 *                 type: string
 *               poster:
 *                 type: string
 *               backdrop:
 *                 type: string
 *               description:
 *                 type: string
 *               year:
 *                 type: integer
 *               duration:
 *                 type: integer
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               countryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật phim thành công
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
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc không có quyền admin
 *       404:
 *         description: Không tìm thấy phim
 *       500:
 *         description: Lỗi server
 */
router.put('/movies/:movieId', adminAuth, movieController.updateMovie);

/**
 * @swagger
 * /api/admin/movies/{movieId}:
 *   delete:
 *     summary: Xóa phim
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
 *     responses:
 *       200:
 *         description: Xóa phim thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Chưa đăng nhập hoặc không có quyền admin
 *       404:
 *         description: Không tìm thấy phim
 *       500:
 *         description: Lỗi server
 */
router.delete('/movies/:movieId', adminAuth, movieController.deleteMovie);

/**
 * @swagger
 * /api/admin/movies:
 *   get:
 *     summary: Lấy danh sách phim (có phân trang và tìm kiếm)
 *     tags: [Admin Movies]
 *     security:
 *       - bearerAuth: []
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Loại phim (movie/series)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: ID thể loại
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *         description: ID quốc gia
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm sản xuất
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
 *       401:
 *         description: Chưa đăng nhập hoặc không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/movies', adminAuth, movieController.getMovies);

module.exports = router; 