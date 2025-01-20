const { PrismaClient } = require('@prisma/client');
const express = require('express');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/:userId/foodEntries', async (req, res) => {
  const { userId } = req.params;
  const { foodEntries } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const createdEntries = await prisma.foodEntry.createMany({
      data: foodEntries.map((entry) => ({
        ...entry,
        userId,
        date: new Date(entry.date),
      })),
    });

    res.status(201).json(createdEntries);
  } catch (error) {
    console.error('Error saving food entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
