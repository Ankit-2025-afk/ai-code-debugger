import React, { useState } from "react";

// ---------- Mock data (fake AI response) ----------
const mockReview = {
  id: 1,
  filename: "main.py",
  language: "Python",
  score: 82,
  date: "2025-11-20",
};

const mockResults = {
  score: 82,
  summary:
    "Your code is generally well-structured but can be optimized in a few places and improved for readability.",
  metrics: {
    accuracy: 92,
    readability: 78,
    performance: 84,
    bestPractices: 80,
    security: 76,
  },
  issues: [
    {
      type: "Error",
      line: 15,
      message: "Variable 'result' might be referenced before assignment.",
    },
    {
      type: "Warning",
      line: 24,
      message:
        "Loop can be replaced with list comprehension for better readability.",
    },
    {
      type: "Suggestion",
      line: 40,
      message: "Consider adding type hints to function parameters.",
    },
  ],
  improvedCode: `def process_items(items: list[int]) -> list[int]:
    results = []
    for item in items:
        if item % 2 == 0:
            results.append(item * 2)
    return results
`,
};

// ---------- Main App ----------
export default function App() {
  console.log("NEW VERSION");  // 👈 ADD THIS LINE

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewResults, setReviewResults] = useState(null);
  const [code, setCode] = useState("");

  const handleFakeLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleStartNewReview = () => {
    setCurrentPage("new-review");
  };

  // ✅ FIXED FUNCTION
  const handleRunReview = async () => {
    if (!code.trim()) {
      alert("Enter code first");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: code,
          language: "python"
        })
      });

      // 🔥 FIX: missing line in your code
      const data = await res.json();

      // 🔥 Convert backend → UI format
      const formattedResults = {
        score: data.runtime_error ? 60 : 90,

        summary: data.ai_explanation,

        metrics: {
          accuracy: data.runtime_error ? 60 : 90,
          readability: 80,
          performance: data.performance?.length ? 70 : 90,
          bestPractices: 80,
          security: data.security?.length ? 70 : 90,
        },

        issues: [
          ...(data.runtime_error
            ? [{
                type: "Error",
                line: "-",
                message: data.runtime_error
              }]
            : []),

          ...(data.logic || []).map((item) => ({
            type: "Warning",
            line: "-",
            message: item
          })),

          ...(data.performance || []).map((item) => ({
            type: "Suggestion",
            line: "-",
            message: item
          })),

          ...(data.security || []).map((item) => ({
            type: "Error",
            line: "-",
            message: item
          })),
        ],

        improvedCode: data.ai_explanation || "No suggestion"
      };

      setReviewResults(formattedResults);
      setCurrentPage("results");

    } catch (err) {
      alert("Backend error");
    }
  
};

  const handleViewHistoryItem = async () => {
  // later connect with backend history
};
  const handleBackToDashboard = () => {
  setCurrentPage("dashboard");
}; 
  
  

  

 return (
  <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
    <TopNav
      isAuthenticated={isAuthenticated}
      onLogoClick={() =>
        isAuthenticated
          ? setCurrentPage("dashboard")
          : setCurrentPage("landing")
      }
      onSignIn={handleFakeLogin}
    />

    <main className="flex-1 max-w-6xl w-full mx-auto px-4 pb-10 pt-4 space-y-4">
      {isAuthenticated && currentPage !== "dashboard" && (
        <div>
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {!isAuthenticated && currentPage === "landing" && (
        <Landing onGetStarted={handleFakeLogin} />
      )}

      {isAuthenticated && currentPage === "dashboard" && (
        <Dashboard
          onNewReview={handleStartNewReview}
          onViewHistory={handleViewHistoryItem}
        />
      )}

      {isAuthenticated && currentPage === "new-review" && (
        <NewReview
  code={code}
  setCode={setCode}
  onRunReview={handleRunReview}
  onCancel={handleBackToDashboard}
/>
      )}

      {isAuthenticated && currentPage === "results" && reviewResults && (
        <Results
          review={selectedReview || mockReview}
          results={reviewResults}
          onBack={handleBackToDashboard}
        />
      )}
    </main>

    <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
      AI-Based Code Review System
    </footer>
  </div>
);


// ---------- Layout components ----------
function TopNav({ isAuthenticated, onLogoClick, onSignIn }) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <button onClick={onLogoClick} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center">
            <span className="text-yellow-400 font-bold text-lg">AI</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold tracking-tight">
              Based Code Review System
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 hidden sm:inline-flex">
            Documentation
          </button>
          {isAuthenticated ? (
            <span className="text-xs text-slate-400">Logged in as Student</span>
          ) : (
            <button
              onClick={onSignIn}
              className="text-xs px-4 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-400 transition font-medium"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ---------- Pages ----------
function Landing({ onGetStarted }) {
  return (
    <section className="grid md:grid-cols-[1.2fr,1fr] gap-10 items-center mt-4">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-[11px] text-indigo-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>An AI Powered System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Review your code with
          <span className="text-indigo-400"> AI Systems</span>.
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-sm font-medium shadow-lg shadow-indigo-500/30"
          >
            Let's Begin – it's free
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md text-xs text-slate-300">
          <FeaturePill title="Multi-language" subtitle="Python, JS, C++ etc." />
          <FeaturePill title="Line-by-line review" subtitle="Pinpoint issues" />
          <FeaturePill title="AI suggested" subtitle="Auto-fix suggestions" />
          <FeaturePill title="Accuracy metric" subtitle="Shows code correctness" />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Preview · New Code Review</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
            Live mock UI
          </span>
        </div>
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs font-mono text-slate-200 h-40 overflow-hidden">
          <div className="flex gap-1 mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <pre className="text-[10px] leading-relaxed">
{`def calculate_discount(price, percentage):
    if percentage > 100:
        return price
    discount = price * (percentage / 100)
    final_price = price - discount
    return final_price

print(calculate_discount(1000, 10))`}
          </pre>
        </div>
        <div className="grid grid-cols-3 gap-3 text-[11px]">
          <MetricCard label="Quality" value="82" />
          <MetricCard label="Accuracy" value="92%" />
          <MetricCard label="Security" value="76" />
        </div>
      </div>
    </section>
  );
}

function Dashboard({ onNewReview, onViewHistory }) {
  return (
    <section className="mt-2 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            Start fresh or view previous queries in records.
          </p>
        </div>
        <button
          onClick={onNewReview}
          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-xs sm:text-sm font-medium"
        >
          + New Code Review
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.5fr,1fr] gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent reviews</h3>
            <button className="text-[11px] text-slate-400 hover:text-slate-200">
              View all
            </button>
          </div>

          <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
            <div className="grid grid-cols-[2fr,1fr,0.8fr,1fr,0.8fr] bg-slate-900/70 px-3 py-2 text-[11px] text-slate-400">
              <span>Filename</span>
              <span>Language</span>
              <span className="text-center">Score</span>
              <span>Date</span>
              <span className="text-center">Action</span>
            </div>
            <button
              onClick={onViewHistory}
              className="w-full grid grid-cols-[2fr,1fr,0.8fr,1fr,0.8fr] px-3 py-2 bg-slate-950/60 hover:bg-slate-900/80 border-t border-slate-800 text-left items-center"
            >
              <span className="truncate">main.py</span>
              <span>Python</span>
              <span className="text-center text-emerald-400 font-semibold">
                82
              </span>
              <span>20 Nov 2025</span>
              <span className="text-center text-indigo-300 text-[11px]">
                Open
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
            <h3 className="text-sm font-semibold">Quick stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatPill label="Total reviews" value="12" />
              <StatPill label="Avg score" value="79" />
              <StatPill label="Avg accuracy" value="92%" />
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <h3 className="text-sm font-semibold">Tip for viva / report</h3>
            <p className="text-slate-300 text-[11px]">
              Explain that accuracy represents how correct the code is based on
              detected errors and warnings. Higher accuracy means fewer issues.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewReview({ code, setCode, onRunReview, onCancel }) {
  return (
    <section className="mt-2 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            New code review
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            Paste your programme or upload a document.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-900/60"
        >
          Home
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-4 items-start">
        
        {/* LEFT SIDE */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          
          {/* Dropdowns */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 mb-1">Language</label>
              <select className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Python</option>
                <option>JavaScript</option>
                <option>C++</option>
                <option>Java</option>
                <option>Go</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 mb-1">Review type</label>
              <select className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Full review</option>
                <option>Logical Error</option>
                <option>Vulnerabilities</option>
                <option>Syntax Error</option>
              </select>
            </div>
          </div>

          {/* TEXTAREA */}
          <div className="space-y-2 text-xs mt-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Paste your code</span>
              <span className="text-[10px] text-slate-500">
                Or upload a file
              </span>
            </div>

            <textarea
              className="w-full h-60 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Paste your source code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          {/* Upload UI */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
            <h3 className="text-sm font-semibold">Upload file</h3>
            <p className="text-slate-400 text-[11px]">
              Support for .py, .js, .cpp, .java etc.
            </p>

            <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center space-y-2 bg-slate-950/60">
              <p className="text-[11px] text-slate-300">
                Drag & drop your file here, or
              </p>
              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px]">
                Browse files
              </button>
              <p className="text-[10px] text-slate-500">
                Max 1 MB for demo
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onRunReview}
              className="flex-1 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-xs font-medium"
            >
              Run AI review
            </button>

            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-900/60"
            >
              Cancel
            </button>
          </div>

          {/* Note */}
          <p className="text-[10px] text-slate-500">
            In your report: user input → AI model → scores → feedback generation.
          </p>
        </div>
      </div>
    </section>
  );
}

function Results({ review, results, onBack }) {
  return (
    <section className="mt-1 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Review results
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            This page shows overall score, accuracy, metrics, issues and
            improved code.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-900/60"
        >
          Back
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.1fr,1.1fr] gap-4 items-start">
        {/* Left column: Summary & issues */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400">File</p>
                <p className="text-sm font-semibold">{review.filename}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Language</p>
                <p className="text-sm font-semibold">{review.language}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 rounded-full border-[6px] border-slate-800 flex items-center justify-center relative">
                <div className="w-full h-full rounded-full border-[6px] border-emerald-500/80 absolute inset-0 rotate-[40deg]" />
                <span className="relative text-lg font-bold text-emerald-400">
                  {results.score}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p>{""}</p>
                <p className="text-[15px] text-emerald-400 font-semibold">
                  Accuracy: {results.metrics.accuracy}% (higher is better)
                </p>
                <p className="text-slate-400">
                  Accuracy is calculated based on number and severity of issues
                  found in the code.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[18px] mt-2">
              <MetricPill label="Accuracy" value={results.metrics.accuracy} />
              <MetricPill
                label="Readability"
                value={results.metrics.readability}
              />
              <MetricPill
                label="Performance"
                value={results.metrics.performance}
              />
              <MetricPill
                label="Best practices"
                value={results.metrics.bestPractices}
              />
              <MetricPill label="Security" value={results.metrics.security} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <h3 className="text-sm font-semibold flex items-center justify-between">
              Issues & suggestions
              <span className="text-[10px] text-slate-500">
                {results.issues.length} items
              </span>
            </h3>
            <div className="space-y-2 max-h-100 overflow-auto pr-1">
              {results.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="border border-slate-800 rounded-lg px-3 py-2 bg-slate-950/60 flex gap-3"
                >
                  <span
                    className={
                      "px-2 py-1 rounded-full text-[10px] h-min mt-0.5 " +
                      (issue.type === "Error"
                        ? "bg-rose-500/20 text-rose-300"
                        : issue.type === "Warning"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-sky-500/20 text-sky-300")
                    }
                  >
                    {issue.type}
                  </span>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-300">
                      Line {issue.line}: {issue.message}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Suggested fix generated by AI model.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Improved code */}
        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Improved code</h3>
              <button className="text-[10px] px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-900/60">
                Copy code
              </button>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-slate-200 max-h-85 overflow-auto">
              <pre>{results.improvedCode}</pre>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-300 space-y-2">
            <h3 className="text-sm font-semibold">How to explain this in viva</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                Accuracy = 1 − (weighted errors / total code size). You can
                mention this as your formula (even if it's conceptual).
              </li>
              <li>
                Each issue has a type (Error / Warning / Suggestion) and a line
                number to help debugging.
              </li>
              <li>
                The assistant not only detects problems but also generates
                improved code.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Small UI pieces ----------
function FeaturePill({ title, subtitle }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2">
      <p className="text-[11px] font-medium text-slate-100">{title}</p>
      <p className="text-[10px] text-slate-400">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function MetricPill({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-950/80 border border-slate-800 px-2.5 py-2 flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
}
