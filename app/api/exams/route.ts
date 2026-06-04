import prisma from "@/lib/prisma";
import { successResponse, internalErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/exams
 * Lists all available exams for the predictor tool.
 */
export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        fullName: true,
        category: true,
        _count: {
          select: { cutoffs: true },
        },
      },
    });

    const transformed = exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      fullName: exam.fullName,
      category: exam.category,
      totalCutoffs: exam._count.cutoffs,
    }));

    return successResponse({
      total: transformed.length,
      exams: transformed,
    });
  } catch (error) {
    console.error("GET /api/exams error:", error);
    return internalErrorResponse();
  }
}
