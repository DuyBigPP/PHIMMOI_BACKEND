const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tạo bình luận mới
const createComment = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

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

    // Tạo bình luận mới
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        movieId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Bình luận thành công',
      data: comment
    });
  } catch (error) {
    console.error('Lỗi khi tạo bình luận:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy danh sách bình luận của một phim
const getMovieComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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

    // Lấy tổng số bình luận
    const total = await prisma.comment.count({
      where: { movieId }
    });

    // Lấy danh sách bình luận
    const comments = await prisma.comment.findMany({
      where: { movieId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: {
        comments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy bình luận:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Kiểm tra quyền xóa (chỉ người tạo hoặc admin mới được xóa)
    if (comment.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa bình luận này'
      });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return res.json({
      success: true,
      message: 'Xóa bình luận thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  createComment,
  getMovieComments,
  deleteComment
}; 