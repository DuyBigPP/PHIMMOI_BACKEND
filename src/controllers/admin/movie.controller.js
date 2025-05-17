const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tạo phim mới
const createMovie = async (req, res) => {
  try {
    const {
      name,
      slug,
      origin_name,
      content,
      type,
      poster_url,
      thumb_url,
      trailer_url,
      time,
      quality,
      lang,
      year,
      actor,
      director,
      category,
      country,
      episodes
    } = req.body;

    // Kiểm tra phim đã tồn tại chưa
    const existingMovie = await prisma.movie.findFirst({
      where: {
        OR: [
          { slug },
          { name }
        ]
      }
    });

    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: 'Phim đã tồn tại trong hệ thống'
      });
    }

    // Tạo phim mới
    const movie = await prisma.movie.create({
      data: {
        name,
        slug,
        originName: origin_name,
        description: content,
        type: type === 'single' ? 'movie' : 'series',
        poster: poster_url,
        backdrop: thumb_url,
        trailerUrl: trailer_url,
        duration: parseInt(time),
        quality,
        language: lang,
        year,
        categories: {
          create: category.map(cat => ({
            category: {
              connect: { id: cat.id }
            }
          }))
        },
        countries: {
          create: country.map(c => ({
            country: {
              connect: { id: c.id }
            }
          }))
        },
        actors: {
          create: actor.map(actorName => ({
            actor: {
              connectOrCreate: {
                where: { name: actorName },
                create: { name: actorName }
              }
            }
          }))
        },
        directors: {
          create: director.map(directorName => ({
            director: {
              connectOrCreate: {
                where: { name: directorName },
                create: { name: directorName }
              }
            }
          }))
        },
        episodes: {
          create: episodes.map(server => ({
            server: server.server_name,
            links: {
              create: server.server_data.map(episode => ({
                name: episode.name,
                slug: episode.slug,
                url: episode.link_m3u8,
                embedUrl: episode.link_embed
              }))
            }
          }))
        }
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
        episodes: {
          include: {
            links: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo phim thành công',
      data: movie
    });
  } catch (error) {
    console.error('Lỗi khi tạo phim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Cập nhật thông tin phim
const updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const {
      name,
      slug,
      origin_name,
      content,
      type,
      poster_url,
      thumb_url,
      trailer_url,
      time,
      quality,
      lang,
      year,
      actor,
      director,
      category,
      country,
      episodes
    } = req.body;

    // Kiểm tra phim tồn tại
    const existingMovie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        episodes: {
          include: {
            links: true
          }
        }
      }
    });

    if (!existingMovie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    // Kiểm tra slug/name trùng lặp
    if (slug !== existingMovie.slug || name !== existingMovie.name) {
      const duplicateMovie = await prisma.movie.findFirst({
        where: {
          OR: [
            { slug },
            { name }
          ],
          NOT: {
            id: movieId
          }
        }
      });

      if (duplicateMovie) {
        return res.status(400).json({
          success: false,
          message: 'Tên phim hoặc slug đã tồn tại'
        });
      }
    }

    // Cập nhật phim
    const movie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        name,
        slug,
        originName: origin_name,
        description: content,
        type: type === 'single' ? 'movie' : 'series',
        poster: poster_url,
        backdrop: thumb_url,
        trailerUrl: trailer_url,
        duration: parseInt(time),
        quality,
        language: lang,
        year,
        categories: {
          deleteMany: {},
          create: category.map(cat => ({
            category: {
              connect: { id: cat.id }
            }
          }))
        },
        countries: {
          deleteMany: {},
          create: country.map(c => ({
            country: {
              connect: { id: c.id }
            }
          }))
        },
        actors: {
          deleteMany: {},
          create: actor.map(actorName => ({
            actor: {
              connectOrCreate: {
                where: { name: actorName },
                create: { name: actorName }
              }
            }
          }))
        },
        directors: {
          deleteMany: {},
          create: director.map(directorName => ({
            director: {
              connectOrCreate: {
                where: { name: directorName },
                create: { name: directorName }
              }
            }
          }))
        },
        episodes: {
          deleteMany: {},
          create: episodes.map(server => ({
            server: server.server_name,
            links: {
              create: server.server_data.map(episode => ({
                name: episode.name,
                slug: episode.slug,
                url: episode.link_m3u8,
                embedUrl: episode.link_embed
              }))
            }
          }))
        }
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
        episodes: {
          include: {
            links: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Cập nhật phim thành công',
      data: movie
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật phim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Xóa phim
const deleteMovie = async (req, res) => {
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

    // Xóa phim
    await prisma.movie.delete({
      where: { id: movieId }
    });

    return res.json({
      success: true,
      message: 'Xóa phim thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa phim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy danh sách phim (có phân trang và tìm kiếm)
const getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type,
      categoryId,
      countryId,
      year
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Xây dựng điều kiện tìm kiếm
    const where = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { originName: { contains: search, mode: 'insensitive' } }
      ]
    };

    if (type) where.type = type;
    if (year) where.year = parseInt(year);
    if (categoryId) {
      where.categories = {
        some: {
          categoryId
        }
      };
    }
    if (countryId) {
      where.countries = {
        some: {
          countryId
        }
      };
    }

    // Lấy tổng số phim
    const total = await prisma.movie.count({ where });

    // Lấy danh sách phim
    const movies = await prisma.movie.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
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
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phim:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  createMovie,
  updateMovie,
  deleteMovie,
  getMovies
}; 