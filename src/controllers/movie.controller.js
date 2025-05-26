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
    const { categories, countries, actors, ...movieData } = req.body;

    // Validate required fields
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'categories is required and must be a non-empty array' });
    }
    if (!Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ success: false, message: 'countries is required and must be a non-empty array' });
    }

    // Handle uploaded files
    if (req.files) {
      if (req.files.poster) {
        movieData.posterUrl = req.files.poster[0].path;
      }
      if (req.files.thumb) {
        movieData.thumbUrl = req.files.thumb[0].path;
      }
    }

    // Chuyển đổi các trường boolean
    const booleanFields = ['isCopyright', 'subDocquyen', 'chieurap'];
    booleanFields.forEach(field => {
      if (movieData[field] !== undefined) {
        movieData[field] = movieData[field] === 'true' || movieData[field] === true;
      }
    });

    // Chuyển đổi các trường number
    const numberFields = ['year', 'tmdbVoteCount', 'tmdbVoteAverage'];
    numberFields.forEach(field => {
      if (movieData[field] !== undefined) {
        movieData[field] = Number(movieData[field]);
      }
    });

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

    // Tạo liên kết actor (nếu có)
    if (Array.isArray(actors) && actors.length > 0) {
      for (const actorName of actors) {
        // Tạo mới actor nếu chưa có
        let actor = await prisma.actor.findUnique({ where: { name: actorName } });
        if (!actor) {
          actor = await prisma.actor.create({ data: { name: actorName } });
        }
        // Tạo liên kết
        await prisma.movieActor.create({ data: { movieId: movie.id, actorName: actor.name } });
      }
    }

    // Lấy lại phim kèm categories/countries/actors
    const movieWithRelations = await prisma.movie.findUnique({
      where: { id: movie.id },
      include: {
        categories: { include: { category: true } },
        countries: { include: { country: true } },
        actors: { include: { actor: true } }
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
    const { categories, countries, actors, ...data } = req.body;

    // Handle uploaded files
    if (req.files) {
      if (req.files.poster) {
        data.posterUrl = req.files.poster[0].path;
      }
      if (req.files.thumb) {
        data.thumbUrl = req.files.thumb[0].path;
      }
    }

    // Chuyển đổi các trường boolean
    const booleanFields = ['isCopyright', 'subDocquyen', 'chieurap'];
    booleanFields.forEach(field => {
      if (data[field] !== undefined) {
        data[field] = data[field] === 'true' || data[field] === true;
      }
    });

    // Chuyển đổi các trường number
    const numberFields = ['year', 'tmdbVoteCount', 'tmdbVoteAverage'];
    numberFields.forEach(field => {
      if (data[field] !== undefined) {
        data[field] = Number(data[field]);
      }
    });

    // Remove undefined values
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    // Cập nhật phim
    const movie = await prisma.movie.update({
      where: { id },
      data
    });

    // Cập nhật lại categories nếu truyền lên
    if (Array.isArray(categories)) {
      // Xóa hết liên kết cũ
      await prisma.movieCategory.deleteMany({ where: { movieId: id } });
      // Tạo lại liên kết mới
      await Promise.all(categories.map(categorySlug =>
        prisma.movieCategory.create({ data: { movieId: id, categorySlug } })
      ));
    }

    // Cập nhật lại countries nếu truyền lên
    if (Array.isArray(countries)) {
      await prisma.movieCountry.deleteMany({ where: { movieId: id } });
      await Promise.all(countries.map(countrySlug =>
        prisma.movieCountry.create({ data: { movieId: id, countrySlug } })
      ));
    }

    // Cập nhật lại actors nếu truyền lên
    if (Array.isArray(actors)) {
      await prisma.movieActor.deleteMany({ where: { movieId: id } });
      for (const actorName of actors) {
        let actor = await prisma.actor.findUnique({ where: { name: actorName } });
        if (!actor) {
          actor = await prisma.actor.create({ data: { name: actorName } });
        }
        await prisma.movieActor.create({ data: { movieId: id, actorName: actor.name } });
      }
    }

    // Lấy lại phim kèm categories/countries/actors
    const movieWithRelations = await prisma.movie.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        countries: { include: { country: true } },
        actors: { include: { actor: true } }
      }
    });

    return res.json({
      success: true,
      data: movieWithRelations
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

// Thêm thể loại cho phim (Admin)
const addCategoryToMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { categorySlug } = req.body;
    // Kiểm tra tồn tại
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    // Kiểm tra đã có liên kết chưa
    const exist = await prisma.movieCategory.findUnique({ where: { movieId_categorySlug: { movieId, categorySlug } } });
    if (exist) return res.status(400).json({ success: false, message: 'Movie already has this category' });
    // Tạo liên kết
    await prisma.movieCategory.create({ data: { movieId, categorySlug } });
    return res.json({ success: true, message: 'Category added to movie' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Thêm quốc gia cho phim (Admin)
const addCountryToMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { countrySlug } = req.body;
    // Kiểm tra tồn tại
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    const country = await prisma.country.findUnique({ where: { slug: countrySlug } });
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });
    // Kiểm tra đã có liên kết chưa
    const exist = await prisma.movieCountry.findUnique({ where: { movieId_countrySlug: { movieId, countrySlug } } });
    if (exist) return res.status(400).json({ success: false, message: 'Movie already has this country' });
    // Tạo liên kết
    await prisma.movieCountry.create({ data: { movieId, countrySlug } });
    return res.json({ success: true, message: 'Country added to movie' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieBySlug,
  getPopularMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  addCategoryToMovie,
  addCountryToMovie
};