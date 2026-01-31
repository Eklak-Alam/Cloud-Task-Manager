const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const sequelize = require('./config/database');
const taskRoutes = require('./routes/taskRoutes');
require('dotenv').config(); // Load .env file

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allow Frontend (Port 3000) to talk to Backend (Port 5000)
app.use(express.json()); 

// --- ROUTES ---
app.use('/tasks', taskRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ok', database: 'Connected' });
});

// --- DATABASE SYNC ---
// This creates the tables if they don't exist
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database & tables synced!'))
  .catch(err => console.log('❌ DB Error:', err));

// --- THE "DUAL-MODE" STARTUP ---

// 1. LOCAL MODE: If we run "node index.js", this part activates
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
    console.log(`📡 Database Host: ${process.env.DB_HOST}`);
  });
}

// 2. CLOUD MODE: If AWS Lambda loads this, it skips the above and uses this handler
module.exports.handler = serverless(app);