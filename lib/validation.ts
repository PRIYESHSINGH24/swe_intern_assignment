import { z } from "zod";

// ─── Pagination Schema ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1)
    .catch(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20)
    .catch(20),
});

// ─── Sort Schema ────────────────────────────────────────────────────

export const collegeSortSchema = z.object({
  sortBy: z
    .enum(["rating", "name", "fees", "established"])
    .default("rating")
    .catch("rating"),
  sortOrder: z.enum(["asc", "desc"]).default("desc").catch("desc"),
});

// ─── College Search Schema ──────────────────────────────────────────

export const collegeSearchSchema = paginationSchema
  .merge(collegeSortSchema)
  .extend({
    q: z.string().max(200).optional(),
    state: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    type: z.enum(["PUBLIC", "PRIVATE", "DEEMED"]).optional(),
    minRating: z.coerce
      .number()
      .min(0)
      .max(5)
      .optional(),
    maxFees: z.coerce.number().min(0).optional(),
    degreeType: z.enum(["BACHELORS", "MASTERS", "PHD", "DIPLOMA"]).optional(),
  });

export type CollegeSearchParams = z.infer<typeof collegeSearchSchema>;

// ─── College Include Schema ──────────────────────────────────────────

export const collegeIncludeSchema = z.object({
  include: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter((s) =>
              ["courses", "placements", "reviews"].includes(s)
            )
        : []
    ),
});

// ─── Review Schemas ──────────────────────────────────────────────────

export const reviewQuerySchema = paginationSchema.extend({
  sortBy: z.enum(["rating", "date"]).default("date").catch("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc").catch("desc"),
});

export const createReviewSchema = z.object({
  authorName: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(100, "Author name cannot exceed 100 characters")
    .transform((val) => val.trim()),
  rating: z.coerce
    .number()
    .min(1, "Rating must be at least 1.0")
    .max(5, "Rating cannot exceed 5.0"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content cannot exceed 5000 characters")
    .transform((val) => val.trim()),
  pros: z
    .string()
    .max(2000, "Pros cannot exceed 2000 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
  cons: z
    .string()
    .max(2000, "Cons cannot exceed 2000 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 5)
    .optional(),
  courseName: z
    .string()
    .max(200)
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ─── Compare Schema ──────────────────────────────────────────────────

export const compareSchema = z.object({
  ids: z
    .string()
    .min(1, "At least one college ID is required")
    .transform((val) => {
      const ids = [...new Set(val.split(",").map((s) => s.trim()).filter(Boolean))];
      return ids;
    })
    .refine((ids) => ids.length >= 2, {
      message: "At least 2 college IDs are required for comparison",
    })
    .refine((ids) => ids.length <= 3, {
      message: "Cannot compare more than 3 colleges at once",
    }),
});

// ─── Predictor Schema ────────────────────────────────────────────────

export const predictorSchema = z.object({
  examId: z.string().min(1, "Exam ID is required"),
  rank: z.coerce
    .number()
    .int("Rank must be a whole number")
    .min(1, "Rank must be at least 1")
    .max(1000000, "Rank cannot exceed 1,000,000"),
  category: z
    .enum(["GENERAL", "OBC", "SC", "ST"])
    .default("GENERAL")
    .catch("GENERAL"),
  year: z.coerce
    .number()
    .int()
    .min(2020)
    .max(new Date().getFullYear() + 1)
    .optional(),
});

export type PredictorParams = z.infer<typeof predictorSchema>;

// ─── Zod Error Formatter ─────────────────────────────────────────────

export function formatZodErrors(
  error: z.ZodError
): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "general";
    if (!details[path]) details[path] = [];
    details[path].push(issue.message);
  }
  return details;
}
