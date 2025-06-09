const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const os = require('os');

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

    // Sắp xếp các tập phim theo số thứ tự
    if (movie.episodes) {
      movie.episodes.sort((a, b) => {
        // Tách số từ tên tập phim
        const getEpisodeNumber = (name) => {
          const match = name.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };

        const numA = getEpisodeNumber(a.name);
        const numB = getEpisodeNumber(b.name);
        return numA - numB;
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
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Xử lý các trường mảng từ form data
    const categories = Array.isArray(req.body.categories) ? req.body.categories : 
                      req.body.categories ? req.body.categories.split(',') : [];
    const countries = Array.isArray(req.body.countries) ? req.body.countries : 
                     req.body.countries ? req.body.countries.split(',') : [];
    const actors = Array.isArray(req.body.actors) ? req.body.actors : 
                  req.body.actors ? req.body.actors.split(',') : [];

    const { categories: _, countries: __, actors: ___, ...movieData } = req.body;

    // Validate required fields
    if (categories.length === 0) {
      return res.status(400).json({ success: false, message: 'categories is required and must be a non-empty array' });
    }
    if (countries.length === 0) {
      return res.status(400).json({ success: false, message: 'countries is required and must be a non-empty array' });
    }

    // Validate required files
    if (!req.files || !req.files.poster || !req.files.thumb) {
      return res.status(400).json({ 
        success: false, 
        message: 'poster and thumb files are required' 
      });
    }

    // Xử lý upload file
    if (req.files) {
      console.log('Processing uploaded files...');
      const uploadPromises = [];

      if (req.files.poster && req.files.poster[0]) {
        const posterFile = req.files.poster[0];
        console.log('Poster file:', posterFile);
        
        try {
          const tempFilePath = path.join(os.tmpdir(), posterFile.originalname);
          await fs.promises.writeFile(tempFilePath, posterFile.buffer);
          
          const result = await cloudinary.uploader.upload(tempFilePath, {
            folder: 'movies/posters',
            resource_type: 'auto'
          });
          
          movieData.posterUrl = result.secure_url;
          
          // Xóa file tạm an toàn
          try {
            await fs.promises.unlink(tempFilePath);
          } catch (unlinkError) {
            console.warn('Warning: Could not delete temporary file:', unlinkError);
          }
        } catch (error) {
          console.error('Error uploading poster:', error);
          throw new Error('Failed to upload poster image');
        }
      }

      if (req.files.thumb && req.files.thumb[0]) {
        const thumbFile = req.files.thumb[0];
        console.log('Thumb file:', thumbFile);
        
        try {
          const tempFilePath = path.join(os.tmpdir(), thumbFile.originalname);
          await fs.promises.writeFile(tempFilePath, thumbFile.buffer);
          
          const result = await cloudinary.uploader.upload(tempFilePath, {
            folder: 'movies/thumbs',
            resource_type: 'auto'
          });
          
          movieData.thumbUrl = result.secure_url;
          
          // Xóa file tạm an toàn
          try {
            await fs.promises.unlink(tempFilePath);
          } catch (unlinkError) {
            console.warn('Warning: Could not delete temporary file:', unlinkError);
          }
        } catch (error) {
          console.error('Error uploading thumb:', error);
          throw new Error('Failed to upload thumb image');
        }
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
    const numberFields = ['year', 'tmdbVoteCount', 'tmdbVoteAverage', 'duration', 'rating', 'view'];
    numberFields.forEach(field => {
      if (movieData[field] !== undefined) {
        movieData[field] = Number(movieData[field]);
      }
    });

    console.log('Processed movie data:', movieData);
    console.log('Categories:', categories);
    console.log('Countries:', countries);
    console.log('Actors:', actors);

    // Kiểm tra xem slug đã tồn tại chưa
    const existingMovie = await prisma.movie.findUnique({
      where: { slug: movieData.slug }
    });

    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: `Movie with slug "${movieData.slug}" already exists`
      });
    }

    // Tạo phim
    const movie = await prisma.movie.create({
      data: {
        name: movieData.name,
        slug: movieData.slug,
        originName: movieData.originName,
        content: movieData.content,
        type: movieData.type,
        status: movieData.status,
        posterUrl: movieData.posterUrl,
        thumbUrl: movieData.thumbUrl,
        isCopyright: movieData.isCopyright,
        subDocquyen: movieData.subDocquyen,
        chieurap: movieData.chieurap,
        trailerUrl: movieData.trailerUrl,
        time: movieData.time,
        episodeCurrent: movieData.episodeCurrent,
        episodeTotal: movieData.episodeTotal,
        quality: movieData.quality,
        lang: movieData.lang,
        notify: movieData.notify,
        showtimes: movieData.showtimes,
        year: movieData.year,
        view: movieData.view || 0,
        tmdbId: movieData.tmdbId,
        tmdbType: movieData.tmdbType,
        tmdbVoteAverage: movieData.tmdbVoteAverage,
        tmdbVoteCount: movieData.tmdbVoteCount,
        imdbId: movieData.imdbId
      }
    });
    console.log('Created movie:', movie);

    // Tạo liên kết category
    await Promise.all(categories.map(categorySlug =>
      prisma.movieCategory.create({ data: { movieId: movie.id, categorySlug } })
    ));

    // Tạo liên kết country
    await Promise.all(countries.map(countrySlug =>
      prisma.movieCountry.create({ data: { movieId: movie.id, countrySlug } })
    ));

    // Tạo liên kết actor
    if (actors.length > 0) {
      await Promise.all(actors.map(async (actorName) => {
        // Tìm hoặc tạo actor
        const actor = await prisma.actor.upsert({
          where: { name: actorName },
          update: {},
          create: { name: actorName }
        });
        // Tạo liên kết
        return prisma.movieActor.create({
          data: {
            movieId: movie.id,
            actorName: actor.name
          }
        });
      }));
    }

    // Lấy phim vừa tạo với các thông tin liên quan
    const createdMovie = await prisma.movie.findUnique({
      where: { id: movie.id },
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
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: createdMovie
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
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

    // Lấy thông tin phim trước khi xóa để có URL của poster và thumb
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        episodes: true
      }
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Xóa các bản ghi liên quan
    await prisma.$transaction([
      // Xóa ratings
      prisma.rating.deleteMany({
        where: { movieId: id }
      }),
      // Xóa favorites
      prisma.favorite.deleteMany({
        where: { movieId: id }
      }),
      // Xóa comments
      prisma.comment.deleteMany({
        where: { movieId: id }
      }),
      // Xóa movie-category relationships
      prisma.movieCategory.deleteMany({
        where: { movieId: id }
      }),
      // Xóa movie-country relationships
      prisma.movieCountry.deleteMany({
        where: { movieId: id }
      }),
      // Xóa movie-actor relationships
      prisma.movieActor.deleteMany({
        where: { movieId: id }
      }),
      // Xóa episodes
      prisma.episode.deleteMany({
        where: { movieId: id }
      }),
      // Xóa phim
      prisma.movie.delete({
        where: { id }
      })
    ]);

    // Xóa files trên Cloudinary
    if (movie.posterUrl) {
      const posterPublicId = movie.posterUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(posterPublicId);
    }
    if (movie.thumbUrl) {
      const thumbPublicId = movie.thumbUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(thumbPublicId);
    }

    // Xóa video của các tập phim
    for (const episode of movie.episodes) {
      if (episode.videoUrl) {
        const videoPublicId = episode.videoUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });
      }
    }

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