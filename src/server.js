// Load and validate env FIRST — will throw if required vars are missing
const env = require('./config/env');

const app = require('./app');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const start = async () => {
  try {
    // Connect dependencies before accepting traffic
    await connectDB();
    //connectRedis();

    const server = app.listen(env.PORT, () => {
      logger.info('Server started', {
        type: 'app',
        event: 'server_start',
        service: 'server',
        port: env.PORT,
        environment: env.NODE_ENV,
      });
    });

    // ── Graceful shutdown ───────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.warn(`Received ${signal} — shutting down gracefully`, {
        type: 'app',
        event: 'server_shutdown_initiated',
        service: 'server',
        signal,
      });

      server.close(() => {
        logger.info('HTTP server closed', {
          type: 'app',
          event: 'server_shutdown_complete',
          service: 'server',
        });
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown after timeout', {
          type: 'app',
          event: 'server_shutdown_forced',
          service: 'server',
        });
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Catch unhandled rejections — log and exit
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', {
        type: 'error',
        event: 'unhandled_rejection',
        service: 'server',
        error: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server', {
      type: 'error',
      event: 'server_start_failed',
      service: 'server',
      error: err.message,
    });
    process.exit(1);
  }
};

start();
