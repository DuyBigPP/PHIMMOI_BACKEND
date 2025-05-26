const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Thêm mới diễn viên (Admin)
const createActor = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    // Kiểm tra trùng name
    const exist = await prisma.actor.findUnique({ where: { name } });
    if (exist) return res.status(400).json({ success: false, message: 'Actor name already exists' });
    const actor = await prisma.actor.create({ data: { name } });
    return res.status(201).json({ success: true, data: actor });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createActor }; 