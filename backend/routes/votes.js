const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Vote on answer
router.post('/answer/:id', [
  authenticateToken,
  body('type').isIn(['UP', 'DOWN'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.body;
    const answerId = req.params.id;

    // Check if answer exists
    const answer = await req.prisma.answer.findUnique({
      where: { id: answerId }
    });

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Check if user already voted
    const existingVote = await req.prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId: req.user.id,
          answerId: answerId
        }
      }
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await req.prisma.vote.delete({
          where: { id: existingVote.id }
        });
        return res.json({ message: 'Vote removed' });
      } else {
        // Update vote type
        await req.prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        });
        return res.json({ message: 'Vote updated' });
      }
    }

    // Create new vote
    await req.prisma.vote.create({
      data: {
        type,
        userId: req.user.id,
        answerId: answerId
      }
    });

    res.json({ message: 'Vote created' });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on question
router.post('/question/:id', [
  authenticateToken,
  body('type').isIn(['UP', 'DOWN'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.body;
    const questionId = req.params.id;

    // Check if question exists
    const question = await req.prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check if user already voted
    const existingVote = await req.prisma.vote.findUnique({
      where: {
        userId_questionId: {
          userId: req.user.id,
          questionId: questionId
        }
      }
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await req.prisma.vote.delete({
          where: { id: existingVote.id }
        });
        return res.json({ message: 'Vote removed' });
      } else {
        // Update vote type
        await req.prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        });
        return res.json({ message: 'Vote updated' });
      }
    }

    // Create new vote
    await req.prisma.vote.create({
      data: {
        type,
        userId: req.user.id,
        questionId: questionId
      }
    });

    res.json({ message: 'Vote created' });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get votes for a question or answer
router.get('/', async (req, res) => {
  try {
    const { questionId, answerId } = req.query;
    
    const votes = await req.prisma.vote.findMany({
      where: {
        ...(questionId && { questionId }),
        ...(answerId && { answerId })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
