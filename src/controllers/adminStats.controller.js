const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Thống kê số lượng phim theo từng thể loại
const statsByCategory = async (req, res) => {
  try {
    const result = await prisma.category.findMany({
      include: {
        _count: {
          select: { movies: true }
        }
      }
    });
    return res.json({ success: true, data: result.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      movieCount: c._count.movies
    })) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// 2. Thống kê số lượng phim theo từng quốc gia
const statsByCountry = async (req, res) => {
  try {
    const result = await prisma.country.findMany({
      include: {
        _count: {
          select: { movies: true }
        }
      }
    });
    return res.json({ success: true, data: result.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      movieCount: c._count.movies
    })) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// 3. Top phim có rating trung bình cao nhất (dùng raw SQL)
const topRatedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await prisma.$queryRaw`
      SELECT
        m.id,
        m.name,
        m.slug,
        m."originName",
        m."posterUrl",
        m."thumbUrl",
        m.year,
        m.view,
        AVG(r.score) as average_rating,
        COUNT(r.id) as rating_count
      FROM "Movie" m
      JOIN "Rating" r ON m.id = r."movieId"
      GROUP BY m.id
      HAVING COUNT(r.id) > 0
      ORDER BY average_rating DESC, rating_count DESC
      LIMIT ${limit}
    `;
    // Convert BigInt fields to string
    const safeResult = result.map(row => {
      const obj = {};
      for (const key in row) {
        if (typeof row[key] === 'bigint') {
          obj[key] = row[key].toString();
        } else {
          obj[key] = row[key];
        }
      }
      return obj;
    });
    return res.json({ success: true, data: safeResult });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// 4. Top phim có lượt xem cao nhất
const topViewedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await prisma.movie.findMany({
      orderBy: { view: 'desc' },
      take: limit,
      include: {
        categories: { include: { category: true } },
        countries: { include: { country: true } }
      }
    });
    return res.json({ success: true, data: movies });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// 5. Top phim được yêu thích nhiều nhất
const topFavoriteMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await prisma.movie.findMany({
      include: {
        _count: { select: { favorites: true } },
        categories: { include: { category: true } },
        countries: { include: { country: true } }
      },
      orderBy: { favorites: { _count: 'desc' } },
      take: limit
    });
    return res.json({ success: true, data: movies.map(m => ({ ...m, favoriteCount: m._count.favorites })) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// 6. Top phim có nhiều bình luận nhất
const topCommentedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await prisma.movie.findMany({
      include: {
        _count: { select: { comments: true } },
        categories: { include: { category: true } },
        countries: { include: { country: true } }
      },
      orderBy: { comments: { _count: 'desc' } },
      take: limit
    });
    return res.json({ success: true, data: movies.map(m => ({ ...m, commentCount: m._count.comments })) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  statsByCategory,
  statsByCountry,
  topRatedMovies,
  topViewedMovies,
  topFavoriteMovies,
  topCommentedMovies
}; 