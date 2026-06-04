"use client";

import { useState, useEffect, useCallback } from "react";

interface Exam {
  id: string;
  name: string;
  fullName: string;
  category: string;
  totalCutoffs: number;
}

interface Prediction {
  confidence: string;
  college: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    type: string;
    rating: number;
    accreditation: string | null;
  };
  course: {
    id: string;
    name: string;
    degreeType: string;
    fees: number;
    duration: string;
  };
  cutoffRank: number;
  year: number;
  yourRank: number;
  margin: number;
}

interface PredictionResult {
  exam: { name: string; fullName: string };
  inputParams: { rank: number; category: string };
  summary: {
    totalMatches: number;
    highConfidence: number;
    mediumConfidence: number;
    stretchChances: number;
  };
  predictions: {
    high: Prediction[];
    medium: Prediction[];
    stretch: Prediction[];
  };
  message?: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export default function PredictPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState("");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (data.success) {
        setExams(data.data.exams);
        if (data.data.exams.length > 0) setExamId(data.data.exams[0].id);
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    if (!examId || !rank) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        examId,
        rank,
        category,
      });
      const res = await fetch(`/api/predict?${params}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message || "Prediction failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function PredictionCard({ prediction, color }: { prediction: Prediction; color: string }) {
    const colorClasses: Record<string, string> = {
      green: "border-emerald-500/30 bg-emerald-500/5",
      yellow: "border-amber-500/30 bg-amber-500/5",
      red: "border-red-500/30 bg-red-500/5",
    };
    const badgeClasses: Record<string, string> = {
      green: "bg-emerald-500/20 text-emerald-400",
      yellow: "bg-amber-500/20 text-amber-400",
      red: "bg-red-500/20 text-red-400",
    };

    return (
      <div className={`rounded-xl border p-5 ${colorClasses[color]}`}>
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h4 className="font-bold text-white">{prediction.college.name}</h4>
            <p className="text-xs text-slate-400">
              {prediction.college.city}, {prediction.college.state}
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses[color]}`}>
            {prediction.confidence}
          </span>
        </div>
        <p className="mb-2 text-sm text-slate-300">{prediction.course.name}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span>Cutoff: #{prediction.cutoffRank.toLocaleString()}</span>
          <span>Margin: {prediction.margin > 0 ? "+" : ""}{prediction.margin.toLocaleString()}</span>
          <span>Fees: {formatCurrency(prediction.course.fees)}</span>
          <span>★ {prediction.college.rating}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
          College Predictor
        </h1>
        <p className="mt-2 text-slate-400">
          Enter your exam and rank to find colleges you can get into
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handlePredict}
        className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="exam-select" className="mb-1 block text-sm font-medium text-slate-400">
              Exam
            </label>
            <select
              id="exam-select"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.category})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rank-input" className="mb-1 block text-sm font-medium text-slate-400">
              Your Rank
            </label>
            <input
              id="rank-input"
              type="number"
              min={1}
              max={1000000}
              placeholder="e.g., 5000"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="category-select" className="mb-1 block text-sm font-medium text-slate-400">
              Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="GENERAL">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>
        <button
          id="predict-btn"
          type="submit"
          disabled={loading || !examId || !rank}
          className="mt-4 w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Predicting..." : "Predict Colleges"}
        </button>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </form>

      {/* Results */}
      {result && (
        <div>
          {/* Summary */}
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="mb-2 text-lg font-bold text-white">
              Results for {result.exam.name} — Rank #{result.inputParams.rank} ({result.inputParams.category})
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <p className="text-2xl font-bold text-emerald-400">{result.summary.highConfidence}</p>
                <p className="text-xs text-slate-400">High Confidence</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <p className="text-2xl font-bold text-amber-400">{result.summary.mediumConfidence}</p>
                <p className="text-xs text-slate-400">Medium</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3">
                <p className="text-2xl font-bold text-red-400">{result.summary.stretchChances}</p>
                <p className="text-xs text-slate-400">Stretch</p>
              </div>
            </div>
          </div>

          {result.message && (
            <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center text-slate-400">
              {result.message}
            </div>
          )}

          {/* High Confidence */}
          {result.predictions.high.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                High Confidence
              </h3>
              <div className="space-y-3">
                {result.predictions.high.map((p, i) => (
                  <PredictionCard key={i} prediction={p} color="green" />
                ))}
              </div>
            </div>
          )}

          {/* Medium Confidence */}
          {result.predictions.medium.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Medium Confidence
              </h3>
              <div className="space-y-3">
                {result.predictions.medium.map((p, i) => (
                  <PredictionCard key={i} prediction={p} color="yellow" />
                ))}
              </div>
            </div>
          )}

          {/* Stretch */}
          {result.predictions.stretch.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Stretch Chances
              </h3>
              <div className="space-y-3">
                {result.predictions.stretch.map((p, i) => (
                  <PredictionCard key={i} prediction={p} color="red" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
