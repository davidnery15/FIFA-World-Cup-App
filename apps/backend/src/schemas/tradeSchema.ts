import { z } from 'zod';

// Schema for proposing a new trade
export const createTradeSchema = z.object({
  receiverId: z
    .string()
    .min(24, { message: 'Invalid receiver ID format.' })
    .max(24, { message: 'Invalid receiver ID format.' }),
  offeredStickers: z
    .array(z.string().trim().toUpperCase())
    .min(1, { message: 'You must offer at least one sticker.' }),
  requestedStickers: z
    .array(z.string().trim().toUpperCase())
    .min(1, { message: 'You must request at least one sticker.' }),
});

// Schema for responding to a trade (accept, reject, or cancel)
export const respondTradeSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled'], {
    message: 'Status must be accepted, rejected, or cancelled.'
  }),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type RespondTradeInput = z.infer<typeof respondTradeSchema>;