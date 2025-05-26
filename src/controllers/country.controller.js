const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Thêm mới quốc gia (Admin)
const createCountry = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug are required' });
    // Kiểm tra trùng slug
    const exist = await prisma.country.findUnique({ where: { slug } });
    if (exist) return res.status(400).json({ success: false, message: 'Country slug already exists' });
    const country = await prisma.country.create({ data: { name, slug } });
    return res.status(201).json({ success: true, data: country });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createCountry }; 