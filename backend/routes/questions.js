const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all questions - Optimized version
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search, sort = 'newest', author } = req.query;
    const skip = (page - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50); // Cap at 50 items

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
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

    if (author) {
      where.author = {
        username: author
      };
    }

    // Determine sort order
    let orderBy = { createdAt: 'desc' };
    switch (sort) {
      case 'votes':
        orderBy = { votes: { _count: 'desc' } };
        break;
      case 'answers':
        orderBy = { answers: { _count: 'desc' } };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Optimized query - only select necessary fields
    const questions = await req.prisma.question.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        views: true,
        author: {
          select: { 
            id: true, 
            username: true 
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { 
            answers: true,
            votes: true
          }
        },
        answers: {
          select: { 
            isAccepted: true 
          }
        },
        ...(req.user && {
          votes: {
            where: { userId: req.user.id },
            select: { type: true }
          }
        })
      }
    });

    // Get total count only when needed (first page or specific request)
    let total = null;
    if (page === 1 || req.query.includeTotal === 'true') {
      total = await req.prisma.question.count({ where });
    }

    const formattedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      content: question.content.substring(0, 300) + (question.content.length > 300 ? '...' : ''), // Truncate content
      createdAt: question.createdAt,
      views: question.views,
      author: question.author,
      tags: question.tags.map(qt => qt.tag),
      voteCount: question._count.votes || 0,
      answerCount: question._count.answers || 0,
      hasAcceptedAnswer: question.answers.some(a => a.isAccepted),
      userVote: req.user && question.votes?.length > 0 ? question.votes[0].type : null
    }));

    const response = {
      questions: formattedQuestions,
      pagination: {
        current: parseInt(page),
        limit: take,
        hasNext: formattedQuestions.length === take,
        hasPrev: page > 1
      }
    };

    if (total !== null) {
      response.pagination.total = Math.ceil(total / take);
      response.pagination.totalItems = total;
    }

    res.json(response);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single question - Optimized
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    // Increment view count asynchronously
    req.prisma.question.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } }
    }).catch(console.error);

    const question = await req.prisma.question.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        title: true,
        content: true,
        views: true,
        createdAt: true,
        author: {
          select: { id: true, username: true }
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true }
            }
          }
        },
        answers: {
          select: {
            id: true,
            content: true,
            isAccepted: true,
            createdAt: true,
            author: {
              select: { id: true, username: true }
            },
            _count: {
              select: { votes: true }
            },
            ...(req.user && {
              votes: {
                where: { userId: req.user.id },
                select: { type: true }
              }
            }),
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                user: {
                  select: { id: true, username: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: [
            { isAccepted: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: { votes: true }
        },
        ...(req.user && {
          votes: {
            where: { userId: req.user.id },
            select: { type: true }
          }
        })
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const formattedQuestion = {
      ...question,
      tags: question.tags.map(qt => qt.tag),
      voteCount: question._count.votes || 0,
      answers: question.answers.map(answer => ({
        ...answer,
        voteCount: answer._count.votes || 0,
        userVote: req.user && answer.votes?.length > 0 ? answer.votes[0].type : null
      })),
      userVote: req.user && question.votes?.length > 0 ? question.votes[0].type : null
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
  body('title').isLength({ min: 1}).trim(),
  body('description').isLength({ min: 1 }),
  body('tags').isArray({ min: 0 }).optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, tags = [] } = req.body;

    // Create or find tags only if tags are provided
    const tagObjects = tags.length > 0 ? await Promise.all(
      tags.map(async (tagName) => {
        const tag = await req.prisma.tag.upsert({
          where: { name: tagName.toLowerCase() },
          update: {},
          create: { name: tagName.toLowerCase() }
        });
        return { tagId: tag.id };
      })
    ) : [];

    // Create question
    const questionData = {
      title,
      content: description,
      authorId: req.user.id
    };

    if (tagObjects.length > 0) {
      questionData.tags = {
        create: tagObjects
      };
    }

    const question = await req.prisma.question.create({
      data: questionData,
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
  body('title').optional().isLength({ min: 1 }).trim(),
  body('description').optional().isLength({ min: 1 }),
  body('tags').optional().isArray({ min: 0 })
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
    if (req.body.description) updateData.content = req.body.description;

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
      where: { id: req.params.id },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
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
