"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CollegeOption {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  rating: number;
  type: string;
}

interface CompareCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  establishedYear: number;
  accreditation: string | null;
  rating: number;
  totalStudents: number | null;
  fees: { min: number | null; max: number | null; average: number | null };
  placements: {
    latestYear: number;
    averagePackage: number;
    medianPackage: number | null;
    highestPackage: number;
    placementRate: number;
    topRecruiters: string[];
  } | null;
  courses: {
    count: number;
    topCourses: { name: string; degreeType: string; fees: number; duration: string }[];
  };
  reviews: {
    averageRating: number | null;
    totalReviews: number;
  };
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export default function ComparePage() {
  const [allColleges, setAllColleges] = useState<CollegeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<CompareCollege[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchColleges = useCallback(async () => {
    try {
      const res = await fetch("/api/colleges?limit=100&sortBy=rating&sortOrder=desc");
      const data = await res.json();
      if (data.success) setAllColleges(data.data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  async function handleCompare() {
    if (selectedIds.length < 2) {
      setError("Select at least 2 colleges to compare");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/colleges/compare?ids=${selectedIds.join(",")}`);
      const data = await res.json();
      if (data.success) {
        setComparisonData(data.data.colleges);
      } else {
        setError(data.error?.message || "Failed to compare");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function toggleCollege(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setComparisonData(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
          Compare Colleges
        </h1>
        <p className="mt-2 text-slate-400">
          Select 2-3 colleges for a side-by-side comparison
        </p>
      </div>

      {/* College Selector */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Select Colleges</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const c = allColleges.find((col) => col.id === id);
            return (
              <span
                key={id}
                className="flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-400"
              >
                {c?.name || id}
                <button
                  onClick={() => toggleCollege(id)}
                  className="text-indigo-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            );
          })}
          {selectedIds.length === 0 && (
            <span className="text-sm text-slate-500">No colleges selected</span>
          )}
        </div>
        <div className="mb-4 grid max-h-60 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {allColleges.map((college) => (
            <button
              key={college.id}
              onClick={() => toggleCollege(college.id)}
              disabled={selectedIds.length >= 3 && !selectedIds.includes(college.id)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                selectedIds.includes(college.id)
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              <p className="font-medium">{college.name}</p>
              <p className="text-xs text-slate-500">
                {college.city}, {college.state} • ★ {college.rating}
              </p>
            </button>
          ))}
        </div>
        <button
          id="compare-btn"
          onClick={handleCompare}
          disabled={selectedIds.length < 2 || loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Comparing..." : `Compare ${selectedIds.length} Colleges`}
        </button>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {/* Comparison Table */}
      {comparisonData && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left font-medium text-slate-400">Criteria</th>
                {comparisonData.map((c) => (
                  <th key={c.id} className="px-6 py-4 text-left font-medium text-white">
                    <Link href={`/college/${c.slug}`} className="text-indigo-400 hover:text-indigo-300">
                      {c.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Location",
                  render: (c: CompareCollege) => `${c.city}, ${c.state}`,
                },
                {
                  label: "Type",
                  render: (c: CompareCollege) => c.type,
                },
                {
                  label: "Established",
                  render: (c: CompareCollege) => String(c.establishedYear),
                },
                {
                  label: "Accreditation",
                  render: (c: CompareCollege) => c.accreditation || "N/A",
                },
                {
                  label: "Rating",
                  render: (c: CompareCollege) => `★ ${c.rating.toFixed(1)}`,
                  highlight: true,
                },
                {
                  label: "Total Students",
                  render: (c: CompareCollege) => c.totalStudents?.toLocaleString() || "N/A",
                },
                {
                  label: "Courses Offered",
                  render: (c: CompareCollege) => String(c.courses.count),
                },
                {
                  label: "Fee Range",
                  render: (c: CompareCollege) =>
                    c.fees.min ? `${formatCurrency(c.fees.min)} – ${formatCurrency(c.fees.max!)}` : "N/A",
                  highlight: true,
                },
                {
                  label: "Avg Package",
                  render: (c: CompareCollege) =>
                    c.placements ? formatCurrency(c.placements.averagePackage) : "N/A",
                  highlight: true,
                },
                {
                  label: "Highest Package",
                  render: (c: CompareCollege) =>
                    c.placements ? formatCurrency(c.placements.highestPackage) : "N/A",
                },
                {
                  label: "Placement Rate",
                  render: (c: CompareCollege) =>
                    c.placements ? `${c.placements.placementRate}%` : "N/A",
                  highlight: true,
                },
                {
                  label: "Review Rating",
                  render: (c: CompareCollege) =>
                    c.reviews.averageRating
                      ? `★ ${c.reviews.averageRating} (${c.reviews.totalReviews})`
                      : "No reviews",
                },
                {
                  label: "Top Recruiters",
                  render: (c: CompareCollege) =>
                    c.placements?.topRecruiters.slice(0, 3).join(", ") || "N/A",
                },
              ].map((row) => (
                <tr key={row.label} className="border-b border-slate-800 last:border-0">
                  <td className="px-6 py-3 font-medium text-slate-400">{row.label}</td>
                  {comparisonData.map((c) => (
                    <td
                      key={c.id}
                      className={`px-6 py-3 ${
                        row.highlight ? "font-semibold text-white" : "text-slate-300"
                      }`}
                    >
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
