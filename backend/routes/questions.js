const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag
          }
        }
      };
    }

    const questions = await req.prisma.question.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true }
        },
        tags: {
          include: {
            tag: true
          }
        },
        answers: {
          select: { id: true, isAccepted: true }
        },
        votes: true,
        _count: {
          select: { answers: true }
        }
      }
    });

    const total = await req.prisma.question.count({ where });

    const formattedQuestions = questions.map(question => ({
      ...question,
      tags: question.tags.map(qt => qt.tag),
      voteCount: question.votes.reduce((sum, vote) => 
        sum + (vote.type === 'UP' ? 1 : -1), 0
      ),
      answerCount: question._count.answers,
      hasAcceptedAnswer: question.answers.some(a => a.isAccepted)
    }));

    res.json({
      questions: formattedQuestions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single question
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await req.prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: { id: true, username: true }
        },
        tags: {
          include: {
            tag: true
          }
        },
        answers: {
          include: {
            author: {
              select: { id: true, username: true }
            },
            votes: true,
            comments: {
              include: {
                user: {
                  select: { id: true, username: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            },
            _count: {
              select: { votes: true }
            }
          },
          orderBy: [
            { isAccepted: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        votes: true
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const formattedQuestion = {
      ...question,
      tags: question.tags.map(qt => qt.tag),
      voteCount: question.votes.reduce((sum, vote) => 
        sum + (vote.type === 'UP' ? 1 : -1), 0
      ),
      answers: question.answers.map(answer => ({
        ...answer,
        voteCount: answer.votes.reduce((sum, vote) => 
          sum + (vote.type === 'UP' ? 1 : -1), 0
        ),
        userVote: req.user ? answer.votes.find(v => v.userId === req.user.id)?.type : null
      })),
      userVote: req.user ? question.votes.find(v => v.userId === req.user.id)?.type : null
    };

    res.json(formattedQuestion);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create question
router.post('/', [
  authenticateToken,
  body('title').isLength({ min: 10, max: 150 }).trim(),
  body('description').isLength({ min: 30 }),
  body('tags').isArray({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags } = req.body;

    // Create or find tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName) => {
        const tag = await req.prisma.tag.upsert({
          where: { name: tagName.toLowerCase() },
          update: {},
          create: { name: tagName.toLowerCase() }
        });
        return { tagId: tag.id };
      })
    );

    // Create question
    const question = await req.prisma.question.create({
      data: {
        title,
        description,
        authorId: req.user.id,
        tags: {
          create: tagObjects
        }
      },
      include: {
        author: {
          select: { id: true, username: true }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json({
      ...question,
      tags: question.tags.map(qt => qt.tag)
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update question (only by author)
router.put('/:id', [
  authenticateToken,
  body('title').optional().isLength({ min: 10, max: 150 }).trim(),
  body('description').optional().isLength({ min: 30 }),
  body('tags').optional().isArray({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await req.prisma.question.findUnique({
      where: { id: req.params.id }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;

    if (req.body.tags) {
      // Delete existing tags
      await req.prisma.questionTag.deleteMany({
        where: { questionId: req.params.id }
      });

      // Create new tags
      const tagObjects = await Promise.all(
        req.body.tags.map(async (tagName) => {
          const tag = await req.prisma.tag.upsert({
            where: { name: tagName.toLowerCase() },
            update: {},
            create: { name: tagName.toLowerCase() }
          });
          return { tagId: tag.id };
        })
      );

      updateData.tags = {
        create: tagObjects
      };
    }

    const updatedQuestion = await req.prisma.question.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        author: {
          select: { id: true, username: true }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json({
      ...updatedQuestion,
      tags: updatedQuestion.tags.map(qt => qt.tag)
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question (only by author or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await req.prisma.question.findUnique({
      where: { id: req.params.id }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await req.prisma.question.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
