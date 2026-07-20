import { Request, Response } from "express";
import User from "../models/User";
import { StickerCodeInput } from "../schemas/albumSchema";
import { AuthRequest } from "../types";

// @desc    Get current logged-in user's album status
// @route   GET /api/album/me
// @access  Private
export const getMyAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }

    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      collectedCount: req.user.collectedStickers.length,
      duplicateCount: req.user.duplicateStickers.length,
      collectedStickers: req.user.collectedStickers,
      duplicateStickers: req.user.duplicateStickers,
    });
  } catch (error) {
    console.error("Error in getMyAlbum:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Add a sticker to the collected album (no duplicates allowed in album)
// @route   POST /api/album/collect
// @access  Private
export const addCollectedSticker = async (req: AuthRequest<{}, {}, StickerCodeInput>, res: Response): Promise<void> => {
  try {
    const { stickerCode } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }

    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { collectedStickers: stickerCode } },
      { returnDocument: "after" },
    ).select("-passwordHash");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: `Sticker ${stickerCode} successfully added to your album!`,
      collectedStickers: updatedUser.collectedStickers,
    });
  } catch (error) {
    console.error("Error in addCollectedSticker:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Add a duplicate sticker available for trade (allows multiple copies)
// @route   POST /api/album/duplicate
// @access  Private
export const addDuplicateSticker = async (req: AuthRequest<{}, {}, StickerCodeInput>, res: Response): Promise<void> => {
  try {
    const { stickerCode } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Not authorized. User missing." });
      return;
    }

    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { duplicateStickers: stickerCode } },
      { returnDocument: "after" },
    ).select("-passwordHash");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: `Sticker ${stickerCode} added to your duplicate inventory for trading!`,
      duplicateStickers: updatedUser.duplicateStickers,
    });
  } catch (error) {
    console.error("Error in addDuplicateSticker:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Remove one copy of a duplicate sticker (e.g., when traded or added by mistake)
// @route   DELETE /api/album/duplicate
// @access  Private
export const removeDuplicateSticker = async (req: AuthRequest<{}, {}, StickerCodeInput>, res: Response): Promise<void> => {
  try {
    const { stickerCode } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }

    const indexToRemove = user.duplicateStickers.indexOf(stickerCode);

    if (indexToRemove === -1) {
      res.status(400).json({ message: `Sticker ${stickerCode} was not found in your duplicate inventory.` });
      return;
    }

    user.duplicateStickers.splice(indexToRemove, 1);
    await user.save();

    res.status(200).json({
      message: `One copy of ${stickerCode} removed from duplicates.`,
      duplicateStickers: user.duplicateStickers,
    });
  } catch (error) {
    console.error("Error in removeDuplicateSticker:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};
