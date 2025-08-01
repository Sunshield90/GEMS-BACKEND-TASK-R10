require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const connectDB = require('./config/db');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
