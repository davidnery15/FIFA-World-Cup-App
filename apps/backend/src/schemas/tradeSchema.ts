import { z } from "zod";

export const createTradeSchema = z.object({
  receiverId: z.string().min(1),
  offeredStickers: z.array(z.string()).min(0).default([]),
  requestedStickers: z.array(z.string()).min(1, "You must request at least one sticker."),
});

// Schema for responding to a trade (accept, reject, or cancel)
export const respondTradeSchema = z.object({
  status: z.enum(["accepted", "rejected", "cancelled"], {
    message: "Status must be accepted, rejected, or cancelled.",
  }),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type RespondTradeInput = z.infer<typeof respondTradeSchema>;
