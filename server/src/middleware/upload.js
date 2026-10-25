import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const MAX_SIZE_MB = 2;

// Only these image types are accepted. The extension is chosen by us, not by the user.
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: env.uploadsDir,
  // Random file names, so users can't overwrite files or inject paths.
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`),
});

const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) cb(null, true);
    else cb(AppError.badRequest('Only JPG, PNG or WEBP images are allowed.', { image: 'Unsupported file type.' }));
  },
});

// The browser-reported MIME type can be faked, so also check the file's first bytes.
function hasImageSignature(buffer, mimetype) {
  if (mimetype === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === 'image/png') return buffer.subarray(0, 4).toString('hex') === '89504e47';
  if (mimetype === 'image/webp') {
    return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  }
  return false;
}

async function verifyUploadedImage(req) {
  if (!req.file) return;
  const handle = await fs.open(req.file.path, 'r');
  const header = Buffer.alloc(12);
  await handle.read(header, 0, 12, 0);
  await handle.close();
  if (!hasImageSignature(header, req.file.mimetype)) {
    await removeUpload(req.file.filename);
    throw AppError.badRequest('That file does not look like a valid image.', { image: 'Invalid image file.' });
  }
}

/** Accepts an optional single "image" field and verifies it. */
export function uploadItemImage(req, res, next) {
  multerUpload.single('image')(req, res, async (error) => {
    try {
      if (error instanceof multer.MulterError) {
        const message = error.code === 'LIMIT_FILE_SIZE' ? `Image must be smaller than ${MAX_SIZE_MB} MB.` : error.message;
        throw AppError.badRequest(message, { image: message });
      }
      if (error) throw error;
      await verifyUploadedImage(req);
      next();
    } catch (err) {
      next(err);
    }
  });
}

/** Deletes a stored upload by its public URL (/uploads/abc.jpg) or file name. Never throws. */
export async function removeUpload(urlOrName) {
  if (!urlOrName) return;
  const fileName = path.basename(urlOrName);
  try {
    await fs.unlink(path.join(env.uploadsDir, fileName));
  } catch {
    // File already gone - nothing to do.
  }
}
