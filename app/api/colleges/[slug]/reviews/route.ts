import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  paginatedResponse,
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import {
  reviewQuerySchema,
  createReviewSchema,
  formatZodErrors,
} from "@/lib/validation";
import { sanitizeString } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges/:slug/reviews
 * Returns paginated reviews for a college with sorting.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    // Validate query
    const parsed = reviewQuerySchema.safeParse(searchParams);
    if (!parsed.success) {
      return validationErrorResponse(formatZodErrors(parsed.error));
    }

    const { page, limit, sortBy, sortOrder } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!college) {
      return notFoundResponse("College", slug);
    }

    // Build order clause
    const orderBy =
      sortBy === "rating"
        ? { rating: sortOrder as "asc" | "desc" }
        : { createdAt: sortOrder as "asc" | "desc" };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { collegeId: college.id } }),
      prisma.review.findMany({
        where: { collegeId: college.id },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
    ]);

    // Aggregate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { collegeId: college.id },
      _count: { id: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const entry of ratingDistribution) {
      const key = Math.floor(entry.rating);
      if (key >= 1 && key <= 5) {
        distribution[key] += entry._count.id;
      }
    }

    return paginatedResponse(
      { collegeName: college.name, ratingDistribution: distribution, reviews },
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error) {
    console.error("GET /api/colleges/[slug]/reviews error:", error);
    return internalErrorResponse();
  }
}

/**
 * POST /api/colleges/:slug/reviews
 * Submit a new review for a college.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse({
        body: ["Invalid JSON in request body"],
      });
    }

    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(formatZodErrors(parsed.error));
    }

    const college = await prisma.college.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!college) {
      return notFoundResponse("College", slug);
    }

    // Sanitize text inputs
    const reviewData = {
      ...parsed.data,
      authorName: sanitizeString(parsed.data.authorName),
      title: sanitizeString(parsed.data.title),
      content: sanitizeString(parsed.data.content),
      pros: parsed.data.pros ? sanitizeString(parsed.data.pros) : undefined,
      cons: parsed.data.cons ? sanitizeString(parsed.data.cons) : undefined,
      courseName: parsed.data.courseName
        ? sanitizeString(parsed.data.courseName)
        : undefined,
    };

    const review = await prisma.review.create({
      data: {
        collegeId: college.id,
        ...reviewData,
      },
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
    });

    // Update college average rating
    const avgRating = await prisma.review.aggregate({
      where: { collegeId: college.id },
      _avg: { rating: true },
    });

    if (avgRating._avg.rating !== null) {
      await prisma.college.update({
        where: { id: college.id },
        data: {
          rating: Math.round(avgRating._avg.rating * 10) / 10,
        },
      });
    }

    return successResponse(review, 201);
  } catch (error) {
    console.error("POST /api/colleges/[slug]/reviews error:", error);
    return internalErrorResponse();
  }
}
