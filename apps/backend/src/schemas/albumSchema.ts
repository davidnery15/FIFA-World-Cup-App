import { z } from "zod";

export const stickerCodeSchema = z.object({
  stickerCode: z
    .string()
    .min(3, { message: "Sticker code must be at least 3 characters long (e.g., ARG-1)." })
    .max(10, { message: "Sticker code is too long." })
    .trim()
    .toUpperCase(), // Auto-convert to uppercase for consistency
});

export type StickerCodeInput = z.infer<typeof stickerCodeSchema>;
