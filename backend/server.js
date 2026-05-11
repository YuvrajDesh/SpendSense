const app = require('./app');
const logger = require('./utils/logger');
const connectDB = require('./config/db');

// Database connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});