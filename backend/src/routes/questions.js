const express = require('express');
const { body, validationResult } = require('express-validator');
const { Question, Submission } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get questions for a submission
router.get('/submission/:submissionId', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      where: {
        id: req.params.submissionId,
        userId: req.user.userId
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const questions = await Question.findAll({
      where: { submissionId: req.params.submissionId },
      order: [['order', 'ASC']]
    });

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get questions'
    });
  }
});

// Create questions for a submission
router.post('/submission/:submissionId', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      where: {
        id: req.params.submissionId,
        userId: req.user.userId
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Questions must be an array'
      });
    }

    // Create questions
    const createdQuestions = await Promise.all(
      questions.map((question, index) => 
        Question.create({
          submissionId: req.params.submissionId,
          questionId: question.id,
          question: question.question,
          type: question.type,
          required: question.required,
          category: question.category,
          options: question.options || [],
          order: index
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Questions created successfully',
      data: { questions: createdQuestions }
    });
  } catch (error) {
    console.error('Create questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create questions'
    });
  }
});

// Update question response
router.put('/:id/response', auth, [
  body('response').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const question = await Question.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Submission,
          as: 'submission',
          where: { userId: req.user.userId }
        }
      ]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    await question.update({
      response: req.body.response,
      isAnswered: true
    });

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: { question }
    });
  } catch (error) {
    console.error('Update question response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update response'
    });
  }
});

// Get question statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { category, type } = req.query;
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;

    const questions = await Question.findAll({
      where: whereClause,
      include: [
        {
          model: Submission,
          as: 'submission',
          where: { userId: req.user.userId }
        }
      ]
    });

    const stats = {
      totalQuestions: questions.length,
      answeredQuestions: questions.filter(q => q.isAnswered).length,
      unansweredQuestions: questions.filter(q => !q.isAnswered).length,
      byCategory: {},
      byType: {}
    };

    // Calculate stats by category
    questions.forEach(question => {
      if (question.category) {
        if (!stats.byCategory[question.category]) {
          stats.byCategory[question.category] = { total: 0, answered: 0 };
        }
        stats.byCategory[question.category].total++;
        if (question.isAnswered) {
          stats.byCategory[question.category].answered++;
        }
      }

      if (!stats.byType[question.type]) {
        stats.byType[question.type] = { total: 0, answered: 0 };
      }
      stats.byType[question.type].total++;
      if (question.isAnswered) {
        stats.byType[question.type].answered++;
      }
    });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get question statistics'
    });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Submission,
          as: 'submission',
          where: { userId: req.user.userId }
        }
      ]
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    await question.destroy();

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question'
    });
  }
});

module.exports = router; 