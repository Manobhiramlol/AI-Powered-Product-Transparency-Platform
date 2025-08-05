const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  formData: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  dynamicResponses: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  transparencyScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  insights: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  recommendations: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'archived'),
    defaultValue: 'draft'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'submissions',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transparency_score']
    }
  ]
});

module.exports = Submission; 