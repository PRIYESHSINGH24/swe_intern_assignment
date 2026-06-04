"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

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

export default function MainframeLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = "hello@collegescout.co";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(email)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyText(email);
        });
    } else {
      fallbackCopyText(email);
    }
  };

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
          className="flex items-center gap-3 select-none"
        >
          <span
            className="text-[21px] sm:text-[26px] tracking-tight font-black"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Mainframe®
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

        {/* Desktop CTA */}
        <button
          onClick={() => setActiveOverlay("labs")}
          className="hidden md:block text-[23px] font-normal underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer focus:outline-none"
        >
          Get in touch
        </button>

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
        <button
          onClick={() => {
            setIsMenuOpen(false);
            setActiveOverlay("labs");
          }}
          className="text-[32px] font-medium underline underline-offset-4 hover:opacity-60 transition-opacity text-left w-full cursor-pointer focus:outline-none"
        >
          Get in touch
        </button>
      </div>

      {/* 3. Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 z-10 pointer-events-none">
        <div className="max-w-xl relative z-10 pointer-events-auto">
          {/* Blurred Intro Label */}
          <div className="pointer-events-none select-none mb-5 sm:mb-6">
            <h2
              className="font-normal text-black blur-[4px]"
              style={{
                fontSize: "clamp(18px, 4vw, 26px)",
                lineHeight: "1.3",
              }}
            >
              System Active. Welcome to CollegeScout,
              <br />
              Mainframe's Intelligent College Discovery Engine
            </h2>
          </div>

          {/* Typewriter text */}
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
              Mainframe Labs
            </button>

            {/* Outline copy-email pill button */}
            <button
              onClick={handleCopy}
              className="relative inline-flex items-center justify-center bg-transparent text-white border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <span>
                Reach us:{" "}
                <span className="underline underline-offset-1">
                  hello@collegescout.co
                </span>
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>

              {/* Copied tooltip indicator */}
              {copied && (
                <span
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] py-1 px-2.5 rounded shadow-lg pointer-events-none transition-opacity duration-200"
                  style={{ color: "#ffffff" }}
                >
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 4. OVERLAYS */}
      {activeOverlay && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md transition-opacity duration-300">
          <div className="w-full max-w-4xl h-full bg-white/95 backdrop-blur-lg border-l border-black/10 text-black flex flex-col p-6 sm:p-10 overflow-y-auto pointer-events-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {activeOverlay === "labs" ? "Colleges Catalogue" : activeOverlay === "studio" ? "Comparison Matrix" : "Cutoff Predictor"}
                </h3>
                <p className="text-sm text-black/60 mt-1">
                  {activeOverlay === "labs"
                    ? "Explore educational institutions and campus data analytics."
                    : activeOverlay === "studio"
                    ? "Interactive college side-by-side comparison matrix."
                    : "Find matching colleges based on your exam rank."}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveOverlay(null);
                  setSelectedSlug(null);
                }}
                className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-lg hover:bg-black hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Content Renderers */}
            {activeOverlay === "labs" && (
              <div className="flex-1 flex flex-col min-h-0">
                {!selectedSlug ? (
                  <>
                    {/* Search & Filters */}
                    <div className="grid gap-3 sm:grid-cols-3 mb-6 bg-black/5 p-4 rounded-2xl border border-black/5">
                      <input
                        type="text"
                        placeholder="Search colleges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                      >
                        <option value="">All States</option>
                        {states.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                      >
                        <option value="">All Types</option>
                        {types.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Listing */}
                    {loadingColleges ? (
                      <div className="text-center py-10 text-black/40 text-sm">Loading mainframe data...</div>
                    ) : colleges.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {colleges.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedSlug(c.slug)}
                            className="group p-5 border border-black/10 rounded-2xl bg-white hover:border-black transition-all duration-300 cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-base leading-tight group-hover:text-black/70 transition-colors">{c.name}</h4>
                                <span className="text-[12px] bg-black/5 px-2 py-0.5 rounded-full font-bold">★ {c.rating.toFixed(1)}</span>
                              </div>
                              <p className="text-xs text-black/50 mb-3">{c.city}, {c.state}</p>
                              <p className="text-xs text-black/60 line-clamp-2 mb-4 leading-relaxed">{c.description}</p>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-black/5 text-[11px] text-black/40">
                              <span>Est. {c.establishedYear} • {c.type}</span>
                              <span className="font-semibold text-black/75">
                                {c.fees.min ? `Fees: ${formatCurrency(c.fees.min)}` : "No Fees Data"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-black/40 text-sm">No colleges match your query.</div>
                    )}
                  </>
                ) : (
                  /* College Detail View inside modal */
                  <div className="flex-1 flex flex-col min-h-0">
                    <button
                      onClick={() => setSelectedSlug(null)}
                      className="mb-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 hover:opacity-60 focus:outline-none"
                    >
                      ← Back to Colleges list
                    </button>

                    {loadingDetails || !details ? (
                      <div className="text-center py-10 text-black/40 text-sm">Loading college analytics...</div>
                    ) : (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Title Info */}
                        <div className="mb-6">
                          <h4 className="text-2xl font-black mb-1">{details.name}</h4>
                          <p className="text-sm text-black/50">{details.city}, {details.state} • rating: ★ {details.rating} • {details.type}</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-black/10 mb-6 gap-6 text-sm font-semibold">
                          {(["overview", "courses", "placements", "reviews"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setDetailsTab(tab)}
                              className={`pb-2 capitalize focus:outline-none cursor-pointer ${
                                detailsTab === tab
                                  ? "border-b-2 border-black text-black"
                                  : "text-black/40 hover:text-black/70"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto pr-2 pb-6">
                          {detailsTab === "overview" && (
                            <div className="space-y-4">
                              <p className="text-sm leading-relaxed text-black/80">{details.description}</p>
                              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/10">
                                <div className="p-3 bg-black/5 rounded-xl">
                                  <span className="block text-[11px] uppercase tracking-wider text-black/40">Established</span>
                                  <span className="text-sm font-bold text-black">{details.establishedYear}</span>
                                </div>
                                <div className="p-3 bg-black/5 rounded-xl">
                                  <span className="block text-[11px] uppercase tracking-wider text-black/40">Accreditation</span>
                                  <span className="text-sm font-bold text-black">{details.accreditation || "N/A"}</span>
                                </div>
                                <div className="p-3 bg-black/5 rounded-xl">
                                  <span className="block text-[11px] uppercase tracking-wider text-black/40">Total Students</span>
                                  <span className="text-sm font-bold text-black">{details.totalStudents || "N/A"}</span>
                                </div>
                                <div className="p-3 bg-black/5 rounded-xl">
                                  <span className="block text-[11px] uppercase tracking-wider text-black/40">Acceptance Rate</span>
                                  <span className="text-sm font-bold text-black">{details.acceptanceRate ? `${details.acceptanceRate}%` : "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {detailsTab === "courses" && (
                            <div className="space-y-4">
                              {details.courses?.length > 0 ? (
                                details.courses.map((course: any) => (
                                  <div key={course.id} className="p-4 border border-black/10 rounded-xl bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-sm">{course.name}</h5>
                                      <span className="text-xs text-black/50 font-medium">{course.duration}</span>
                                    </div>
                                    <p className="text-xs text-black/60 mb-2">Degree: {course.degreeType} • Seats: {course.seatsAvailable || "N/A"}</p>
                                    <p className="text-xs text-black/50 italic mb-2">Eligibility: {course.eligibility || "N/A"}</p>
                                    <p className="text-sm font-bold text-black/90 pt-2 border-t border-black/5">Fees: {formatCurrency(course.fees)}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-black/45">No courses listed.</p>
                              )}
                            </div>
                          )}

                          {detailsTab === "placements" && (
                            <div className="space-y-4">
                              {details.placements?.length > 0 ? (
                                details.placements.map((p: any) => (
                                  <div key={p.id} className="p-4 border border-black/10 rounded-xl bg-white">
                                    <h5 className="font-bold text-sm mb-3">Placement Year: {p.year}</h5>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                                      <div className="p-2 bg-black/5 rounded-lg">
                                        <span className="block text-[9px] uppercase tracking-wider text-black/40">Average</span>
                                        <span className="text-xs font-bold text-black">{formatCurrency(p.averagePackage)}</span>
                                      </div>
                                      <div className="p-2 bg-black/5 rounded-lg">
                                        <span className="block text-[9px] uppercase tracking-wider text-black/40">Highest</span>
                                        <span className="text-xs font-bold text-black">{formatCurrency(p.highestPackage)}</span>
                                      </div>
                                      <div className="p-2 bg-black/5 rounded-lg">
                                        <span className="block text-[9px] uppercase tracking-wider text-black/40">Median</span>
                                        <span className="text-xs font-bold text-black">{p.medianPackage ? formatCurrency(p.medianPackage) : "N/A"}</span>
                                      </div>
                                      <div className="p-2 bg-black/5 rounded-lg">
                                        <span className="block text-[9px] uppercase tracking-wider text-black/40">Rate</span>
                                        <span className="text-xs font-bold text-black">{p.placementRate}%</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-black/60"><span className="font-bold text-black">Top Recruiters:</span> {p.topRecruiters.join(", ")}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-black/45">No placements data.</p>
                              )}
                            </div>
                          )}

                          {detailsTab === "reviews" && (
                            <div className="space-y-6">
                              {/* Submit Review */}
                              <form onSubmit={handleReviewSubmit} className="p-5 border border-black/10 rounded-2xl bg-black/5 space-y-3">
                                <h5 className="font-bold text-sm">Add Your Review</h5>
                                {reviewError && <p className="text-xs text-red-500 font-medium">{reviewError}</p>}
                                {reviewSuccess && <p className="text-xs text-green-600 font-medium">Review submitted successfully!</p>}
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={reviewAuthor}
                                    onChange={(e) => setReviewAuthor(e.target.value)}
                                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                  <select
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(Number(e.target.value))}
                                    className="bg-white border border-black/10 rounded-xl px-2 py-2 text-xs focus:outline-none"
                                  >
                                    <option value="5">★ 5 Stars</option>
                                    <option value="4">★ 4 Stars</option>
                                    <option value="3">★ 3 Stars</option>
                                    <option value="2">★ 2 Stars</option>
                                    <option value="1">★ 1 Star</option>
                                  </select>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <input
                                    type="text"
                                    placeholder="Review Title"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none sm:col-span-2"
                                  />
                                </div>
                                <textarea
                                  placeholder="Review Content..."
                                  value={reviewContent}
                                  onChange={(e) => setReviewContent(e.target.value)}
                                  rows={3}
                                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <input
                                    type="text"
                                    placeholder="Pros (Optional)"
                                    value={reviewPros}
                                    onChange={(e) => setReviewPros(e.target.value)}
                                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Cons (Optional)"
                                    value={reviewCons}
                                    onChange={(e) => setReviewCons(e.target.value)}
                                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <input
                                    type="text"
                                    placeholder="Course Name (Optional)"
                                    value={reviewCourse}
                                    onChange={(e) => setReviewCourse(e.target.value)}
                                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Graduation Year (Optional)"
                                    value={reviewGradYear}
                                    onChange={(e) => setReviewGradYear(e.target.value)}
                                    className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={submittingReview}
                                  className="w-full bg-black text-white py-2 rounded-xl text-xs font-semibold hover:bg-black/85 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  {submittingReview ? "Submitting..." : "Submit Review"}
                                </button>
                              </form>

                              {/* Reviews List */}
                              <div className="space-y-4 pt-4 border-t border-black/10">
                                {details.reviews?.length > 0 ? (
                                  details.reviews.map((r: any) => (
                                    <div key={r.id} className="p-4 border border-black/10 rounded-xl bg-white">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <h6 className="font-bold text-sm text-black">{r.title}</h6>
                                          <p className="text-[11px] text-black/45">By {r.authorName} • {r.courseName || "General Student"} {r.graduationYear ? `(Grad ${r.graduationYear})` : ""}</p>
                                        </div>
                                        <span className="text-[11px] bg-black/5 px-2 py-0.5 rounded font-bold">★ {r.rating}</span>
                                      </div>
                                      <p className="text-xs text-black/75 mb-3 leading-relaxed">{r.content}</p>
                                      {(r.pros || r.cons) && (
                                        <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-black/5 text-[11px]">
                                          {r.pros && <p className="text-green-700"><span className="font-semibold text-black/80 block">Pros:</span> {r.pros}</p>}
                                          {r.cons && <p className="text-red-700"><span className="font-semibold text-black/80 block">Cons:</span> {r.cons}</p>}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-black/45">No reviews yet. Be the first to add one!</p>
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

            {activeOverlay === "studio" && (
              <div className="flex-1 flex flex-col min-h-0 space-y-6">
                {/* Search / Add College bar */}
                <div className="relative">
                  <span className="block text-xs font-semibold uppercase tracking-wider mb-2 text-black/50">Add College to Compare (Max 3)</span>
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
                    className="w-full bg-white border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  >
                    <option value="">Choose a college...</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id} disabled={comparisonColleges.some((sel) => sel.id === c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected pills */}
                {comparisonColleges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {comparisonColleges.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-2 bg-black text-white text-xs px-3.5 py-1.5 rounded-full">
                        {c.name}
                        <button
                          onClick={() => setComparisonColleges(comparisonColleges.filter((sc) => sc.id !== c.id))}
                          className="hover:opacity-60 font-bold focus:outline-none cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Compare Grid */}
                {comparisonColleges.length >= 2 ? (
                  loadingCompare ? (
                    <div className="text-center py-10 text-black/40 text-sm">Building comparison matrix...</div>
                  ) : (
                    <div className="border border-black/10 rounded-2xl overflow-hidden bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-black/5 border-b border-black/10">
                            <th className="p-3 font-semibold text-black/55 w-[200px]">Criteria</th>
                            {compareResults.map((c: any) => (
                              <th key={c.id} className="p-3 font-bold text-black border-l border-black/10">
                                {c.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Location</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10">{c.city}, {c.state}</td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Rating</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10 font-bold">★ {c.rating}</td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Type</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10">{c.type}</td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Fees Range</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10 font-semibold text-emerald-700">
                                {c.fees.min ? `${formatCurrency(c.fees.min)} - ${formatCurrency(c.fees.max)}` : "N/A"}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Avg Placement Package</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10">
                                {c.placements.avgPackage ? formatCurrency(c.placements.avgPackage) : "N/A"}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Highest Placement</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10">
                                {c.placements.highestPackage ? formatCurrency(c.placements.highestPackage) : "N/A"}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Placement Rate</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10">
                                {c.placements.placementRate ? `${c.placements.placementRate}%` : "N/A"}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Top Recruiters</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10 leading-relaxed text-black/75">
                                {c.placements.topRecruiters?.join(", ") || "N/A"}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-black/10">
                            <td className="p-3 font-semibold text-black/55">Courses Count</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10">{c.courses.count}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-black/55">Top Courses</td>
                            {compareResults.map((c: any) => (
                              <td key={c.id} className="p-3 border-l border-black/10 leading-relaxed text-black/75">
                                {c.courses.topCourses?.join(", ") || "N/A"}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="text-center py-10 bg-black/5 border border-dashed border-black/10 rounded-2xl p-6">
                    <p className="text-sm text-black/55">Please select at least 2 colleges to build comparison matrix.</p>
                  </div>
                )}
              </div>
            )}

            {activeOverlay === "openings" && (
              <div className="flex-1 flex flex-col min-h-0 space-y-6">
                {/* Inputs form */}
                <form onSubmit={handlePredictSubmit} className="grid gap-4 sm:grid-cols-3 bg-black/5 p-5 border border-black/5 rounded-2xl">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-black/50">Select Exam</label>
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-black/50">Your Rank</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={rankInput}
                      onChange={(e) => setRankInput(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-black/50">Category</label>
                    <select
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="GENERAL">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loadingPredictions}
                    className="sm:col-span-3 w-full bg-black text-white py-2 rounded-xl text-xs font-bold hover:bg-black/95 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loadingPredictions ? "Analyzing cutoffs..." : "Predict Openings"}
                  </button>
                </form>

                {predictError && <p className="text-sm text-red-500 font-medium">{predictError}</p>}

                {/* Predictions Results */}
                {predictions && (
                  <div className="space-y-6">
                    {(["HIGH", "MEDIUM", "STRETCH"] as const).map((conf) => {
                      const list = predictions.predictions[conf] || [];
                      const colorClass =
                        conf === "HIGH"
                          ? "border-green-500/20 bg-green-50/50"
                          : conf === "MEDIUM"
                          ? "border-blue-500/20 bg-blue-50/50"
                          : "border-orange-500/20 bg-orange-50/50";
                      const textClass =
                        conf === "HIGH"
                          ? "text-green-800"
                          : conf === "MEDIUM"
                          ? "text-blue-800"
                          : "text-orange-800";
                      const badgeClass =
                        conf === "HIGH"
                          ? "bg-green-100 text-green-800"
                          : conf === "MEDIUM"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800";

                      return (
                        <div key={conf} className="space-y-3">
                          <div className="flex justify-between items-center border-b border-black/5 pb-2">
                            <span className="font-extrabold uppercase text-xs tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                              {conf} CONFIDENCE OPENINGS
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${badgeClass}`}>
                              {conf === "HIGH" ? "Best Match (<80% cutoff)" : conf === "MEDIUM" ? "Good Match (80-100%)" : "Reach Match (100-120%)"}
                            </span>
                          </div>

                          {list.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {list.map((item: any, i: number) => (
                                <div key={i} className={`p-4 border rounded-xl flex flex-col justify-between ${colorClass}`}>
                                  <div>
                                    <h5 className="font-bold text-sm text-black mb-1">{item.collegeName}</h5>
                                    <p className="text-xs text-black/60 mb-2">{item.courseName}</p>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] pt-2 border-t border-black/5">
                                    <span className="text-black/50">General Cutoff: {item.cutoffRank}</span>
                                    <span className={`font-bold ${textClass}`}>Your Rank: {rankInput}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-black/45 leading-relaxed">No matching cutoff ranks in this confidence interval.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
