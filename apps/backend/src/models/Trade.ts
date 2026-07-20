import mongoose, { Schema, Document, Types } from "mongoose";

export type TradeStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface ITrade extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  offeredStickers: string[]; // Stickers the sender is offering
  requestedStickers: string[]; // Stickers the sender wants in return
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema: Schema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredStickers: [
      {
        type: String,
        required: true,
      },
    ],
    requestedStickers: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast querying of a user's active trade history
TradeSchema.index({ senderId: 1, status: 1 });
TradeSchema.index({ receiverId: 1, status: 1 });

export default mongoose.models.Trade || mongoose.model<ITrade>("Trade", TradeSchema);
