const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get overview statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalQuestions, totalAnswers, totalVotes] = await Promise.all([
      req.prisma.user.count(),
      req.prisma.question.count(),
      req.prisma.answer.count(),
      req.prisma.vote.count()
    ]);

    res.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalVotes
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const where = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await req.prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        reputation: true,
        createdAt: true,
        isBanned: true,
        _count: {
          select: {
            questions: true,
            answers: true,
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const hasMore = users.length === parseInt(limit);

    res.json({ users, hasMore });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role
router.patch('/users/:id/role', [
  authenticateToken,
  requireAdmin,
  body('role').isIn(['USER', 'MODERATOR', 'ADMIN'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const userId = req.params.id;

    const user = await req.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Ban/unban user
router.patch('/users/:id/ban', [
  authenticateToken,
  requireAdmin,
  body('banned').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { banned } = req.body;
    const userId = req.params.id;

    // Prevent banning other admins
    const targetUser = await req.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot ban admin users' });
    }

    const user = await req.prisma.user.update({
      where: { id: userId },
      data: { isBanned: banned },
      select: {
        id: true,
        username: true,
        isBanned: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Admin ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get questions for moderation
router.get('/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const questions = await req.prisma.question.findMany({
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        title: true,
        content: true,
        views: true,
        createdAt: true,
        author: {
          select: { id: true, username: true }
        },
        _count: {
          select: { answers: true, votes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ questions });
  } catch (error) {
    console.error('Admin get questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get answers for moderation
router.get('/answers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const answers = await req.prisma.answer.findMany({
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        content: true,
        isAccepted: true,
        createdAt: true,
        questionId: true,
        author: {
          select: { id: true, username: true }
        },
        question: {
          select: { title: true }
        },
        _count: {
          select: { votes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ answers });
  } catch (error) {
    console.error('Admin get answers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question (admin)
router.delete('/questions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await req.prisma.question.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Admin delete question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete answer (admin)
router.delete('/answers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await req.prisma.answer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Admin delete answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const [topUsers, topTags, userGrowth, questionStats] = await Promise.all([
      // Top users by reputation
      req.prisma.user.findMany({
        take: 10,
        orderBy: { reputation: 'desc' },
        select: {
          id: true,
          username: true,
          reputation: true,
          _count: {
            select: { questions: true, answers: true }
          }
        }
      }),

      // Top tags by question count
      req.prisma.tag.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          _count: {
            select: { questions: true }
          }
        },
        orderBy: {
          questions: { _count: 'desc' }
        }
      }),

      // User growth (simplified - would need better date grouping in production)
      req.prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: daysAgo }
        },
        _count: { id: true }
      }),

      // Question stats (simplified)
      req.prisma.question.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: daysAgo }
        },
        _count: { id: true }
      })
    ]);

    // Process data for charts (simplified)
    const processedUserGrowth = userGrowth.map(item => ({
      date: item.createdAt,
      count: item._count.id
    }));

    const processedQuestionStats = questionStats.map(item => ({
      date: item.createdAt,
      count: item._count.id
    }));

    res.json({
      topUsers,
      topTags,
      userGrowth: processedUserGrowth,
      questionStats: processedQuestionStats
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get/Update system settings (mock implementation)
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real app, these would be stored in database
    const settings = {
      siteName: 'StackIt',
      siteDescription: 'A Q&A platform for developers',
      allowRegistration: true,
      requireEmailVerification: false,
      moderationEnabled: true,
      maxQuestionLength: 5000,
      maxAnswerLength: 3000,
      minAnswerLength: 30
    };

    res.json(settings);
  } catch (error) {
    console.error('Admin get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real app, you would save these to database
    const settings = req.body;
    
    // Validate settings here
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Admin update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
