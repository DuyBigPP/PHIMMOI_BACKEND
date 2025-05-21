const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Thêm phim vào favourites
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'movieId is required' });
    }
    const favorite = await prisma.favorite.create({
      data: { userId, movieId }
    });
    return res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Movie already in favorites' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Xóa phim khỏi favourites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'movieId is required' });
    }
    await prisma.favorite.delete({
      where: { userId_movieId: { userId, movieId } }
    });
    return res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Lấy danh sách phim yêu thích của user
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { movie: true }
    });
    return res.json({ success: true, data: favorites });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites }; 