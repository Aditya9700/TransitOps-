import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_transitops_token_key',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

if (!env.MONGO_URI) {
  throw new Error('FATAL: MONGO_URI is missing in configuration env file.');
}

export default env;
