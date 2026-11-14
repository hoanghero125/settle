# Settle

**Snap it. Settled.** — Chụp là xong việc giấy tờ.

Settle is a mobile app for Vietnamese people living and working abroad. Photograph an official paper in any language (a city-hall letter, a tax or insurance notice, a payslip) and Settle does the paperwork for you:

1. **Files it** — works out what the paper is, who sent it, the amount and the deadline, and adds it to your task list.
2. **Sets the reminder** — schedules a phone notification before the deadline, with undo.
3. **Drafts the reply** — a message, email or counter phrase in the paper's language with its Vietnamese meaning, ready to send or play aloud.

There is no chat box and nothing to type. Without the AI the user needs an interpreter.

## Status

Hackathon build. Scope, owners and timeline: [docs/PLAN.md](docs/PLAN.md). Brief and scoring: [CHALLENGE.md](CHALLENGE.md).

## Run it

Requires Node 22 or newer.

```bash
npm install
cp .env.example .env.local     # add OPENAI_API_KEY
npm run check:models           # pick models the key can call, put them in .env.local
npm run dev                    # http://localhost:3000
```

To build screens before the AI route exists, set `NEXT_PUBLIC_USE_MOCKS=1` in `.env.local`. That mode is for development only.

| Command | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest |
| `npm run build` | Production build |

## How it is built

- **Next.js + TypeScript + Tailwind** on Vercel: the screens, and the server routes that keep the OpenAI key off the phone.
- **Capacitor** wraps the deployed app as an Android APK. Features reach the installed app through a Vercel deploy; the APK is rebuilt only when native code changes.
- **OpenAI API**: vision with structured output for the main flow, text-to-speech for reading results and drafts aloud.
- **Contract first**: `src/lib/contracts` defines what the AI returns and what the UI renders.

More in [CLAUDE.md](CLAUDE.md).

## Install on an Android phone

1. Set the repository variable `APP_URL` to the production URL, then run the **Android APK** workflow (Actions tab).
2. On the phone, open the [`apk-latest` release](../../releases/tag/apk-latest), download `settle.apk`, and allow installing from the browser when asked.

Every build is signed with the same debug key, so a new APK installs over the old one and keeps your tasks.

## Team

| | Role |
|---|---|
| Đỗ Phạm Bảo Hoàng | Lead, platform, evidence, demo |
| Hoàng Quốc Anh | AI and backend |
| Nguyễn Nam Hải | Mobile UI |

How we work: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
