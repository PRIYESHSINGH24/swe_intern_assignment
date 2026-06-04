import prisma from "@/lib/prisma";
import { successResponse, internalErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges/filters
 * Returns available filter options (distinct values for states, cities, types).
 * Useful for populating filter dropdowns dynamically.
 */
export async function GET() {
  try {
    const [states, cities, types, degreeTypes] = await Promise.all([
      prisma.college.findMany({
        select: { state: true },
        distinct: ["state"],
        orderBy: { state: "asc" },
      }),
      prisma.college.findMany({
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
      prisma.college.findMany({
        select: { type: true },
        distinct: ["type"],
      }),
      prisma.course.findMany({
        select: { degreeType: true },
        distinct: ["degreeType"],
      }),
    ]);

    return successResponse({
      states: states.map((s) => s.state),
      cities: cities.map((c) => c.city),
      types: types.map((t) => t.type),
      degreeTypes: degreeTypes.map((d) => d.degreeType),
    });
  } catch (error) {
    console.error("GET /api/colleges/filters error:", error);
    return internalErrorResponse();
  }
}
