"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Custom hook: animates words in one by one
function useWordReveal(text: string, wordDelay: number = 80, startDelay: number = 800) {
  const words = text.split(" ");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setVisibleCount(i);
        if (i >= words.length) clearInterval(interval);
      }, wordDelay);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, wordDelay, startDelay, words.length]);

  return { words, visibleCount };
}

// Custom typewriter hook
function useTypewriter(text: string, speed: number = 38, startDelay: number = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let timer: NodeJS.Timeout;

    const startTimeout = setTimeout(() => {
      timer = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

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

interface Exam {
  id: string;
  name: string;
  fullName: string;
  category: string;
}

export default function NexusLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Active overlay state: 'labs' | 'studio' | 'openings' | null
  const [activeOverlay, setActiveOverlay] = useState<"labs" | "studio" | "openings" | null>(null);

  // --- Background Video Mouse Scrub logic ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;

      const currentX = e.clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      const SENSITIVITY = 0.8;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;

      let targetTime = targetTimeRef.current + timeOffset;
      targetTime = Math.max(0, Math.min(video.duration, targetTime));
      targetTimeRef.current = targetTime;

      triggerSeek();
    };

    const triggerSeek = () => {
      const video = videoRef.current;
      if (!video || isSeekingRef.current) return;

      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      targetTimeRef.current = video.currentTime;
    }
  };

  // Trigger buttons fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll on overlay open
  useEffect(() => {
    if (activeOverlay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeOverlay]);


  const typewriterText =
    "Search colleges, analyze placement packages, compare cutoffs, and predict your future. Now, what are we building?";
  const { displayed, done } = useTypewriter(typewriterText);

  // --- PLATFORM STATES ---
  // Labs (Colleges Search & details)
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  
  // Selected college details
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState<"overview" | "courses" | "placements" | "reviews">("overview");

  // New review form
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewPros, setReviewPros] = useState("");
  const [reviewCons, setReviewCons] = useState("");
  const [reviewCourse, setReviewCourse] = useState("");
  const [reviewGradYear, setReviewGradYear] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Studio (Comparison)
  const [comparisonColleges, setComparisonColleges] = useState<College[]>([]);
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Openings (Predictor)
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [rankInput, setRankInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("GENERAL");
  const [predictions, setPredictions] = useState<any>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [predictError, setPredictError] = useState("");

  // Fetch filter options and exams on mount
  useEffect(() => {
    async function loadData() {
      try {
        const fRes = await fetch("/api/colleges/filters");
        const fData = await fRes.json();
        if (fData.success) {
          setStates(fData.data.states);
          setTypes(fData.data.types);
        }
        const eRes = await fetch("/api/exams");
        const eData = await eRes.json();
        if (eData.success) {
          setExams(eData.data.exams);
          if (eData.data.exams.length > 0) {
            setSelectedExamId(eData.data.exams[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading filters/exams", err);
      }
    }
    loadData();
  }, []);

  // Fetch colleges when filters/search changes
  const fetchCollegesList = useCallback(async () => {
    setLoadingColleges(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedState) params.set("state", selectedState);
      if (selectedType) params.set("type", selectedType);
      params.set("limit", "50");
      const res = await fetch(`/api/colleges?${params}`);
      const data = await res.json();
      if (data.success) {
        setColleges(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingColleges(false);
    }
  }, [searchQuery, selectedState, selectedType]);

  useEffect(() => {
    if (activeOverlay === "labs") {
      fetchCollegesList();
    }
  }, [activeOverlay, fetchCollegesList]);

  // Fetch individual college details
  useEffect(() => {
    if (selectedSlug) {
      setLoadingDetails(true);
      setDetailsTab("overview");
      setReviewSuccess(false);
      setReviewError("");
      fetch(`/api/colleges/${selectedSlug}?include=courses,placements,reviews`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setDetails(d.data);
        })
        .finally(() => setLoadingDetails(false));
    } else {
      setDetails(null);
    }
  }, [selectedSlug]);

  // Handle review submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug) return;
    setReviewError("");
    setReviewSuccess(false);

    if (!reviewAuthor || !reviewTitle || !reviewContent) {
      setReviewError("Please fill out name, title, and review content.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/colleges/${selectedSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: reviewAuthor,
          rating: Number(reviewRating),
          title: reviewTitle,
          content: reviewContent,
          pros: reviewPros || undefined,
          cons: reviewCons || undefined,
          courseName: reviewCourse || undefined,
          graduationYear: reviewGradYear ? Number(reviewGradYear) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        // Reset fields
        setReviewAuthor("");
        setReviewRating(5);
        setReviewTitle("");
        setReviewContent("");
        setReviewPros("");
        setReviewCons("");
        setReviewCourse("");
        setReviewGradYear("");
        // Reload details to include new review
        const dRes = await fetch(`/api/colleges/${selectedSlug}?include=courses,placements,reviews`);
        const dData = await dRes.json();
        if (dData.success) setDetails(dData.data);
      } else {
        setReviewError(data.error?.message || "Failed to submit review");
      }
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Compare fetch trigger
  useEffect(() => {
    if (comparisonColleges.length >= 2) {
      setLoadingCompare(true);
      const ids = comparisonColleges.map((c) => c.id).join(",");
      fetch(`/api/colleges/compare?ids=${ids}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setCompareResults(d.data.colleges);
        })
        .finally(() => setLoadingCompare(false));
    } else {
      setCompareResults([]);
    }
  }, [comparisonColleges]);

  // Predict fetch
  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictError("");
    setPredictions(null);

    if (!rankInput) {
      setPredictError("Please enter your rank.");
      return;
    }

    setLoadingPredictions(true);
    try {
      const params = new URLSearchParams({
        examId: selectedExamId,
        rank: rankInput,
        category: categoryInput,
      });
      const res = await fetch(`/api/predict?${params}`);
      const data = await res.json();
      if (data.success) {
        setPredictions(data.data);
      } else {
        setPredictError(data.error?.message || "Failed to fetch predictions");
      }
    } catch {
      setPredictError("Network error. Please try again.");
    } finally {
      setLoadingPredictions(false);
    }
  };

  function formatCurrency(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  }

  return (
    <div className="relative min-h-screen text-black bg-white select-none overflow-hidden font-sans">
      {/* 1. Background Video */}
      <video
        ref={videoRef}
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ objectPosition: "70% center" }}
        muted
        playsInline
        preload="auto"
      />

      {/* 2. Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center bg-transparent pointer-events-auto">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveOverlay(null);
          }}
          className="flex items-center gap-3 select-none animate-slide-up"
        >
          <span
            className="text-[21px] sm:text-[26px] tracking-tight font-black animate-shimmer"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Nexus®
          </span>
          <span className="text-[25px] sm:text-[30px] font-normal leading-none select-none tracking-tighter">
            ✳︎
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center text-[23px] font-normal leading-none">
          <button
            onClick={() => setActiveOverlay("labs")}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Colleges
          </button>
          <span className="mx-1 select-none">, </span>
          <button
            onClick={() => setActiveOverlay("studio")}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Compare
          </button>
          <span className="mx-1 select-none">, </span>
          <button
            onClick={() => setActiveOverlay("openings")}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Predictor
          </button>
          <span className="mx-1 select-none">, </span>
          <button
            onClick={() => setActiveOverlay("labs")}
            className="hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
          >
            Placements
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex flex-col gap-[5px] md:hidden z-50 cursor-pointer p-2 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <div
            className={`w-6 h-[2px] bg-black transition-all duration-300 origin-center ${
              isMenuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <div
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-6 h-[2px] bg-black transition-all duration-300 origin-center ${
              isMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 z-40 md:hidden transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => {
            setIsMenuOpen(false);
            setActiveOverlay("labs");
          }}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity text-left w-full cursor-pointer focus:outline-none"
        >
          Colleges
        </button>
        <button
          onClick={() => {
            setIsMenuOpen(false);
            setActiveOverlay("studio");
          }}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity text-left w-full cursor-pointer focus:outline-none"
        >
          Compare
        </button>
        <button
          onClick={() => {
            setIsMenuOpen(false);
            setActiveOverlay("openings");
          }}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity text-left w-full cursor-pointer focus:outline-none"
        >
          Predictor
        </button>
        <button
          onClick={() => {
            setIsMenuOpen(false);
            setActiveOverlay("labs");
          }}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity text-left w-full cursor-pointer focus:outline-none"
        >
          Placements
        </button>
      </div>

      {/* 3. Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 z-10 pointer-events-none">
        <div className="max-w-xl relative z-10 pointer-events-auto">

          {/* ── Animated status badge ── */}
          <div className="animate-slide-up delay-100 pointer-events-none select-none mb-3 sm:mb-4">
            <span
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-black/60 animate-scan-flicker"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
              </span>
              System Active — CollegeScout v1.0
            </span>
          </div>

          {/* ── Blurred Intro Label with glitch ── */}
          <div className="animate-slide-up delay-200 pointer-events-none select-none mb-5 sm:mb-6">
            <h2
              className="font-normal text-black blur-[4px] glitch-text"
              data-text="System Active. Welcome to CollegeScout, Nexus's Intelligent College Discovery Engine"
              style={{
                fontSize: "clamp(18px, 4vw, 26px)",
                lineHeight: "1.3",
              }}
            >
              System Active. Welcome to CollegeScout,
              <br />
              Nexus&apos;s Intelligent College Discovery Engine
            </h2>
          </div>

          {/* ── Typewriter text with slide-up ── */}
          <div className="animate-slide-up delay-300">
            <p
              className="text-black mb-5 sm:mb-6 font-normal min-h-[54px]"
              style={{
                fontSize: "clamp(18px, 4vw, 26px)",
                lineHeight: "1.35",
              }}
            >
              {displayed}
              {!done && (
                <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
              )}
            </p>
          </div>

          {/* ── Divider line that draws in ── */}
          <div
            className="animate-slide-up delay-400 mb-5"
            style={{
              opacity: done ? 1 : 0,
              transition: "opacity 0.4s ease 0.2s",
            }}
          >
            <div
              className="h-px bg-black/15"
              style={{
                transform: done ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
              }}
            />
          </div>

          {/* Action pill buttons container */}
          <div
            className="flex flex-wrap gap-y-1"
            style={{
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {/* White pill buttons */}
            <button
              onClick={() => setActiveOverlay("labs")}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Explore Colleges
            </button>
            <button
              onClick={() => setActiveOverlay("openings")}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Predict Cutoffs
            </button>
            <button
              onClick={() => setActiveOverlay("studio")}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Compare Options
            </button>
            <button
              onClick={() => setActiveOverlay("labs")}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Nexus Labs
            </button>
          </div>
        </div>
      </section>

      {/* 4. OVERLAYS */}
      {activeOverlay && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" }}
          onClick={() => { setActiveOverlay(null); setSelectedSlug(null); }}
        >
          <div
            className="relative w-full max-w-3xl h-full flex flex-col overflow-hidden pointer-events-auto"
            style={{
              background: "linear-gradient(160deg, #ffffff 0%, #f7f7f5 100%)",
              borderLeft: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Decorative top bar ── */}
            <div className="h-1 w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #000 0%, #555 60%, transparent 100%)" }} />

            {/* ── Header ── */}
            <div className="flex-shrink-0 px-7 pt-6 pb-5 border-b border-black/8">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-black/35 font-medium">
                      {activeOverlay === "labs" ? "🎓 College Explorer" : activeOverlay === "studio" ? "⚖️ Compare Tool" : "🎯 Rank Predictor"}
                    </span>
                  </div>
                  <h3
                    className="text-2xl sm:text-[28px] font-black tracking-tight leading-tight text-black"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {activeOverlay === "labs"
                      ? selectedSlug
                        ? (details?.name ?? "College Details")
                        : "Colleges Catalogue"
                      : activeOverlay === "studio"
                      ? "Comparison Matrix"
                      : "Cutoff Predictor"}
                  </h3>
                  <p className="text-[13px] text-black/45 mt-1">
                    {activeOverlay === "labs" && !selectedSlug
                      ? `${colleges.length} institutions indexed`
                      : activeOverlay === "labs" && selectedSlug
                      ? `${details?.city ?? ""}, ${details?.state ?? ""} · ${details?.type ?? ""}`
                      : activeOverlay === "studio"
                      ? "Select up to 3 colleges for side-by-side analysis"
                      : "Enter your exam rank to discover matching colleges"}
                  </p>
                </div>
                <button
                  onClick={() => { setActiveOverlay(null); setSelectedSlug(null); }}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-black/6 hover:bg-black hover:text-white flex items-center justify-center text-sm transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto px-7 py-6">

            {/* ════════════════ COLLEGES PANEL ════════════════ */}
            {activeOverlay === "labs" && (
              <div className="flex flex-col gap-5">
                {!selectedSlug ? (
                  <>
                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30 text-sm">🔍</span>
                        <input
                          type="text"
                          placeholder="Search colleges, cities, states..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-2xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                        />
                      </div>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 cursor-pointer"
                      >
                        <option value="">All States</option>
                        {states.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 cursor-pointer"
                      >
                        <option value="">All Types</option>
                        {types.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* College Cards */}
                    {loadingColleges ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-44 rounded-2xl bg-black/5 animate-pulse" />
                        ))}
                      </div>
                    ) : colleges.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {colleges.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedSlug(c.slug)}
                            className="group relative p-5 rounded-2xl bg-white border border-black/8 cursor-pointer transition-all duration-250 hover:shadow-lg hover:shadow-black/8 hover:-translate-y-0.5 hover:border-black/20"
                          >
                            {/* Type badge */}
                            <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{
                                background: c.type === "PUBLIC" ? "#e8f5e9" : c.type === "PRIVATE" ? "#e3f2fd" : "#fce4ec",
                                color: c.type === "PUBLIC" ? "#2e7d32" : c.type === "PRIVATE" ? "#1565c0" : "#880e4f",
                              }}>
                              {c.type}
                            </span>
                            <div className="pr-14">
                              <h4 className="font-bold text-[15px] leading-snug text-black mb-1 group-hover:text-black/75 transition-colors">{c.name}</h4>
                              <p className="text-xs text-black/40 mb-3">📍 {c.city}, {c.state}</p>
                            </div>
                            <p className="text-[12px] text-black/55 line-clamp-2 leading-relaxed mb-4">{c.description}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-black/6">
                              <div className="flex items-center gap-1">
                                <span className="text-amber-400 text-sm">★</span>
                                <span className="text-sm font-bold text-black">{c.rating.toFixed(1)}</span>
                                <span className="text-[11px] text-black/35 ml-1">({c.reviewsCount} reviews)</span>
                              </div>
                              <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                {c.fees.min ? `From ${formatCurrency(c.fees.min)}` : "Fees N/A"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="text-sm font-semibold text-black/50">No colleges match your search</p>
                        <p className="text-xs text-black/30 mt-1">Try adjusting your filters</p>
                      </div>
                    )}
                  </>
                ) : (
                  /* ── College Detail View ── */
                  <div>
                    <button
                      onClick={() => setSelectedSlug(null)}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/40 hover:text-black transition-colors mb-6 focus:outline-none"
                    >
                      ← Back to list
                    </button>

                    {loadingDetails || !details ? (
                      <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-black/5 animate-pulse" />)}
                      </div>
                    ) : (
                      <div>
                        {/* College Hero */}
                        <div className="p-5 rounded-2xl mb-6"
                          style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)" }}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-xl font-black text-white leading-tight">{details.name}</h4>
                              <p className="text-white/50 text-[13px] mt-1">📍 {details.city}, {details.state}</p>
                            </div>
                            <span className="text-[11px] font-bold bg-white/10 text-white/80 px-2.5 py-1 rounded-full">{details.accreditation || "N/A"}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-3 mt-4">
                            {[
                              { label: "Rating", value: `★ ${details.rating}` },
                              { label: "Est.", value: details.establishedYear },
                              { label: "Students", value: details.totalStudents ? `${(details.totalStudents/1000).toFixed(0)}K` : "N/A" },
                              { label: "Type", value: details.type },
                            ].map((stat) => (
                              <div key={stat.label} className="text-center bg-white/8 rounded-xl py-2.5">
                                <p className="text-white font-bold text-sm">{stat.value}</p>
                                <p className="text-white/40 text-[10px] uppercase tracking-wide mt-0.5">{stat.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-black/5 p-1 rounded-2xl mb-6">
                          {(["overview", "courses", "placements", "reviews"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setDetailsTab(tab)}
                              className={`flex-1 py-2 text-xs font-semibold capitalize rounded-xl transition-all duration-200 focus:outline-none cursor-pointer ${
                                detailsTab === tab
                                  ? "bg-white text-black shadow-sm shadow-black/10"
                                  : "text-black/40 hover:text-black/70"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        <div className="pb-6">
                          {detailsTab === "overview" && (
                            <div className="space-y-5">
                              <p className="text-sm leading-relaxed text-black/70">{details.description}</p>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: "Established", value: details.establishedYear, icon: "🏛️" },
                                  { label: "Accreditation", value: details.accreditation || "N/A", icon: "🏅" },
                                  { label: "Total Students", value: details.totalStudents?.toLocaleString() || "N/A", icon: "👥" },
                                  { label: "Acceptance Rate", value: details.acceptanceRate ? `${details.acceptanceRate}%` : "N/A", icon: "📊" },
                                ].map((s) => (
                                  <div key={s.label} className="p-4 bg-white border border-black/8 rounded-2xl">
                                    <span className="text-lg">{s.icon}</span>
                                    <p className="text-[10px] uppercase tracking-wider text-black/35 mt-2 mb-0.5">{s.label}</p>
                                    <p className="text-sm font-bold text-black">{s.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {detailsTab === "courses" && (
                            <div className="space-y-3">
                              {details.courses?.length > 0 ? details.courses.map((course: any) => (
                                <div key={course.id} className="p-4 bg-white border border-black/8 rounded-2xl hover:border-black/20 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-sm text-black leading-snug">{course.name}</h5>
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">{formatCurrency(course.fees)}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{course.degreeType}</span>
                                    <span className="text-[11px] bg-black/5 text-black/60 px-2 py-0.5 rounded-full">{course.duration}</span>
                                    {course.seatsAvailable && <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{course.seatsAvailable} seats</span>}
                                  </div>
                                </div>
                              )) : <p className="text-sm text-black/40 py-8 text-center">No courses data available.</p>}
                            </div>
                          )}

                          {detailsTab === "placements" && (
                            <div className="space-y-4">
                              {details.placements?.length > 0 ? details.placements.map((p: any) => (
                                <div key={p.id} className="p-5 bg-white border border-black/8 rounded-2xl">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-bold text-sm">Batch {p.year}</h5>
                                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">{p.placementRate}% placed</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[
                                      { label: "Average", value: formatCurrency(p.averagePackage), color: "#1a1a1a" },
                                      { label: "Highest", value: formatCurrency(p.highestPackage), color: "#166534" },
                                      { label: "Median", value: p.medianPackage ? formatCurrency(p.medianPackage) : "N/A", color: "#1d4ed8" },
                                    ].map((s) => (
                                      <div key={s.label} className="text-center bg-black/3 rounded-xl py-3">
                                        <p className="text-sm font-black" style={{ color: s.color }}>{s.value}</p>
                                        <p className="text-[10px] uppercase tracking-wide text-black/35 mt-0.5">{s.label}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wider mb-1.5">Top Recruiters</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {p.topRecruiters.map((r: string) => (
                                        <span key={r} className="text-[11px] bg-black/5 text-black/70 px-2 py-0.5 rounded-full">{r}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )) : <p className="text-sm text-black/40 py-8 text-center">No placements data available.</p>}
                            </div>
                          )}

                          {detailsTab === "reviews" && (
                            <div className="space-y-5">
                              {/* Submit Review Form */}
                              <div className="p-5 bg-black/3 border border-black/8 rounded-2xl">
                                <h5 className="font-bold text-sm mb-4">✍️ Write a Review</h5>
                                {reviewError && <p className="text-xs text-red-500 font-medium mb-3 bg-red-50 px-3 py-2 rounded-xl">{reviewError}</p>}
                                {reviewSuccess && <p className="text-xs text-green-600 font-medium mb-3 bg-green-50 px-3 py-2 rounded-xl">✅ Review submitted successfully!</p>}
                                <form onSubmit={handleReviewSubmit} className="space-y-3">
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <input type="text" placeholder="Your Name" value={reviewAuthor} onChange={(e) => setReviewAuthor(e.target.value)}
                                      className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30" />
                                    <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}
                                      className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)} {n} Star{n>1?"s":""}</option>)}
                                    </select>
                                  </div>
                                  <input type="text" placeholder="Review Title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)}
                                    className="w-full bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30" />
                                  <textarea placeholder="Share your experience..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)}
                                    rows={3} className="w-full bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/30 resize-none" />
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <input type="text" placeholder="👍 Pros (optional)" value={reviewPros} onChange={(e) => setReviewPros(e.target.value)}
                                      className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                                    <input type="text" placeholder="👎 Cons (optional)" value={reviewCons} onChange={(e) => setReviewCons(e.target.value)}
                                      className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <input type="text" placeholder="Course Name (optional)" value={reviewCourse} onChange={(e) => setReviewCourse(e.target.value)}
                                      className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                                    <input type="number" placeholder="Graduation Year" value={reviewGradYear} onChange={(e) => setReviewGradYear(e.target.value)}
                                      className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                                  </div>
                                  <button type="submit" disabled={submittingReview}
                                    className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-black/85 transition-colors disabled:opacity-40 cursor-pointer">
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                  </button>
                                </form>
                              </div>

                              {/* Reviews List */}
                              <div className="space-y-3">
                                {details.reviews?.length > 0 ? details.reviews.map((r: any) => (
                                  <div key={r.id} className="p-4 bg-white border border-black/8 rounded-2xl">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h6 className="font-bold text-sm text-black">{r.title}</h6>
                                        <p className="text-[11px] text-black/35 mt-0.5">By {r.authorName} · {r.courseName || "General"} {r.graduationYear ? `· Grad ${r.graduationYear}` : ""}</p>
                                      </div>
                                      <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-full">
                                        <span className="text-amber-400 text-xs">★</span>
                                        <span className="text-xs font-bold text-amber-700">{r.rating}</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-black/65 leading-relaxed mb-3">{r.content}</p>
                                    {(r.pros || r.cons) && (
                                      <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-black/5">
                                        {r.pros && <p className="text-[11px] text-green-700 bg-green-50 px-3 py-2 rounded-xl"><span className="font-semibold block mb-0.5">👍 Pros</span>{r.pros}</p>}
                                        {r.cons && <p className="text-[11px] text-red-700 bg-red-50 px-3 py-2 rounded-xl"><span className="font-semibold block mb-0.5">👎 Cons</span>{r.cons}</p>}
                                      </div>
                                    )}
                                  </div>
                                )) : (
                                  <div className="text-center py-10">
                                    <p className="text-3xl mb-2">💬</p>
                                    <p className="text-sm text-black/40">No reviews yet. Be the first!</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ COMPARE PANEL ════════════════ */}
            {activeOverlay === "studio" && (
              <div className="space-y-5">
                {/* Add college selector */}
                <div className="p-4 bg-white border border-black/8 rounded-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-black/35 mb-2">Add College (max 3)</p>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const college = colleges.find((c) => c.id === val);
                      if (college && !comparisonColleges.some((c) => c.id === val) && comparisonColleges.length < 3) {
                        setComparisonColleges([...comparisonColleges, college]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full bg-black/3 border border-black/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/25 cursor-pointer"
                  >
                    <option value="">Choose a college to add...</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id} disabled={comparisonColleges.some((sel) => sel.id === c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {comparisonColleges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {comparisonColleges.map((c, i) => (
                        <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: ["#000","#1a1a2e","#0f172a"][i], color: "white" }}>
                          {c.name}
                          <button onClick={() => setComparisonColleges(comparisonColleges.filter((sc) => sc.id !== c.id))}
                            className="hover:opacity-60 focus:outline-none cursor-pointer text-white/70 hover:text-white">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comparison Table */}
                {comparisonColleges.length >= 2 ? (
                  loadingCompare ? (
                    <div className="space-y-3">
                      {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl bg-black/5 animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border border-black/8 bg-white">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr style={{ background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)" }}>
                            <th className="p-4 text-left text-[11px] font-semibold uppercase tracking-wider text-white/40 w-36">Criteria</th>
                            {compareResults.map((c: any, i: number) => (
                              <th key={c.id} className="p-4 text-left border-l border-white/8">
                                <p className="text-white font-bold text-[13px] leading-tight">{c.name}</p>
                                <p className="text-white/40 text-[11px] mt-0.5">{c.city}, {c.state}</p>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: "⭐ Rating", render: (c: any) => <span className="font-bold text-amber-600">★ {c.rating}</span> },
                            { label: "🏛️ Type", render: (c: any) => (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: c.type==="PUBLIC"?"#e8f5e9":c.type==="PRIVATE"?"#e3f2fd":"#fce4ec", color: c.type==="PUBLIC"?"#2e7d32":c.type==="PRIVATE"?"#1565c0":"#880e4f" }}>
                                {c.type}
                              </span>
                            )},
                            { label: "💰 Fees Range", render: (c: any) => <span className="font-semibold text-emerald-700">{c.fees.min ? `${formatCurrency(c.fees.min)} – ${formatCurrency(c.fees.max)}` : "N/A"}</span> },
                            { label: "📦 Avg Package", render: (c: any) => <span className="font-bold text-blue-700">{c.placements.avgPackage ? formatCurrency(c.placements.avgPackage) : "N/A"}</span> },
                            { label: "🚀 Highest Pkg", render: (c: any) => <span className="font-bold text-green-700">{c.placements.highestPackage ? formatCurrency(c.placements.highestPackage) : "N/A"}</span> },
                            { label: "📈 Placement %", render: (c: any) => <span className="font-bold">{c.placements.placementRate ? `${c.placements.placementRate}%` : "N/A"}</span> },
                            { label: "🎓 Courses", render: (c: any) => <span className="font-semibold">{c.courses.count}</span> },
                            { label: "🏆 Top Recruiters", render: (c: any) => <span className="text-black/60">{c.placements.topRecruiters?.slice(0,3).join(", ") || "N/A"}</span> },
                          ].map((row, ri) => (
                            <tr key={row.label} className={ri % 2 === 0 ? "bg-white" : "bg-black/2"}>
                              <td className="p-4 text-[12px] font-semibold text-black/50">{row.label}</td>
                              {compareResults.map((c: any) => (
                                <td key={c.id} className="p-4 border-l border-black/5 text-sm">{row.render(c)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-5xl mb-4">⚖️</p>
                    <p className="text-sm font-semibold text-black/50">Select at least 2 colleges</p>
                    <p className="text-xs text-black/30 mt-1">to build your comparison matrix</p>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ PREDICTOR PANEL ════════════════ */}
            {activeOverlay === "openings" && (
              <div className="space-y-6">
                {/* Form */}
                <form onSubmit={handlePredictSubmit} className="p-5 bg-white border border-black/8 rounded-2xl space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/40 mb-2">🎓 Exam</label>
                      <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}
                        className="w-full bg-black/3 border border-black/8 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black/25 cursor-pointer">
                        {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/40 mb-2">🏅 Your Rank</label>
                      <input type="number" placeholder="e.g. 1500" value={rankInput} onChange={(e) => setRankInput(e.target.value)}
                        className="w-full bg-black/3 border border-black/8 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black/25" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black/40 mb-2">👤 Category</label>
                      <select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}
                        className="w-full bg-black/3 border border-black/8 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black/25 cursor-pointer">
                        <option value="GENERAL">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={loadingPredictions}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)", color: "white" }}>
                    {loadingPredictions ? "Analyzing cutoffs..." : "🔮 Predict My Openings"}
                  </button>
                </form>

                {predictError && (
                  <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-3 rounded-xl">{predictError}</p>
                )}

                {/* Results */}
                {predictions && (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Total", value: predictions.summary?.totalMatches ?? 0, color: "#000" },
                        { label: "High", value: predictions.summary?.highConfidence ?? 0, color: "#166534" },
                        { label: "Medium", value: predictions.summary?.mediumConfidence ?? 0, color: "#1d4ed8" },
                        { label: "Stretch", value: predictions.summary?.stretchChances ?? 0, color: "#c2410c" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3 bg-white border border-black/8 rounded-2xl">
                          <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-[10px] uppercase tracking-wider text-black/35 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {(["high", "medium", "stretch"] as const).map((conf) => {
                      const list: any[] = predictions.predictions[conf] || [];
                      const label = conf === "high" ? "HIGH" : conf === "medium" ? "MEDIUM" : "STRETCH";
                      const styles = {
                        high:    { card: "#f0fdf4", border: "#bbf7d0", badge: "#dcfce7", badgeText: "#166534", dot: "#22c55e" },
                        medium:  { card: "#eff6ff", border: "#bfdbfe", badge: "#dbeafe", badgeText: "#1d4ed8", dot: "#3b82f6" },
                        stretch: { card: "#fff7ed", border: "#fed7aa", badge: "#ffedd5", badgeText: "#c2410c", dot: "#f97316" },
                      }[conf];

                      return (
                        <div key={conf}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: styles.dot }} />
                              <span className="text-[11px] font-black uppercase tracking-widest text-black/60">{label} CONFIDENCE</span>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: styles.badge, color: styles.badgeText }}>
                              {conf === "high" ? "< 80% of cutoff" : conf === "medium" ? "80–100% of cutoff" : "100–120% of cutoff"}
                            </span>
                          </div>

                          {list.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {list.map((item: any, i: number) => (
                                <div key={i} className="p-4 rounded-2xl border"
                                  style={{ background: styles.card, borderColor: styles.border }}>
                                  <h5 className="font-bold text-sm text-black mb-0.5">{item.college?.name ?? "—"}</h5>
                                  <p className="text-xs text-black/55 mb-1">{item.course?.name ?? "—"}</p>
                                  <p className="text-[11px] text-black/35 mb-3">📍 {item.college?.city}, {item.college?.state} · ★ {item.college?.rating}</p>
                                  <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: styles.border }}>
                                    <span className="text-[11px] text-black/50">Cutoff: <strong className="text-black">{item.cutoffRank?.toLocaleString()}</strong></span>
                                    <span className="text-[11px] font-bold" style={{ color: styles.badgeText }}>
                                      Rank {Number(rankInput).toLocaleString()} {item.margin > 0 ? `(+${item.margin.toLocaleString()})` : ""}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-black/35 py-3 text-center bg-black/3 rounded-xl">No matches in this range</p>
                          )}
                        </div>
                      );
                    })}

                    {predictions.message && (
                      <p className="text-sm text-black/45 text-center py-5 bg-black/3 rounded-2xl">{predictions.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            </div>{/* end scrollable body */}
          </div>
        </div>
      )}

    </div>
  );
}
