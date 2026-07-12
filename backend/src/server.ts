import app from './app';
import connectDB from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
};

void startServer();