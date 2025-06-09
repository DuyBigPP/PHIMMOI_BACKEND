const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const prisma = new PrismaClient();

// Thêm tập phim mới (Admin)
const createEpisode = async (req, res) => {
  try {
    const { name, slug, movieId, serverName } = req.body;

    // Validate required fields
    if (!name || !slug || !movieId || !serverName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate video file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    }

    // Check if episode with same slug and movieId already exists
    const existingEpisode = await prisma.episode.findFirst({
      where: {
        movieId,
        slug
      }
    });

    if (existingEpisode) {
      return res.status(400).json({
        success: false,
        message: 'Episode with this slug already exists for this movie'
      });
    }

    // Upload video to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video'
    });

    // Create episode with video URL
    const episode = await prisma.episode.create({
      data: {
        name,
        slug,
        movieId,
        serverName,
        filename: req.file.filename,
        linkEmbed: uploadResult.secure_url,
        linkM3u8: uploadResult.secure_url // Use the same URL for both fields
      }
    });

    return res.status(201).json({
      success: true,
      data: episode
    });
  } catch (error) {
    console.error('Error creating episode:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Episode with this slug already exists for this movie'
      });
    }

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
    const { name, slug, movieId, serverName } = req.body;

    // Check if episode exists
    const existingEpisode = await prisma.episode.findUnique({
      where: { id }
    });

    if (!existingEpisode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // If slug is being changed, check for duplicates
    if (slug && slug !== existingEpisode.slug) {
      const duplicateEpisode = await prisma.episode.findFirst({
        where: {
          movieId: movieId || existingEpisode.movieId,
          slug,
          id: { not: id } // Exclude current episode
        }
      });

      if (duplicateEpisode) {
        return res.status(400).json({
          success: false,
          message: 'Episode with this slug already exists for this movie'
        });
      }
    }

    const data = {
      name,
      slug,
      movieId,
      serverName
    };

    // Handle video file if uploaded
    if (req.file) {
      // Upload video to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video'
      });

      data.filename = req.file.filename;
      data.linkEmbed = uploadResult.secure_url;
      data.linkM3u8 = uploadResult.secure_url; // Use the same URL for both fields
    }

    // Remove undefined values
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

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
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Episode with this slug already exists for this movie'
      });
    }

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

    // Lấy thông tin tập phim trước khi xóa để có URL video
    const episode = await prisma.episode.findUnique({
      where: { id }
    });

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Xóa tập phim từ database
    await prisma.episode.delete({
      where: { id }
    });

    // Xóa video trên Cloudinary
    if (episode.linkEmbed) {
      const videoPublicId = episode.linkEmbed.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });
    }

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