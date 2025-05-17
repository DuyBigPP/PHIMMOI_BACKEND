const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy danh sách phim
const getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const category = req.query.category;
    const country = req.query.country;
    const year = parseInt(req.query.year);
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.categories = {
        some: {
          categorySlug: category
        }
      };
    }
    
    if (country) {
      where.countries = {
        some: {
          countrySlug: country
        }
      };
    }
    
    if (year) {
      where.year = year;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Đếm tổng số phim
    const total = await prisma.movie.count({ where });

    // Lấy danh sách phim
    const movies = await prisma.movie.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
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
      }
    });

    return res.json({
      success: true,
      data: {
        movies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting movies:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Lấy chi tiết phim theo slug
const getMovieBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { slug },
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
        },
        actors: {
          include: {
            actor: true
          }
        },
        directors: {
          include: {
            director: true
          }
        },
        episodes: true
      }
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    return res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Error getting movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Lấy danh sách phim phổ biến
const getPopularMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;

    const where = {};
    if (type) {
      where.type = type;
    }

    const movies = await prisma.movie.findMany({
      where,
      take: limit,
      orderBy: {
        view: 'desc'
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
      }
    });

    return res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Error getting popular movies:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getMovies,
  getMovieBySlug,
  getPopularMovies
};