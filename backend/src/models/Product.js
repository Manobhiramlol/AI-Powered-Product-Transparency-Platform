const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Food & Beverages',
      'Cosmetics & Personal Care',
      'Supplements & Vitamins',
      'Household Products',
      'Textiles & Clothing',
      'Electronics',
      'Other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sourcing: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manufacturing: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  certifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  transparencyScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'completed', 'archived'),
    defaultValue: 'draft'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'products',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transparency_score']
    }
  ]
});

module.exports = Product; 