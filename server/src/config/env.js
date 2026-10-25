import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// The .env file lives in the project root (two levels above server/src).
// `override` makes the project's .env win over variables already set in the shell
// (some tools set PORT globally, which would clash with the Vite dev server).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true, quiet: true });

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env in the project root and fill it in.');
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  uploadsDir: path.resolve(__dirname, '../../uploads'),
};
