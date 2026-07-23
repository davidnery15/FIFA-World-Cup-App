import { Response } from "express";
import Trade from "../models/Trade";
import User from "../models/User";
import { AuthRequest } from "../types";
import { CreateTradeInput, RespondTradeInput } from "../schemas/tradeSchema";

// Helper function to check if a user has all required duplicate stickers
const hasRequiredDuplicates = (userDuplicates: string[], requiredStickers: string[]): boolean => {
  const inventoryCopy = [...userDuplicates];
  for (const code of requiredStickers) {
    const index = inventoryCopy.indexOf(code);
    if (index === -1) return false;
    inventoryCopy.splice(index, 1); // Remove from copy to account for duplicate requests of the same code
  }
  return true;
};

// @desc    Create a new trade proposal
// @route   POST /api/trades
// @access  Private
export const createTrade = async (req: AuthRequest<{}, {}, CreateTradeInput>, res: Response): Promise<void> => {
  try {
    const { receiverId, offeredStickers, requestedStickers } = req.body;
    const sender = req.user;

    if (!sender) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }

    if (sender._id.toString() === receiverId) {
      res.status(400).json({ message: "You cannot initiate a trade with yourself." });
      return;
    }

    if (offeredStickers && offeredStickers.length > 0) {
      if (!hasRequiredDuplicates(sender.duplicateStickers, offeredStickers)) {
        res.status(400).json({ message: "You do not own all the duplicate stickers you are offering." });
        return;
      }
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({ message: "Target user not found." });
      return;
    }

    if (!hasRequiredDuplicates(receiver.duplicateStickers, requestedStickers)) {
      res.status(400).json({ message: "The target user no longer owns all the requested duplicate stickers." });
      return;
    }

    const existingPendingTrade = await Trade.findOne({
      status: "pending",
      $or: [
        { senderId: sender._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id },
      ],
    });

    if (existingPendingTrade) {
      res.status(400).json({
        message: "You already have a pending trade proposal with this collector.",
      });
      return;
    }

    const trade = await Trade.create({
      senderId: sender._id,
      receiverId: receiver._id,
      offeredStickers: offeredStickers || [],
      requestedStickers,
      status: "pending",
    });

    res.status(201).json({
      message: "Trade proposal sent successfully!",
      trade,
    });
  } catch (error) {
    console.error("Error in createTrade:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Get all trades involving the logged-in user (both sent and received)
// @route   GET /api/trades
// @access  Private
export const getMyTrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id;

    const trades = await Trade.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalTrades: trades.length,
      trades,
    });
  } catch (error) {
    console.error("Error in getMyTrades:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Respond to a trade (accept, reject, or cancel)
// @route   PATCH /api/trades/:id
// @access  Private
export const respondToTrade = async (req: AuthRequest<{ id: string }, {}, RespondTradeInput>, res: Response): Promise<void> => {
  try {
    const { id: tradeId } = req.params;
    const { status: newStatus } = req.body;
    const currentUserId = req.user?._id.toString();

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      res.status(404).json({ message: "Trade proposal not found." });
      return;
    }

    if (trade.status !== "pending") {
      res.status(400).json({ message: `This trade has already been resolved as: ${trade.status}.` });
      return;
    }

    const isSender = trade.senderId.toString() === currentUserId;
    const isReceiver = trade.receiverId.toString() === currentUserId;

    if (newStatus === "cancelled" && !isSender) {
      res.status(403).json({ message: "Only the sender can cancel a pending trade proposal." });
      return;
    }

    if ((newStatus === "accepted" || newStatus === "rejected") && !isReceiver) {
      res.status(403).json({ message: "Only the receiver can accept or reject this trade proposal." });
      return;
    }

    // IF ACCEPTED: Execute the sticker swap/gift securely
    if (newStatus === "accepted") {
      const sender = await User.findById(trade.senderId);
      const receiver = await User.findById(trade.receiverId);

      if (!sender || !receiver) {
        res.status(404).json({ message: "One of the users involved in this trade no longer exists." });
        return;
      }

      const hasOffered = trade.offeredStickers && trade.offeredStickers.length > 0;
      if (
        (hasOffered && !hasRequiredDuplicates(sender.duplicateStickers, trade.offeredStickers)) ||
        !hasRequiredDuplicates(receiver.duplicateStickers, trade.requestedStickers)
      ) {
        trade.status = "rejected";
        await trade.save();
        res.status(400).json({
          message: "Trade failed. One of the users no longer has the required duplicates available. Trade auto-rejected.",
        });
        return;
      }

      // Remove offered stickers from sender's duplicates and add to receiver's album (SKIP IF EMPTY)
      if (hasOffered) {
        for (const code of trade.offeredStickers) {
          const idx = sender.duplicateStickers.indexOf(code);
          if (idx > -1) sender.duplicateStickers.splice(idx, 1);
          if (!receiver.collectedStickers.includes(code)) {
            receiver.collectedStickers.push(code);
          }
        }
      }

      // Remove requested stickers from receiver's duplicates and add to sender's album
      for (const code of trade.requestedStickers) {
        const idx = receiver.duplicateStickers.indexOf(code);
        if (idx > -1) receiver.duplicateStickers.splice(idx, 1);
        if (!sender.collectedStickers.includes(code)) {
          sender.collectedStickers.push(code);
        }
      }

      await sender.save();
      await receiver.save();
    }

    trade.status = newStatus;
    await trade.save();

    res.status(200).json({
      message: `Trade successfully marked as ${newStatus}!`,
      trade,
    });
  } catch (error) {
    console.error("Error in respondToTrade:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};
