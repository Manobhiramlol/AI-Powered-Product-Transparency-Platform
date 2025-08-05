const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Report = sequelize.define('Report', {
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
  submissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'submissions',
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
  reportNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transparencyScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pdfGeneratedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'generated', 'published', 'archived'),
    defaultValue: 'draft'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'reports',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['submission_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['report_number']
    },
    {
      fields: ['transparency_score']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Report; 