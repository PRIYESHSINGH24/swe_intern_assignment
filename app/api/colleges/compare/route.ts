import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import { compareSchema, formatZodErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges/compare?ids=id1,id2,id3
 * Returns a structured side-by-side comparison of 2-3 colleges.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    const parsed = compareSchema.safeParse(searchParams);
    if (!parsed.success) {
      return validationErrorResponse(formatZodErrors(parsed.error));
    }

    const { ids } = parsed.data;

    // Fetch all colleges with their data
    const colleges = await prisma.college.findMany({
      where: { id: { in: ids } },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            degreeType: true,
            fees: true,
            duration: true,
          },
          orderBy: { fees: "asc" },
        },
        placements: {
          orderBy: { year: "desc" },
          take: 1,
          select: {
            year: true,
            averagePackage: true,
            medianPackage: true,
            highestPackage: true,
            lowestPackage: true,
            placementRate: true,
            topRecruiters: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: {
            courses: true,
            reviews: true,
          },
        },
      },
    });

    // Check which IDs weren't found
    const foundIds = new Set(colleges.map((c) => c.id));
    const missingIds = ids.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      return notFoundResponse(
        "College(s)",
        missingIds.join(", ")
      );
    }

    // Transform for comparison
    const comparison = colleges.map((college) => {
      const fees = college.courses.map((c) => c.fees);
      const latestPlacement = college.placements[0] || null;

      // Review aggregation
      const totalReviews = college.reviews.length;
      const avgReviewRating =
        totalReviews > 0
          ? Math.round(
              (college.reviews.reduce((sum, r) => sum + r.rating, 0) /
                totalReviews) *
                10
            ) / 10
          : null;

      return {
        id: college.id,
        name: college.name,
        slug: college.slug,
        city: college.city,
        state: college.state,
        type: college.type,
        establishedYear: college.establishedYear,
        accreditation: college.accreditation,
        rating: college.rating,
        totalStudents: college.totalStudents,
        website: college.website,
        logoUrl: college.logoUrl,
        fees: {
          min: fees.length > 0 ? Math.min(...fees) : null,
          max: fees.length > 0 ? Math.max(...fees) : null,
          average:
            fees.length > 0
              ? Math.round(
                  fees.reduce((a, b) => a + b, 0) / fees.length
                )
              : null,
        },
        placements: latestPlacement
          ? {
              latestYear: latestPlacement.year,
              averagePackage: latestPlacement.averagePackage,
              medianPackage: latestPlacement.medianPackage,
              highestPackage: latestPlacement.highestPackage,
              lowestPackage: latestPlacement.lowestPackage,
              placementRate: latestPlacement.placementRate,
              topRecruiters: latestPlacement.topRecruiters.slice(0, 5),
            }
          : null,
        courses: {
          count: college._count.courses,
          topCourses: college.courses.slice(0, 5).map((c) => ({
            name: c.name,
            degreeType: c.degreeType,
            fees: c.fees,
            duration: c.duration,
          })),
        },
        reviews: {
          averageRating: avgReviewRating,
          totalReviews,
        },
      };
    });

    return successResponse({
      comparedCount: comparison.length,
      colleges: comparison,
    });
  } catch (error) {
    console.error("GET /api/colleges/compare error:", error);
    return internalErrorResponse();
  }
}
