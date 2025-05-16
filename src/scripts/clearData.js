const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  try {
    // Xóa dữ liệu theo thứ tự để tránh lỗi khóa ngoại
    await prisma.comment.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.movieActor.deleteMany();
    await prisma.movieDirector.deleteMany();
    await prisma.movieCategory.deleteMany();
    await prisma.movieCountry.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.actor.deleteMany();
    await prisma.director.deleteMany();
    await prisma.category.deleteMany();
    await prisma.country.deleteMany();
    await prisma.user.deleteMany();

    console.log('All data has been cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData(); 