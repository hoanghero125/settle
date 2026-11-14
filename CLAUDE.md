# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Settle is a hackathon project (5-hour build). Vietnamese people living abroad photograph an official paper in any language; one AI call files it as a task, schedules a deadline reminder on the phone, and drafts the reply in the paper's language. The product must read as AI doing the work, not AI answering questions.

Read `CHALLENGE.md` (the brief and the scoring rubric) and `docs/PLAN.md` (scope, owners, timeline) before proposing product or architecture changes. The rubric is what decides trade-offs: 40 points for the main AI flow running live in an installed app on a real phone after a full close and reopen, 35 for a real problem with evidence, 25 for a concrete path to first users and global reach.

## Commands

```bash
npm run dev            # http://localhost:3000
npm run lint
npm run typecheck
npm test               # vitest, all tests
npx vitest run src/lib/store/tasks.test.ts   # one file
npx vitest run -t "nearest deadline"         # one test by name
npm run build
npm run check:models   # lists the models the organiser's key can call (needs .env.local)
npm run android:sync   # copy config into android/ (CI does this; rarely needed locally)
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, build on every PR; `main` only takes green PRs.

Next.js here is 16.x with Cache Components on. Its APIs differ from older versions: read the relevant guide under `node_modules/next/dist/docs/` before writing Next.js code (see `AGENTS.md`).

## Architecture

One Next.js app deployed on Vercel serves two things: the web app, and the server routes that hold the OpenAI key. The Android app is a Capacitor shell (`android/`, `capacitor.config.ts`) whose WebView loads the deployed URL. Consequences:

- A feature ships by merging to `main` (Vercel deploys it); the installed app picks it up on next open. No APK rebuild.
- The APK is rebuilt (`.github/workflows/android.yml`, run by hand or on a `v*` tag) only when a Capacitor plugin or anything under `android/` changes. Adding a plugin late means reinstalling on the demo phone.
- The same screens run as a plain web page for remote testers, so native features must degrade: everything native goes through `src/lib/native`, which no-ops or falls back on the web.

Data flow of the main flow:

```
camera <input capture> → src/lib/image/downscale.ts (≤1600px JPEG data URL)
  → src/lib/api-client (timeout, typed errors, dev mock switch)
  → POST /api/process (src/app/api/process/route.ts → src/lib/ai, vision + structured output)
  → PaperworkAnalysis → src/lib/store (localStorage task list) + src/lib/native (reminder, share)
```

`src/lib/contracts` is the seam between people. `PaperworkAnalysis` (zod) is what the AI route returns and what the UI renders; request, response and error shapes for every route live beside it. `src/fixtures` holds sample analyses that satisfy the schema, and `contracts.test.ts` keeps them honest. UI work proceeds against fixtures while the route is built to the same schema.

`src/app/page.tsx` is a scaffold screen that proves the wiring; the real screens belong in `src/features/{tasks,processing,result}` and are composed by `page.tsx` as a single-page flow.

## Hard rules

- The OpenAI key is server side only. Never import `src/lib/ai` from a client component; never add a `NEXT_PUBLIC_` variable holding a secret.
- All AI goes through the OpenAI API. Model names come from env via `src/lib/ai/models.ts`; do not hardcode one.
- `NEXT_PUBLIC_USE_MOCKS=1` is for local UI work only. Nothing shown to judges may come from fixtures.
- Routes report failure only through `errorResponse` (`src/lib/server/respond.ts`); the UI shows `ApiClientError.message`. No blank screens, no raw error text.
- Structured-output schemas use `.nullable()`, never `.optional()`.
- Phone numbers and links shown to users come from `src/data/support-contacts.json` (each entry carries its official source), never from model output.
- Reversible actions (filing a task, scheduling a reminder) happen automatically with an undo. Anything that leaves the phone (sending a message) is drafted by the AI and sent by the user.
- A low-confidence deadline is shown in amber and never auto-schedules a reminder.
- Nothing from a document is stored server side or logged. The feedback route receives a thumbs value only.
- UI copy is Vietnamese, in done-verbs ("Đã đặt nhắc"), sentence case. Follow `docs/DESIGN.md`; add a token to `src/app/globals.css` before using a raw colour.
- Changing `src/lib/contracts` affects all three people: do it in its own PR and say so.

## Ownership

| Area | Owner |
|---|---|
| `src/lib/ai`, `src/app/api/process`, `src/app/api/feedback`, eval script | Nguyễn Tiến Hoàng |
| `src/features`, `src/components`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/store` | Phùng Hải Đăng |
| `src/lib/native`, `src/app/api/speech`, `android/`, `.github/`, `docs/`, `src/data` | Đỗ Phạm Bảo Hoàng |

Stay inside the area of the person you are working for. If a task needs a change elsewhere, keep it minimal and call it out in the PR.

## Workflow

- Branch from `main`: `feat/<area>-<slug>`, `fix/…`, `docs/…`, `chore/…`. Open a PR; squash merge when CI is green.
- Conventional Commits (`feat(ui): …`, `fix(ai): …`). No AI co-author trailers or attribution lines in commits or PRs.
- Issues are written as briefs (goal, files, contract, acceptance check); link the issue in the PR.
- Feature freeze is in `docs/PLAN.md`. After it, fixes only.
