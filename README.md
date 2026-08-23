# Roast My GitHub

> Enter a GitHub username and get a savage — but genuinely useful — AI critique of the profile behind it.

**[Live demo](https://su-gitroast.vercel.app)**

Most profile-feedback tools are polite enough to be useless. This one pulls a real profile from the GitHub REST API along with its ten most recently updated repositories, derives stats the model can actually be specific about (account age, total stars, forked-repo count, languages in play), and hands that summary to Llama 3.3 with instructions to roast it. The result comes back as structured JSON — a multi-paragraph roast, a made-up developer archetype, five numeric ratings, and three real improvement tips — so the UI can render it rather than dump a wall of text.

## Features

- Live GitHub data: profile plus the ten most recently updated repos, fetched in parallel
- Multi-paragraph roast grounded in actual repo names, descriptions, and languages
- A generated "Developer Personality Type" with a one-line description
- Five scored dimensions (repo naming, commit dedication, language diversity, README game, overall energy)
- Three actionable tips for improving the profile
- Copy-to-clipboard share summary of the roast

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- GitHub REST API (unauthenticated) for profile and repo data
- Groq API — `llama-3.3-70b-versatile` in JSON mode
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`. The GitHub calls are unauthenticated and need no token.

---

Part of a series of 91 small web apps. [Browse them all](https://su-slopmachine.vercel.app).
