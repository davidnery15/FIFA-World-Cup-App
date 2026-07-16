import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  collectedStickers: string[]; // Stickers currently pasted in the album
  duplicateStickers: string[]; // Spare stickers available for trading
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    collectedStickers: [
      {
        type: String,
      },
    ],
    duplicateStickers: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index to optimize matchmaking queries when searching for duplicate stickers
UserSchema.index({ duplicateStickers: 1 });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
