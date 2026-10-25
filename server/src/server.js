import fs from 'node:fs';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { app } from './app.js';

fs.mkdirSync(env.uploadsDir, { recursive: true });

await connectDB();

app.listen(env.port, () => {
  console.log(`FoundIt API running at http://localhost:${env.port}`);
});
