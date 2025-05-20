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

// Thêm phim (Admin)
const createMovie = async (req, res) => {
  try {
    const { categories, countries, ...movieData } = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'categories is required and must be a non-empty array' });
    }
    if (!Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ success: false, message: 'countries is required and must be a non-empty array' });
    }
    // Tạo phim
    const movie = await prisma.movie.create({ data: movieData });
    // Tạo liên kết category
    await Promise.all(categories.map(categorySlug =>
      prisma.movieCategory.create({ data: { movieId: movie.id, categorySlug } })
    ));
    // Tạo liên kết country
    await Promise.all(countries.map(countrySlug =>
      prisma.movieCountry.create({ data: { movieId: movie.id, countrySlug } })
    ));
    // Lấy lại phim kèm categories/countries
    const movieWithRelations = await prisma.movie.findUnique({
      where: { id: movie.id },
      include: {
        categories: { include: { category: true } },
        countries: { include: { country: true } }
      }
    });
    return res.status(201).json({
      success: true,
      data: movieWithRelations
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Sửa phim (Admin)
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const movie = await prisma.movie.update({
      where: { id },
      data
    });
    return res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Error updating movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Xóa phim (Admin)
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.movie.delete({
      where: { id }
    });
    return res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getMovies,
  getMovieBySlug,
  getPopularMovies,
  createMovie,
  updateMovie,
  deleteMovie
};