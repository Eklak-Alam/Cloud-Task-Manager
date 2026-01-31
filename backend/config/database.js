const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create the connection instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Turn off console logs for speed
    pool: {
      max: 5,    // Maximum open connections
      min: 0,    // Minimum connections
      acquire: 30000, // Timeout before error
      idle: 10000 // Close connection if not used for 10s
    }
  }
);

module.exports = sequelize;