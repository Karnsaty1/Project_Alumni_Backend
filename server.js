const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const allowedOrigins = [
  'https://project-alumni-wczs.vercel.app', // Your Vercel frontend URL
  'http://localhost:3000' // For local development
];


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin, like mobile apps or curl requests
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' })); 
app.use(express.json());
app.use(cookieParser());


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
