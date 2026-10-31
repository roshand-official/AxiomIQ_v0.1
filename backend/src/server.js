const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AnoimQI Backend Server Running`);
  console.log(`📡 Port: ${config.port} | Mode: ${config.nodeEnv}`);
  console.log(`🔗 Health Check: http://localhost:${config.port}/api/v1/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('PostgreSQL database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
