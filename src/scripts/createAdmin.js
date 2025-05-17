const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = 'admin@phimmoi.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin';

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Tạo tài khoản admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        isAdmin: true,
        role: 'ADMIN'
      }
    });

    console.log('Admin account created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isAdmin: admin.isAdmin,
      role: admin.role
    });
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 