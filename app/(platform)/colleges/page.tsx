"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface College {
  id: string;
  name: string;
  slug: string;
  description: string;
  establishedYear: number;
  type: string;
  accreditation: string | null;
  logoUrl: string | null;
  city: string;
  state: string;
  rating: number;
  totalStudents: number | null;
  fees: { min: number | null; max: number | null };
  coursesCount: number;
  reviewsCount: number;
}

interface Filters {
  states: string[];
  cities: string[];
  types: string[];
  degreeTypes: string[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HomePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedState) params.set("state", selectedState);
      if (selectedType) params.set("type", selectedType);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/colleges?${params}`);
      const data = await res.json();
      if (data.success) {
        setColleges(data.data);
        setMeta(data.meta);
      } else {
        setError(data.error?.message || "Failed to fetch colleges");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedState, selectedType, sortBy, sortOrder, page]);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch("/api/colleges/filters");
      const data = await res.json();
      if (data.success) setFilters(data.data);
    } catch {
      // Filters are non-critical
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedState, selectedType, sortBy, sortOrder]);

  function formatCurrency(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-white">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
          Discover Your Perfect College
        </h1>
        <p className="mt-3 text-lg text-slate-400">
          Search, compare, and find the best colleges across India
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="search-colleges"
                type="text"
                placeholder="Search colleges by name, city, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* State Filter */}
          <select
            id="filter-state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white transition focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All States</option>
            {filters?.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            id="filter-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white transition focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Types</option>
            {filters?.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            id="sort-by"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-");
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white transition focus:border-indigo-500 focus:outline-none"
          >
            <option value="rating-desc">Rating ↓</option>
            <option value="rating-asc">Rating ↑</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="established-asc">Oldest First</option>
            <option value="established-desc">Newest First</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      {meta && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{" "}
            of <span className="font-semibold text-white">{meta.total}</span>{" "}
            colleges
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-800/50 bg-red-900/20 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <div className="mb-4 h-6 w-3/4 rounded bg-slate-800" />
              <div className="mb-2 h-4 w-1/2 rounded bg-slate-800" />
              <div className="mb-4 h-12 w-full rounded bg-slate-800" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-slate-800" />
                <div className="h-6 w-16 rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* College Cards */}
      {!loading && colleges.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <Link
              key={college.id}
              href={`/college/${college.slug}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-lg font-bold text-white transition-colors group-hover:text-indigo-400">
                  {college.name}
                </h2>
                <span className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-sm font-semibold text-amber-400">
                  ★ {college.rating.toFixed(1)}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {college.city}, {college.state}
              </div>

              <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                {college.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                  {college.type}
                </span>
                {college.accreditation && (
                  <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400">
                    {college.accreditation}
                  </span>
                )}
                <span className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  Est. {college.establishedYear}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="text-sm">
                  <span className="text-slate-500">Fees: </span>
                  <span className="font-medium text-emerald-400">
                    {college.fees.min
                      ? `${formatCurrency(college.fees.min)}`
                      : "N/A"}
                    {college.fees.max && college.fees.min !== college.fees.max
                      ? ` – ${formatCurrency(college.fees.max)}`
                      : ""}
                  </span>
                </div>
                <div className="text-sm text-slate-500">
                  {college.coursesCount} courses
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && colleges.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-lg font-medium text-slate-400">
            No colleges found matching your criteria
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            id="prev-page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="px-4 text-sm text-slate-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            id="next-page"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
