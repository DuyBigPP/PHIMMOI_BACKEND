const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tạo đánh giá mới
const createRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { score, review } = req.body;
    const userId = req.user.id;

    // Kiểm tra điểm đánh giá hợp lệ (1-5)
    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Điểm đánh giá phải từ 1 đến 5 sao'
      });
    }

    // Kiểm tra phim tồn tại
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    // Tạo hoặc cập nhật đánh giá
    const rating = await prisma.rating.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      },
      update: {
        score,
        review
      },
      create: {
        score,
        review,
        userId,
        movieId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Đánh giá phim thành công',
      data: rating
    });
  } catch (error) {
    console.error('Lỗi khi đánh giá phim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy đánh giá của một phim
const getMovieRatings = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Kiểm tra phim tồn tại
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    // Lấy tổng số đánh giá
    const total = await prisma.rating.count({
      where: { movieId }
    });

    // Lấy danh sách đánh giá
    const ratings = await prisma.rating.findMany({
      where: { movieId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Tính điểm trung bình
    const averageScore = await prisma.rating.aggregate({
      where: { movieId },
      _avg: {
        score: true
      }
    });

    return res.json({
      success: true,
      data: {
        ratings,
        averageScore: averageScore._avg.score || 0,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá phim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Xóa đánh giá
const deleteRating = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const rating = await prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    await prisma.rating.delete({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    return res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa đánh giá:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  createRating,
  getMovieRatings,
  deleteRating
}; 