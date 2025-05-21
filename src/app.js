const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movie.routes');
const ratingRoutes = require('./routes/rating.routes');
const commentRoutes = require('./routes/comment.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const viewRoutes = require('./routes/view.routes');
const favoriteRoutes = require('./routes/favorite.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', authRoutes);
app.use('/api', movieRoutes);
app.use('/api', ratingRoutes);
app.use('/api', commentRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', viewRoutes);
app.use('/api', favoriteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app; 