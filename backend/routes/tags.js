const express = require('express');

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await req.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const tags = await req.prisma.tag.findMany({
      where: {
        name: {
          contains: q.toLowerCase(),
          mode: 'insensitive'
        }
      },
      take: 10,
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    res.json(tags);
  } catch (error) {
    console.error('Search tags error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
