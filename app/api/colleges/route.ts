import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  paginatedResponse,
  validationErrorResponse,
  internalErrorResponse,
} from "@/lib/api-response";
import {
  collegeSearchSchema,
  formatZodErrors,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/colleges
 * Search and list colleges with filters, sorting, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    // Validate query params
    const parsed = collegeSearchSchema.safeParse(searchParams);
    if (!parsed.success) {
      return validationErrorResponse(formatZodErrors(parsed.error));
    }

    const {
      q,
      state,
      city,
      type,
      minRating,
      maxFees,
      degreeType,
      sortBy,
      sortOrder,
      page,
      limit,
    } = parsed.data;

    // Build WHERE clause
    const where: Prisma.CollegeWhereInput = {};

    // Full-text search on name and city
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (type) {
      where.type = type;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Filter by max fees (requires joining courses)
    if (maxFees !== undefined || degreeType) {
      where.courses = {
        some: {
          ...(maxFees !== undefined && { fees: { lte: maxFees } }),
          ...(degreeType && { degreeType }),
        },
      };
    }

    // Build ORDER BY clause
    const orderBy: Prisma.CollegeOrderByWithRelationInput = {};
    switch (sortBy) {
      case "rating":
        orderBy.rating = sortOrder;
        break;
      case "name":
        orderBy.name = sortOrder;
        break;
      case "established":
        orderBy.establishedYear = sortOrder;
        break;
      case "fees":
        // For fees sorting, we just sort by name as a fallback
        // since fees are on courses, not colleges
        orderBy.name = sortOrder;
        break;
      default:
        orderBy.rating = "desc";
    }

    // Count total matching records
    const total = await prisma.college.count({ where });

    // Fetch paginated results
    const colleges = await prisma.college.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        establishedYear: true,
        type: true,
        accreditation: true,
        logoUrl: true,
        coverImageUrl: true,
        city: true,
        state: true,
        rating: true,
        totalStudents: true,
        courses: {
          select: {
            fees: true,
            degreeType: true,
          },
          take: 5,
          orderBy: { fees: "asc" },
        },
        _count: {
          select: {
            courses: true,
            reviews: true,
          },
        },
      },
    });

    // Transform data to include fee range
    const transformed = colleges.map((college) => {
      const fees = college.courses.map((c) => c.fees);
      const minFee = fees.length > 0 ? Math.min(...fees) : null;
      const maxFee = fees.length > 0 ? Math.max(...fees) : null;

      return {
        id: college.id,
        name: college.name,
        slug: college.slug,
        description:
          college.description.length > 200
            ? college.description.substring(0, 200) + "..."
            : college.description,
        establishedYear: college.establishedYear,
        type: college.type,
        accreditation: college.accreditation,
        logoUrl: college.logoUrl,
        coverImageUrl: college.coverImageUrl,
        city: college.city,
        state: college.state,
        rating: college.rating,
        totalStudents: college.totalStudents,
        fees: { min: minFee, max: maxFee },
        coursesCount: college._count.courses,
        reviewsCount: college._count.reviews,
      };
    });

    return paginatedResponse(transformed, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/colleges error:", error);
    return internalErrorResponse();
  }
}
