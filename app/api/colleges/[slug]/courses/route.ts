import prisma from "@/lib/prisma";
import {
  successResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges/:slug/courses
 * Returns all courses for a specific college.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const college = await prisma.college.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!college) {
      return notFoundResponse("College", slug);
    }

    const courses = await prisma.course.findMany({
      where: { collegeId: college.id },
      orderBy: [{ degreeType: "asc" }, { fees: "asc" }],
      select: {
        id: true,
        name: true,
        duration: true,
        degreeType: true,
        fees: true,
        seatsAvailable: true,
        eligibility: true,
      },
    });

    return successResponse({
      collegeName: college.name,
      total: courses.length,
      courses,
    });
  } catch (error) {
    console.error("GET /api/colleges/[slug]/courses error:", error);
    return internalErrorResponse();
  }
}
