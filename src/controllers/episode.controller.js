const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Thêm tập phim (Admin)
const createEpisode = async (req, res) => {
  try {
    const data = req.body;
    const episode = await prisma.episode.create({ data });
    return res.status(201).json({
      success: true,
      data: episode
    });
  } catch (error) {
    console.error('Error creating episode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Sửa tập phim (Admin)
const updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const episode = await prisma.episode.update({
      where: { id },
      data
    });
    return res.json({
      success: true,
      data: episode
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Xóa tập phim (Admin)
const deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.episode.delete({ where: { id } });
    return res.json({
      success: true,
      message: 'Episode deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting episode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createEpisode,
  updateEpisode,
  deleteEpisode
}; 