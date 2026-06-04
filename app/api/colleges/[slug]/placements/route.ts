import prisma from "@/lib/prisma";
import {
  successResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges/:slug/placements
 * Returns placement data for a specific college, ordered by year descending.
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

    const placements = await prisma.placement.findMany({
      where: { collegeId: college.id },
      orderBy: { year: "desc" },
      select: {
        id: true,
        year: true,
        averagePackage: true,
        medianPackage: true,
        highestPackage: true,
        lowestPackage: true,
        placementRate: true,
        topRecruiters: true,
      },
    });

    // Compute placement trends
    const latestPlacement = placements[0] || null;
    const previousPlacement = placements[1] || null;

    let trend = null;
    if (latestPlacement && previousPlacement) {
      const avgDiff =
        latestPlacement.averagePackage - previousPlacement.averagePackage;
      const percentChange =
        (avgDiff / previousPlacement.averagePackage) * 100;
      trend = {
        direction: avgDiff > 0 ? "up" : avgDiff < 0 ? "down" : "stable",
        percentChange: Math.round(percentChange * 10) / 10,
      };
    }

    return successResponse({
      collegeName: college.name,
      total: placements.length,
      trend,
      placements,
    });
  } catch (error) {
    console.error("GET /api/colleges/[slug]/placements error:", error);
    return internalErrorResponse();
  }
}
