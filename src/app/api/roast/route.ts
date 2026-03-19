import { NextRequest } from "next/server";

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const sanitized = username.trim().replace(/[^a-zA-Z0-9-]/g, "");
    if (!sanitized) {
      return Response.json({ error: "Invalid username" }, { status: 400 });
    }

    // Fetch profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${sanitized}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }),
      fetch(
        `https://api.github.com/users/${sanitized}/repos?sort=updated&per_page=10`,
        {
          headers: { Accept: "application/vnd.github.v3+json" },
        }
      ),
    ]);

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return Response.json(
          { error: "GitHub user not found. Check the username and try again." },
          { status: 404 }
        );
      }
      return Response.json(
        { error: "Failed to fetch GitHub profile. Try again later." },
        { status: 502 }
      );
    }

    const user: GitHubUser = await userRes.json();
    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) /
        (1000 * 60 * 60 * 24 * 365)
    );

    const languages = [
      ...new Set(repos.map((r) => r.language).filter(Boolean)),
    ];
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const forkedCount = repos.filter((r) => r.fork).length;

    const profileSummary = `
GitHub Username: ${user.login}
Display Name: ${user.name || "Not set"}
Bio: ${user.bio || "No bio"}
Public Repos: ${user.public_repos}
Followers: ${user.followers}
Following: ${user.following}
Account Age: ${accountAge} years (created ${user.created_at.split("T")[0]})
Total Stars (top 10 repos): ${totalStars}
Forked Repos (of top 10): ${forkedCount}
Languages Used: ${languages.join(", ") || "None detected"}

Top Repositories:
${repos
  .map(
    (r) =>
      `- ${r.name}: ${r.description || "no description"} | Language: ${r.language || "unknown"} | Stars: ${r.stargazers_count} | Forks: ${r.forks_count}${r.fork ? " (FORKED)" : ""}`
  )
  .join("\n")}
`.trim();

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return Response.json(
        { error: "Server misconfigured: missing AI key" },
        { status: 500 }
      );
    }

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a brutally honest but funny developer comedian. You roast GitHub profiles with savage humor while being genuinely helpful. You MUST respond with valid JSON only, no markdown fences.`,
            },
            {
              role: "user",
              content: `Roast this GitHub profile. Be specific about their repos, languages, and habits. Return a JSON object with these exact keys:

1. "roast" - A savage roast (3-4 paragraphs, be funny and specific about their repos and habits). Use \\n\\n between paragraphs.
2. "personality_type" - A creative "Developer Personality Type" name (like "The README Perfectionist", "The Fork Collector", "The Lone Wolf Coder", etc.)
3. "personality_description" - A one-line funny description of that personality type
4. "stats" - An object with these keys, each rated 1-10: "repo_naming", "commit_dedication", "language_diversity", "readme_game", "overall_energy"
5. "tips" - An array of exactly 3 genuine, actionable tips to improve their GitHub profile

Here is the profile:

${profileSummary}`,
            },
          ],
          temperature: 0.9,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", errText);
      return Response.json(
        { error: "AI roast generation failed. Try again!" },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const roastContent = groqData.choices?.[0]?.message?.content;

    if (!roastContent) {
      return Response.json(
        { error: "AI returned empty roast. Even AI gave up on you." },
        { status: 502 }
      );
    }

    let roastJson;
    try {
      roastJson = JSON.parse(roastContent);
    } catch {
      console.error("Failed to parse Groq JSON:", roastContent);
      return Response.json(
        { error: "AI roast was too chaotic to parse. Try again!" },
        { status: 502 }
      );
    }

    return Response.json({
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        html_url: user.html_url,
      },
      roast: roastJson,
    });
  } catch (err) {
    console.error("Roast error:", err);
    return Response.json(
      { error: "Something went wrong. Even the server is roasting itself." },
      { status: 500 }
    );
  }
}
