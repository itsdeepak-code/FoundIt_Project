import mongoose from 'mongoose';
import { CATEGORIES, ITEM_STATUS, ITEM_STATUSES, ITEM_TYPES } from '../utils/constants.js';

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    type: { type: String, required: true, enum: ITEM_TYPES },
    category: { type: String, required: true, enum: CATEGORIES },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    incidentDate: { type: Date, required: true },
    imageUrl: { type: String, default: null },
    status: { type: String, enum: ITEM_STATUSES, default: ITEM_STATUS.OPEN },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Supports the browse page filters (type / category / status, newest first).
itemSchema.index({ status: 1, type: 1, category: 1, createdAt: -1 });
// Supports "My listings".
itemSchema.index({ createdBy: 1, createdAt: -1 });

export const Item = mongoose.model('Item', itemSchema);
