const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

// CORS configuration
app.use(cors({ origin: '*' })); // Allow all origins (adjust as needed)
app.use(express.json());
app.use(cookieParser());

// Database connection
const { connectDB } = require('./db');
(async () => {
  try {
    await connectDB();

    // Root route
    app.get('/', (req, res) => {
      res.send('Welcome to the API');
    });

    app.use('/user/auth', require('./Routes/Auth'));
    app.use('/user/data', require('./Routes/Data'));

  } catch (error) {
    console.error('Error starting server:', error);
  }
})();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).send('Something went wrong!');
});
