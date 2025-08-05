const { sequelize } = require('../database/connection');

// Import models
const User = require('./User');
const Product = require('./Product');
const Question = require('./Question');
const Report = require('./Report');
const Submission = require('./Submission');

// Define associations
User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Submission, { foreignKey: 'productId', as: 'submissions' });
Submission.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Submission.hasMany(Question, { foreignKey: 'submissionId', as: 'questions' });
Question.belongsTo(Submission, { foreignKey: 'submissionId', as: 'submission' });

Product.hasMany(Report, { foreignKey: 'productId', as: 'reports' });
Report.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Product,
  Question,
  Report,
  Submission
}; 