const express = require('express');
const { body, validationResult } = require('express-validator');
const { Product, Submission } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all products for current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.userId };
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const products = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        products: products.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: products.count,
          pages: Math.ceil(products.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get products'
    });
  }
});

// Get single product by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: [
        {
          model: Submission,
          as: 'submissions',
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product'
    });
  }
});

// Create new product
router.post('/', auth, [
  body('name').isLength({ min: 1, max: 200 }),
  body('brand').isLength({ min: 1, max: 100 }),
  body('category').isIn([
    'Food & Beverages',
    'Cosmetics & Personal Care',
    'Supplements & Vitamins',
    'Household Products',
    'Textiles & Clothing',
    'Electronics',
    'Other'
  ]),
  body('description').isLength({ min: 10 })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const productData = {
      ...req.body,
      userId: req.user.userId,
      status: 'draft'
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', auth, [
  body('name').optional().isLength({ min: 1, max: 200 }),
  body('brand').optional().isLength({ min: 1, max: 100 }),
  body('category').optional().isIn([
    'Food & Beverages',
    'Cosmetics & Personal Care',
    'Supplements & Vitamins',
    'Household Products',
    'Textiles & Clothing',
    'Electronics',
    'Other'
  ]),
  body('description').optional().isLength({ min: 10 })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const product = await Product.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.update(req.body);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// Get product statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      include: [
        {
          model: Submission,
          as: 'submissions'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const stats = {
      totalSubmissions: product.submissions.length,
      averageScore: product.submissions.length > 0 
        ? product.submissions.reduce((sum, sub) => sum + (sub.transparencyScore || 0), 0) / product.submissions.length
        : 0,
      lastSubmission: product.submissions.length > 0 
        ? product.submissions[0].createdAt 
        : null
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product statistics'
    });
  }
});

module.exports = router; 