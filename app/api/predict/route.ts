import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import { predictorSchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/predict?examId=...&rank=...&category=...&year=...
 * Predicts which colleges a student can get into based on their exam rank.
 * Groups results by confidence: HIGH, MEDIUM, STRETCH.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    const parsed = predictorSchema.safeParse(searchParams);
    if (!parsed.success) {
      return validationErrorResponse(formatZodErrors(parsed.error));
    }

    const { examId, rank, category, year } = parsed.data;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, name: true, fullName: true, category: true },
    });

    if (!exam) {
      return notFoundResponse("Exam", examId);
    }

    // Determine which cutoff column to use based on category
    const cutoffField = {
      GENERAL: "generalCutoffRank",
      OBC: "obcCutoffRank",
      SC: "scCutoffRank",
      ST: "stCutoffRank",
    }[category] as string;

    // Build where clause for cutoffs
    // A student with rank X can get into a college if cutoff rank >= X
    // (higher cutoff rank means more lenient)
    const whereClause: Record<string, unknown> = {
      examId,
    };

    if (year) {
      whereClause.year = year;
    }

    // For non-GENERAL categories, also include results where specific category is null
    // (fall back to general cutoff)
    const cutoffs = await prisma.collegeExamCutoff.findMany({
      where: whereClause,
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            type: true,
            rating: true,
            accreditation: true,
            logoUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            degreeType: true,
            fees: true,
            duration: true,
          },
        },
      },
      orderBy: { generalCutoffRank: "asc" },
    });

    // Process and categorize results
    type PredictionResult = {
      confidence: "HIGH" | "MEDIUM" | "STRETCH";
      college: typeof cutoffs[0]["college"];
      course: typeof cutoffs[0]["course"];
      cutoffRank: number;
      year: number;
      yourRank: number;
      margin: number;
    };

    const predictions: PredictionResult[] = [];

    for (const cutoff of cutoffs) {
      // Get the relevant cutoff rank
      let relevantCutoff: number | null = null;

      if (category === "GENERAL") {
        relevantCutoff = cutoff.generalCutoffRank;
      } else {
        // Try category-specific first, fall back to general
        const categoryValue = cutoff[cutoffField as keyof typeof cutoff];
        relevantCutoff =
          typeof categoryValue === "number"
            ? categoryValue
            : cutoff.generalCutoffRank;
      }

      if (relevantCutoff === null) continue;

      // Calculate confidence based on margin
      // If rank is well within cutoff (rank < 80% of cutoff) = HIGH
      // If rank is close to cutoff (80-100% of cutoff) = MEDIUM  
      // If rank slightly exceeds cutoff (100-120% of cutoff) = STRETCH
      const ratio = rank / relevantCutoff;

      let confidence: "HIGH" | "MEDIUM" | "STRETCH";
      if (ratio <= 0.8) {
        confidence = "HIGH";
      } else if (ratio <= 1.0) {
        confidence = "MEDIUM";
      } else if (ratio <= 1.2) {
        confidence = "STRETCH";
      } else {
        // Rank is too far from cutoff, skip
        continue;
      }

      predictions.push({
        confidence,
        college: cutoff.college,
        course: cutoff.course,
        cutoffRank: relevantCutoff,
        year: cutoff.year,
        yourRank: rank,
        margin: relevantCutoff - rank,
      });
    }

    // Group by confidence
    const grouped = {
      high: predictions.filter((p) => p.confidence === "HIGH"),
      medium: predictions.filter((p) => p.confidence === "MEDIUM"),
      stretch: predictions.filter((p) => p.confidence === "STRETCH"),
    };

    return successResponse({
      exam: {
        id: exam.id,
        name: exam.name,
        fullName: exam.fullName,
        category: exam.category,
      },
      inputParams: {
        rank,
        category,
        year: year || "latest",
      },
      summary: {
        totalMatches: predictions.length,
        highConfidence: grouped.high.length,
        mediumConfidence: grouped.medium.length,
        stretchChances: grouped.stretch.length,
      },
      predictions: grouped,
      ...(predictions.length === 0 && {
        message:
          "No matching colleges found for the given rank. Try a different exam or a higher rank range.",
      }),
    });
  } catch (error) {
    console.error("GET /api/predict error:", error);
    return internalErrorResponse();
  }
}
