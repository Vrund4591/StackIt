const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get user profile by username
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        reputation: true,
        bio: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            answers: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/me/profile', authenticateToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        reputation: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
            answers: true,
            votes: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users for mentions
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await req.prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true
      },
      take: 10,
      orderBy: {
        username: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
