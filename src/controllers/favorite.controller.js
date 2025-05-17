const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Thêm/xóa phim khỏi danh sách yêu thích
const toggleFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

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

    // Kiểm tra phim đã được yêu thích chưa
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (existingFavorite) {
      // Nếu đã yêu thích thì xóa
      await prisma.favorite.delete({
        where: {
          userId_movieId: {
            userId,
            movieId
          }
        }
      });

      return res.json({
        success: true,
        message: 'Đã xóa khỏi danh sách yêu thích',
        data: {
          isFavorite: false
        }
      });
    } else {
      // Nếu chưa yêu thích thì thêm vào
      await prisma.favorite.create({
        data: {
          userId,
          movieId
        }
      });

      return res.json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        data: {
          isFavorite: true
        }
      });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái yêu thích:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy danh sách phim yêu thích
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy tổng số phim yêu thích
    const total = await prisma.favorite.count({
      where: { userId }
    });

    // Lấy danh sách phim yêu thích
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        movie: {
          include: {
            categories: {
              include: {
                category: true
              }
            },
            countries: {
              include: {
                country: true
              }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      data: {
        favorites: favorites.map(f => f.movie),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Kiểm tra trạng thái yêu thích của một phim
const checkFavoriteStatus = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    return res.json({
      success: true,
      data: {
        isFavorite: !!favorite
      }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  checkFavoriteStatus
}; 