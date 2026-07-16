import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

// Middleware generator that accepts any valid Zod schema using the core ZodType
export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          status: "error",
          message: "Invalid request data. Please check your inputs.",
          errors: errorMessages,
        });
        return;
      }

      res.status(500).json({ message: "Internal validation error." });
      return;
    }
  };
