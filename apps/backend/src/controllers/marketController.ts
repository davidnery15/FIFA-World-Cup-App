import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../types";

// @desc    Find users who have duplicate stickers that the logged-in user is missing
// @route   GET /api/market/matches
// @access  Private
export const getPerfectMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ message: "Not authorized." });
      return;
    }

    const myCollectedStickers = currentUser.collectedStickers;

    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id }, // Exclude the current logged-in user
      duplicateStickers: { $elemMatch: { $nin: myCollectedStickers } }, // At least one duplicate is NOT in our album
    }).select("name email duplicateStickers collectedStickers");

    const formattedMatches = potentialMatches.map((user) => {
      const stickersWeNeed = user.duplicateStickers.filter((code: string) => !myCollectedStickers.includes(code));
      
      const stickersTheyNeedFromUs = currentUser.duplicateStickers.filter((code) => !user.collectedStickers.includes(code));

      // Remove duplicate codes from the arrays for a cleaner UI presentation
      const uniqueNeeded = Array.from(new Set(stickersWeNeed));
      const uniqueTheyNeed = Array.from(new Set(stickersTheyNeedFromUs));

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        stickersWeNeed: uniqueNeeded,
        stickersTheyNeedFromUs: uniqueTheyNeed,
        isMutualMatch: uniqueTheyNeed.length > 0 && uniqueNeeded.length > 0,
      };
    });

    // Sort results putting "Mutual Matches" (both users benefit) at the top of the list
    formattedMatches.sort((a, b) => (b.isMutualMatch ? 1 : 0) - (a.isMutualMatch ? 1 : 0));

    res.status(200).json({
      totalMatches: formattedMatches.length,
      matches: formattedMatches,
    });
  } catch (error) {
    console.error("Error in getPerfectMatches:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Get a public feed of all users currently offering duplicates
// @route   GET /api/market/feed
// @access  Private
export const getMarketFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id;

    const activeTraders = await User.find({
      _id: { $ne: currentUserId },
      "duplicateStickers.0": { $exists: true }, // Check if array is not empty
    }).select("name duplicateStickers");

    const feed = activeTraders.map((trader) => ({
      userId: trader._id,
      name: trader.name,
      totalDuplicates: trader.duplicateStickers.length,
      availableStickers: Array.from(new Set(trader.duplicateStickers)), // Unique list of offered codes
    }));

    res.status(200).json({
      activeTradersCount: feed.length,
      feed,
    });
  } catch (error) {
    console.error("Error in getMarketFeed:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};
