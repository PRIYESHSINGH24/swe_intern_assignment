"use client";

import { useState, useEffect, useRef } from "react";
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

export default function MainframeLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [copied, setCopied] = useState(false);

  // Background Video Mouse Scrub logic
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

  // Trigger action button entrance independent of typewriter
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // avoid scrolling to bottom
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
    const email = "hello@mainframe.co";
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
    "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const { displayed, done } = useTypewriter(typewriterText);

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
      <header className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center bg-transparent pointer-events-auto">
        {/* Logo */}
        <Link
          href="/"
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
          <Link href="/colleges" className="hover:opacity-60 transition-opacity">
            Labs
          </Link>
          <span className="mx-1 select-none">, </span>
          <Link href="/compare" className="hover:opacity-60 transition-opacity">
            Studio
          </Link>
          <span className="mx-1 select-none">, </span>
          <Link href="/predict" className="hover:opacity-60 transition-opacity">
            Openings
          </Link>
          <span className="mx-1 select-none">, </span>
          <Link href="/colleges" className="hover:opacity-60 transition-opacity">
            Shop
          </Link>
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/colleges"
          className="hidden md:block text-[23px] font-normal underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </Link>

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
        <Link
          href="/colleges"
          onClick={() => setIsMenuOpen(false)}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity"
        >
          Labs
        </Link>
        <Link
          href="/compare"
          onClick={() => setIsMenuOpen(false)}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity"
        >
          Studio
        </Link>
        <Link
          href="/predict"
          onClick={() => setIsMenuOpen(false)}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity"
        >
          Openings
        </Link>
        <Link
          href="/colleges"
          onClick={() => setIsMenuOpen(false)}
          className="text-[32px] font-medium hover:opacity-60 transition-opacity"
        >
          Shop
        </Link>
        <Link
          href="/colleges"
          onClick={() => setIsMenuOpen(false)}
          className="text-[32px] font-medium underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </Link>
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
              Hey there, meet A.R.I.A,
              <br />
              Mainframe's Adaptive Response Interface Agent
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
            <Link
              href="/colleges"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Pitch us an idea
            </Link>
            <Link
              href="/predict"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Come work here
            </Link>
            <Link
              href="/colleges"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Send a brief hello
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
            >
              See how we operate
            </Link>

            {/* Outline copy-email pill button */}
            <button
              onClick={handleCopy}
              className="relative inline-flex items-center justify-center bg-transparent text-white border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
            >
              <span>
                Reach us:{" "}
                <span className="underline underline-offset-1">
                  hello@mainframe.co
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
    </div>
  );
}
