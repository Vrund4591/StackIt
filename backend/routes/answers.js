const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create answer
router.post('/', [
  authenticateToken,
  body('content').isLength({ min: 30 }),
  body('questionId').isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId } = req.body;

    // Check if question exists
    const question = await req.prisma.question.findUnique({
      where: { id: questionId },
      include: { author: true }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create answer
    const answer = await req.prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    });

    // Create notification for question author
    if (question.authorId !== req.user.id) {
      await req.prisma.notification.create({
        data: {
          type: 'ANSWER',
          message: `${req.user.username} answered your question: ${question.title}`,
          userId: question.authorId
        }
      });
    }

    res.status(201).json(answer);
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update answer (only by author)
router.put('/:id', [
  authenticateToken,
  body('content').isLength({ min: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await req.prisma.answer.findUnique({
      where: { id: req.params.id }
    });

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedAnswer = await req.prisma.answer.update({
      where: { id: req.params.id },
      data: { content: req.body.content },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    });

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept answer (only by question author)
router.patch('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answer = await req.prisma.answer.findUnique({
      where: { id: req.params.id },
      include: { question: true }
    });

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.question.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Only question author can accept answers' });
    }

    // Unaccept all other answers for this question
    await req.prisma.answer.updateMany({
      where: { 
        questionId: answer.questionId,
        isAccepted: true
      },
      data: { isAccepted: false }
    });

    // Accept this answer
    const updatedAnswer = await req.prisma.answer.update({
      where: { id: req.params.id },
      data: { isAccepted: true },
      include: {
        author: {
          select: { id: true, username: true }
        }
      }
    });

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete answer (only by author or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await req.prisma.answer.findUnique({
      where: { id: req.params.id }
    });

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await req.prisma.answer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to answer
router.post('/:id/comments', [
  authenticateToken,
  body('content').isLength({ min: 10, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await req.prisma.answer.findUnique({
      where: { id: req.params.id },
      include: { author: true }
    });

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    const comment = await req.prisma.comment.create({
      data: {
        content: req.body.content,
        userId: req.user.id,
        answerId: req.params.id
      },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    // Create notification for answer author
    if (answer.authorId !== req.user.id) {
      await req.prisma.notification.create({
        data: {
          type: 'COMMENT',
          message: `${req.user.username} commented on your answer`,
          userId: answer.authorId
        }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await req.prisma.answer.findMany({
      where: { questionId: req.params.questionId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            reputation: true,
            avatar: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
