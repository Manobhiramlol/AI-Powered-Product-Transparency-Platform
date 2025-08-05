const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  submissionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'submissions',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'textarea', 'select', 'number'),
    allowNull: false
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isAnswered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'questions',
  indexes: [
    {
      fields: ['submission_id']
    },
    {
      fields: ['question_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['order']
    }
  ]
});

module.exports = Question; 