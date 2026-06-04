import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import { collegeIncludeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges/:slug
 * Returns full college detail with optional includes (courses, placements, reviews).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Parse include param
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );
    const parsed = collegeIncludeSchema.safeParse(searchParams);
    const includes = parsed.success ? parsed.data.include : [];

    const college = await prisma.college.findUnique({
      where: { slug },
      include: {
        courses: includes.includes("courses")
          ? {
              orderBy: { fees: "asc" },
              select: {
                id: true,
                name: true,
                duration: true,
                degreeType: true,
                fees: true,
                seatsAvailable: true,
                eligibility: true,
              },
            }
          : false,
        placements: includes.includes("placements")
          ? {
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
            }
          : false,
        reviews: includes.includes("reviews")
          ? {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: {
                id: true,
                authorName: true,
                rating: true,
                title: true,
                content: true,
                pros: true,
                cons: true,
                graduationYear: true,
                courseName: true,
                isVerified: true,
                createdAt: true,
              },
            }
          : false,
        _count: {
          select: {
            courses: true,
            reviews: true,
            placements: true,
          },
        },
      },
    });

    if (!college) {
      return notFoundResponse("College", slug);
    }

    // Compute aggregate stats
    const reviewStats = await prisma.review.aggregate({
      where: { collegeId: college.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const response = {
      ...college,
      reviewStats: {
        averageRating: reviewStats._avg.rating
          ? Math.round(reviewStats._avg.rating * 10) / 10
          : null,
        totalReviews: reviewStats._count.id,
      },
    };

    return successResponse(response);
  } catch (error) {
    console.error("GET /api/colleges/[slug] error:", error);
    return internalErrorResponse();
  }
}
