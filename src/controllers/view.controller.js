const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tăng lượt xem cho phim
const incrementView = async (req, res) => {
  try {
    const { movieId } = req.params;

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

    // Tăng lượt xem
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        view: {
          increment: 1
        }
      }
    });

    return res.json({
      success: true,
      message: 'Cập nhật lượt xem thành công',
      data: {
        view: updatedMovie.view
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật lượt xem:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy thống kê lượt xem theo thời gian
const getViewStats = async (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month', 'year'
    const limit = parseInt(req.query.limit) || 10;

    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'day':
        dateFilter = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        dateFilter = new Date(now.setDate(now.getDate() - 7)); // Mặc định là 1 tuần
    }

    // Lấy danh sách phim có lượt xem cao nhất trong khoảng thời gian
    const topMovies = await prisma.movie.findMany({
      where: {
        updatedAt: {
          gte: dateFilter
        }
      },
      orderBy: {
        view: 'desc'
      },
      take: limit,
      select: {
        id: true,
        name: true,
        view: true,
        posterUrl: true,
        updatedAt: true
      }
    });

    // Tính tổng lượt xem
    const totalViews = await prisma.movie.aggregate({
      where: {
        updatedAt: {
          gte: dateFilter
        }
      },
      _sum: {
        view: true
      }
    });

    return res.json({
      success: true,
      data: {
        period,
        totalViews: totalViews._sum.view || 0,
        topMovies
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê lượt xem:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  incrementView,
  getViewStats
}; 