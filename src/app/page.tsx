"use client";

import { useState } from "react";
import Image from "next/image";

interface RoastStats {
  repo_naming: number;
  commit_dedication: number;
  language_diversity: number;
  readme_game: number;
  overall_energy: number;
}

interface RoastData {
  roast: string;
  personality_type: string;
  personality_description: string;
  stats: RoastStats;
  tips: string[];
}

interface UserData {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface RoastResponse {
  user: UserData;
  roast: RoastData;
}

const STAT_LABELS: Record<keyof RoastStats, string> = {
  repo_naming: "Repo Naming Game",
  commit_dedication: "Commit Dedication",
  language_diversity: "Language Diversity",
  readme_game: "README Game",
  overall_energy: "Overall Dev Energy",
};

function StatBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(10, value));
  const pct = clamped * 10;
  const color =
    clamped <= 3
      ? "from-red-500 to-red-600"
      : clamped <= 6
        ? "from-yellow-500 to-orange-500"
        : "from-green-400 to-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono font-bold text-orange-400">
          {clamped}/10
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoastResponse | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRoast(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (!result) return;
    const { user, roast } = result;
    const text = [
      `I just got my GitHub roasted by AI!`,
      ``,
      `Developer Type: ${roast.personality_type}`,
      `"${roast.personality_description}"`,
      ``,
      `Overall Dev Energy: ${roast.stats.overall_energy}/10`,
      ``,
      `Get roasted: ${window.location.origin}`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col flex-1 items-center font-sans">
      {/* Header */}
      <header className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            AI Roast My GitHub
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-16">
        {/* Hero + Form */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent leading-tight">
            Get Your GitHub
            <br />
            Roasted by AI
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto mb-8">
            Brutally honest. Hilariously savage. Surprisingly helpful.
            <br />
            Enter a username if you dare.
          </p>

          <form
            onSubmit={handleRoast}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <GitHubIcon />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                disabled={loading}
                className="w-full pl-14 pr-4 py-4 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 text-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Lighting the roast... 🔥" : "Roast Me 🔥"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 max-w-lg mx-auto">
              {error}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-zinc-800 rounded" />
                <div className="h-4 w-32 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="h-48 bg-zinc-800 rounded-xl" />
            <div className="h-32 bg-zinc-800 rounded-xl" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <Image
                src={result.user.avatar_url}
                alt={result.user.login}
                width={80}
                height={80}
                className="rounded-full ring-2 ring-orange-500"
              />
              <div>
                <h3 className="text-2xl font-bold text-zinc-100">
                  {result.user.name || result.user.login}
                </h3>
                <a
                  href={result.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-orange-400 transition-colors"
                >
                  @{result.user.login}
                </a>
                {result.user.bio && (
                  <p className="text-sm text-zinc-500 mt-1">
                    {result.user.bio}
                  </p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-zinc-500">
                  <span>
                    <strong className="text-zinc-300">
                      {result.user.public_repos}
                    </strong>{" "}
                    repos
                  </span>
                  <span>
                    <strong className="text-zinc-300">
                      {result.user.followers}
                    </strong>{" "}
                    followers
                  </span>
                  <span>
                    <strong className="text-zinc-300">
                      {result.user.following}
                    </strong>{" "}
                    following
                  </span>
                </div>
              </div>
            </div>

            {/* Developer Personality Type */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-950/50 to-red-950/50 border border-orange-800/50">
              <p className="text-sm uppercase tracking-widest text-orange-400 mb-2">
                Developer Personality Type
              </p>
              <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                {result.roast.personality_type}
              </h3>
              <p className="text-zinc-400 italic">
                &ldquo;{result.roast.personality_description}&rdquo;
              </p>
            </div>

            {/* The Roast */}
            <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
              <h4 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <span>🔥</span> The Roast
              </h4>
              <div className="text-zinc-300 leading-relaxed space-y-4">
                {result.roast.roast.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h4 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <span>📊</span> Stats Breakdown
              </h4>
              <div className="space-y-4">
                {(
                  Object.entries(STAT_LABELS) as [keyof RoastStats, string][]
                ).map(([key, label]) => (
                  <StatBar
                    key={key}
                    label={label}
                    value={result.roast.stats?.[key] ?? 5}
                  />
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <span>💡</span> Genuine Tips to Level Up
              </h4>
              <ul className="space-y-3">
                {result.roast.tips?.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300">
                    <span className="text-emerald-400 font-bold shrink-0">
                      {i + 1}.
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Share + Roast Again */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-xl font-bold bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                {copied ? "Copied! 📋" : "Share Roast 📤"}
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setUsername("");
                }}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105 active:scale-95 transition-all"
              >
                Roast Someone Else 🔥
              </button>
            </div>
          </div>
        )}

        {/* Footer tagline when no results */}
        {!result && !loading && (
          <div className="text-center mt-16 space-y-4">
            <p className="text-zinc-600 text-sm">
              No GitHub tokens needed. We only look at public data.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-zinc-500">
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                100% Free
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                AI-Powered Roasts
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                Brutally Honest
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                Actually Helpful
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800 py-6 text-center text-sm text-zinc-600">
        <p>
          Built with 🔥 and questionable humor.{" "}
          <a
            href="https://github.com/maxilylm/su-gitroast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            Star on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
