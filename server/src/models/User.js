import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    // select: false keeps the hash out of every query unless explicitly requested.
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

// Safe public shape of a user - never includes the password hash.
userSchema.methods.toProfile = function toProfile() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
