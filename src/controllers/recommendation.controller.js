const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy phim liên quan theo thể loại và quốc gia
const getRelatedMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Lấy thông tin phim hiện tại
    const currentMovie = await prisma.movie.findUnique({
      where: { id: movieId },
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
    });

    if (!currentMovie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    // Lấy danh sách thể loại và quốc gia của phim hiện tại
    const categorySlugs = currentMovie.categories.map(c => c.category.slug);
    const countrySlugs = currentMovie.countries.map(c => c.country.slug);

    // Tìm phim liên quan
    const relatedMovies = await prisma.movie.findMany({
      where: {
        AND: [
          { id: { not: movieId } }, // Loại bỏ phim hiện tại
          {
            OR: [
              // Phim cùng thể loại
              {
                categories: {
                  some: {
                    categorySlug: {
                      in: categorySlugs
                    }
                  }
                }
              },
              // Phim cùng quốc gia
              {
                countries: {
                  some: {
                    countrySlug: {
                      in: countrySlugs
                    }
                  }
                }
              }
            ]
          }
        ]
      },
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
      },
      orderBy: {
        view: 'desc' // Sắp xếp theo lượt xem
      },
      take: limit
    });

    return res.json({
      success: true,
      data: relatedMovies
    });
  } catch (error) {
    console.error('Lỗi khi lấy phim liên quan:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy phim phổ biến (có lượt xem cao)
const getPopularMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Lấy tổng số phim
    const total = await prisma.movie.count();

    // Lấy danh sách phim phổ biến
    const popularMovies = await prisma.movie.findMany({
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
      },
      orderBy: {
        view: 'desc' // Sắp xếp theo lượt xem
      },
      skip,
      take: limit
    });

    return res.json({
      success: true,
      data: {
        movies: popularMovies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy phim phổ biến:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  getRelatedMovies,
  getPopularMovies
}; 