"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CourseData {
  id: string;
  name: string;
  duration: string;
  degreeType: string;
  fees: number;
  seatsAvailable: number | null;
  eligibility: string | null;
}

interface PlacementData {
  id: string;
  year: number;
  averagePackage: number;
  medianPackage: number | null;
  highestPackage: number;
  lowestPackage: number | null;
  placementRate: number;
  topRecruiters: string[];
}

interface ReviewData {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  pros: string | null;
  cons: string | null;
  graduationYear: number | null;
  courseName: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface CollegeDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  establishedYear: number;
  type: string;
  accreditation: string | null;
  website: string | null;
  city: string;
  state: string;
  country: string;
  rating: number;
  totalStudents: number | null;
  acceptanceRate: number | null;
  courses: CourseData[];
  placements: PlacementData[];
  reviews: ReviewData[];
  reviewStats: {
    averageRating: number | null;
    totalReviews: number;
  };
  _count: {
    courses: number;
    reviews: number;
    placements: number;
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export default function CollegeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "placements" | "reviews">("overview");

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    authorName: "",
    rating: 5,
    title: "",
    content: "",
    pros: "",
    cons: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchCollege = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/colleges/${slug}?include=courses,placements,reviews`);
      const data = await res.json();
      if (data.success) {
        setCollege(data.data);
      } else {
        setError(data.error?.message || "College not found");
      }
    } catch {
      setError("Failed to load college details");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchCollege();
  }, [slug, fetchCollege]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/colleges/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setShowReviewForm(false);
        setReviewForm({ authorName: "", rating: 5, title: "", content: "", pros: "", cons: "" });
        fetchCollege(); // Refresh data
      } else {
        alert(data.error?.message || "Failed to submit review");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-2/3 rounded bg-slate-800" />
          <div className="h-6 w-1/3 rounded bg-slate-800" />
          <div className="h-40 rounded-2xl bg-slate-800" />
          <div className="h-60 rounded-2xl bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-400">{error || "College not found"}</h1>
        <Link href="/" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
          ← Back to colleges
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "courses", label: `Courses (${college._count.courses})` },
    { key: "placements", label: `Placements (${college._count.placements})` },
    { key: "reviews", label: `Reviews (${college._count.reviews})` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-400">
          Colleges
        </Link>
        <span className="mx-2">→</span>
        <span className="text-slate-300">{college.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-white">{college.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {college.city}, {college.state}
              </span>
              <span>•</span>
              <span>Est. {college.establishedYear}</span>
              <span>•</span>
              <span className="rounded bg-slate-800 px-2 py-0.5">{college.type}</span>
              {college.accreditation && (
                <>
                  <span>•</span>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-indigo-400">
                    {college.accreditation}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 rounded-xl bg-amber-500/10 px-4 py-2 text-2xl font-bold text-amber-400">
              ★ {college.rating.toFixed(1)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {college.reviewStats.totalReviews} reviews
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-white">{college._count.courses}</p>
            <p className="text-xs text-slate-500">Courses</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-white">{college.totalStudents?.toLocaleString() || "N/A"}</p>
            <p className="text-xs text-slate-500">Students</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            <p className="text-2xl font-bold text-white">{college.acceptanceRate ? `${college.acceptanceRate}%` : "N/A"}</p>
            <p className="text-xs text-slate-500">Acceptance</p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3 text-center">
            {college.website ? (
              <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                Visit Website →
              </a>
            ) : (
              <p className="text-sm text-slate-500">N/A</p>
            )}
            <p className="text-xs text-slate-500">Website</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">About {college.name}</h2>
            <p className="leading-relaxed text-slate-300">{college.description}</p>
          </div>
        )}

        {/* Courses */}
        {activeTab === "courses" && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Courses Offered</h2>
            {college.courses.length === 0 ? (
              <p className="text-slate-500">No course data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left text-slate-400">
                      <th className="pb-3 pr-4 font-medium">Course</th>
                      <th className="pb-3 pr-4 font-medium">Duration</th>
                      <th className="pb-3 pr-4 font-medium">Type</th>
                      <th className="pb-3 pr-4 font-medium">Fees</th>
                      <th className="pb-3 font-medium">Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {college.courses.map((course) => (
                      <tr key={course.id} className="border-b border-slate-800 last:border-0">
                        <td className="py-3 pr-4 font-medium text-white">{course.name}</td>
                        <td className="py-3 pr-4 text-slate-400">{course.duration}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            {course.degreeType}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-medium text-emerald-400">
                          {formatCurrency(course.fees)}/yr
                        </td>
                        <td className="py-3 text-slate-400">{course.seatsAvailable || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Placements */}
        {activeTab === "placements" && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Placement Records</h2>
            {college.placements.length === 0 ? (
              <p className="text-slate-500">No placement data available.</p>
            ) : (
              <div className="space-y-6">
                {college.placements.map((placement) => (
                  <div
                    key={placement.id}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
                  >
                    <h3 className="mb-4 text-lg font-bold text-white">
                      Placements {placement.year}
                    </h3>
                    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-500">Average Package</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {formatCurrency(placement.averagePackage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Highest Package</p>
                        <p className="text-lg font-bold text-amber-400">
                          {formatCurrency(placement.highestPackage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Placement Rate</p>
                        <p className="text-lg font-bold text-indigo-400">
                          {placement.placementRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Median Package</p>
                        <p className="text-lg font-bold text-slate-300">
                          {placement.medianPackage ? formatCurrency(placement.medianPackage) : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-slate-500">Top Recruiters</p>
                      <div className="flex flex-wrap gap-2">
                        {placement.topRecruiters.map((r) => (
                          <span key={r} className="rounded-lg bg-slate-700 px-2 py-1 text-xs text-slate-300">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Student Reviews</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Write a Review
              </button>
            </div>

            {reviewSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">
                ✓ Review submitted successfully!
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmitReview}
                className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={reviewForm.authorName}
                    onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                    required
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {"★".repeat(r)} ({r}/5)
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Review Title"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <textarea
                  placeholder="Write your review (min 10 characters)..."
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Pros (optional)"
                    value={reviewForm.pros}
                    onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Cons (optional)"
                    value={reviewForm.cons}
                    onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {/* Review List */}
            {college.reviews.length === 0 ? (
              <p className="text-slate-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {college.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-white">{review.authorName}</span>
                        {review.isVerified && (
                          <span className="ml-2 text-xs text-emerald-400">✓ Verified</span>
                        )}
                      </div>
                      <span className="text-amber-400">{"★".repeat(Math.round(review.rating))}</span>
                    </div>
                    <h4 className="mb-1 font-semibold text-white">{review.title}</h4>
                    <p className="mb-3 text-sm text-slate-400">{review.content}</p>
                    {(review.pros || review.cons) && (
                      <div className="flex gap-4 text-sm">
                        {review.pros && (
                          <p className="text-emerald-400">
                            <strong>Pros:</strong> {review.pros}
                          </p>
                        )}
                        {review.cons && (
                          <p className="text-red-400">
                            <strong>Cons:</strong> {review.cons}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                      {review.courseName && <span>{review.courseName} • </span>}
                      {review.graduationYear && <span>Class of {review.graduationYear}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
