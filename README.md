# 🪙 Galleon

个人财务管理 PWA，本地优先，无后端。

> "Less, but better." — Dieter Rams

---

## 🌟 Overview

Galleon is a local-first personal finance PWA. All data is stored in your browser's IndexedDB — no accounts, no servers, no telemetry. Type natural language to record expenses, browse history, and gain insight into your spending.

---

## 🛠 Tech Stack

| Layer | Choice |
|-------|--------|
| 🏗 Framework | Next.js 15 (App Router) |
| 🗄 Database | Dexie.js v4 (IndexedDB) |
| 🎨 UI | shadcn/ui + Tailwind CSS 4 |
| 🔷 Language | TypeScript |
| 📊 Charts | Recharts |
| 🎞 Animation | Framer Motion |
| ✅ Validation | Zod |
| 📱 PWA | next-pwa |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Feature Status

### Phase 0 — Design System ✅
- 🎨 Gold/silver design tokens, Dieter Rams aesthetic
- 🔤 Playfair Display + Inter + JetBrains Mono typography
- 🌙 Light / dark mode toggle (persisted in localStorage)
- 📐 Responsive layout: bottom tab bar (mobile) / sidebar (desktop)
- 🪙 Coin drop animation with spring physics (Framer Motion)
- 📲 PWA manifest — installable on mobile home screen

### Phase 1 — Basic Bookkeeping ✅
- ⌨️ Natural language input: type "咖啡 35" or "Starbucks 42 yuan"
- 🧠 Local NLP parser — zero latency, no AI dependency
  - 💰 Amount extraction (handles ¥/元/块/yuan/rmb)
  - 🏪 200+ merchant dictionary with auto-category mapping
  - 📅 Date keywords (今天/昨天/前天/yesterday)
  - 💵 Income detection (工资/salary/收入)
  - 📈 Confidence scoring (0.5–0.9)
- 🗂 10 preset categories: 餐饮 交通 购物 娱乐 居住 医疗 教育 投资 收入 其他
- 📋 Today page: live transaction list, daily income/expense/net summary
- ⚡ Brand quick-select: tap a category tag → pick a brand → instant entry
- ✏️ Edit / delete transactions
- 🔁 Duplicate detection (5-second window)
- 🪙 Coin drop animation + sound on successful save
- 🌱 Dev seed data: 50 realistic transactions across 30 days (dev mode only)

### Phase 2 — Ledger (History) ✅
- 📜 Timeline grouped by date with virtual list (`@tanstack/react-virtual`)
- 🔍 Full-text search across merchant, description, tags
- 🎛 Filters: category (multi-select), date range, amount range, income/expense
- ✏️ Edit and delete individual transactions
- 📦 Batch selection mode (long-press) with bulk delete
- 📊 Statistics cards: monthly totals, top 3 categories, average daily spend

### Phase 3 — Multi-Modal Input + AI Enhancement 🚧
<!--
  Step 3.1 — 🤖 Gemini API Integration
  - User-provided API key stored in Vault settings (localStorage + plaintext warning)
  - src/services/gemini/client.ts — wraps @google/generative-ai SDK
    - 3 retries with exponential backoff
    - 10-second timeout → falls back to local parser
  - src/services/gemini/prompts.ts — prompt templates for text and vision

  Step 3.2 — 🔀 Hybrid AI Pipeline
  - Local parser fires instantly (always shown first)
  - Gemini fires async when: input length > 20 chars OR local confidence < 0.7
  - Non-intrusive "AI suggests: [category]" chip — user accepts or dismisses
  - Gemini never auto-overrides local result

  Step 3.3 — 🎤 Voice Input
  - Long-press 🎤 to record, release to stop
  - Web Speech API, zh-CN priority with en-US fallback
  - Real-time transcript shown in input field
  - Falls back to local parser if no Gemini key
  - Graceful degradation: hides button when Web Speech API unavailable

  Step 3.4 — 📷 Photo / Receipt Input
  - Tap 📷 to capture or upload a receipt image
  - Gemini Vision parses receipt → structured transaction
  - Image compressed (JPEG 0.6, max 800px) and stored as Blob in IndexedDB
  - Non-receipt images show "这好像不是收据？" with manual entry fallback

  Step 3.5 — 🟡 AI Confidence & Review UI
  - Transactions with confidence < 0.7 get a yellow "需要确认" badge
  - "Review Queue" section at top of Today page for needsReview transactions
  - Collapsible aiReasoning tooltip on each transaction card

  Exit criteria: snap a receipt OR say "昨天打车二十八" → structured entry with AI reasoning.
  Works offline with graceful degradation when no API key or network.
-->

### Phase 4 — Insight 📋
<!--
  Step 4.1 — 📈 Recharts Visualizations
  - Monthly trend line: income vs expense over last 6 months
  - Category donut chart: spending breakdown for selected month
  - Daily bar chart: current month spend by day

  Step 4.2 — 🚨 Anomaly Detection (local)
  - Week-over-week category spend increase > 30% → alert card
  - Duplicate charge detection (same merchant + amount within 24 hours)

  Step 4.3 — 💬 Natural Language Queries (local rules)
  - "这周外卖花了多少" → filter + sum
  - Regex template matching; unmatched → "我还不太会回答这个问题，但我在学习中！"

  Step 4.4 — 🎯 Budget System
  - Monthly budget limits per category
  - Progress bars (current / budget)
  - Alert at 80% consumption

  Exit criteria: open Insight page → trend charts + anomaly alerts + budget progress.
-->

### Phase 5 — Vault + Polish 📋
<!--
  Step 5.1 — 🔐 Biometric Lock
  - WebAuthn (FaceID / TouchID / Windows Hello) with PIN fallback

  Step 5.2 — 💾 Data Export / Import
  - CSV export with BOM (Excel-compatible for Chinese characters)
  - JSON backup and restore

  Step 5.3 — 👋 Onboarding Flow
  - 3-screen first-launch tutorial

  Step 5.4 — 🌙 Dark Mode Audit
  - WCAG AA contrast check across all components and charts

  Step 5.5 — ⚡ Performance
  - Bundle analysis, lazy-load Insight and Vault, Dexie index tuning
  - Target: < 3s first load, < 100ms entry feedback

  Step 5.6 — ⚙️ Settings Page
  - Gemini API key management (add / remove / test)
  - Sound toggle, theme toggle
  - Storage usage indicator
  - About page (Dieter Rams quote + MIT License)

  Exit criteria: complete, polished v1.0 ready for public sharing.
-->

### Phase 6 — Optional Extensions 🔭
<!--
  - 🧠 WebLLM: Phi-3 / Qwen2.5-7B for fully offline AI (no API key needed)
  - 🗃 SQLite WASM: replace Dexie for SQL-powered complex queries
  - 🔒 E2E encrypted sync: self-hosted sync server
  - 🌍 Multi-currency / multi-account support
-->

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── page.tsx          # 📅 Today page (default)
│   ├── ledger/           # 📜 History timeline
│   ├── insight/          # 📊 Charts & analysis (Phase 4)
│   ├── vault/            # 🔐 Settings & data (Phase 5)
│   └── layout.tsx        # 🏗 Root layout with navigation
├── components/
│   ├── ui/               # 🎨 shadcn/ui base components
│   ├── animation/        # 🪙 Coin drop animation
│   ├── category/         # 🗂 Category selector
│   ├── galleon/          # ⚡ Brand quick-select
│   └── layout/           # 📐 NavShell
├── hooks/
│   └── useTransactions.ts  # 🔁 All DB operations (CRUD + live queries)
├── services/
│   └── parser/
│       └── localParser.ts  # 🧠 NLP parser (no AI dependency)
├── lib/
│   ├── db.ts             # 🗄 Dexie schema & configuration
│   ├── constants.ts      # 🎨 Categories, colors
│   ├── brands.ts         # 🏪 Merchant dictionary (~200 entries)
│   └── seed.ts           # 🌱 Dev seed data script
└── types/
    └── transaction.ts    # 🔷 Zod schema + TypeScript types
```

---

## 🔒 Privacy

- 🚫 **Zero telemetry.** No analytics, no tracking.
- 💾 **All data is local.** IndexedDB in your browser, never leaves your device.
- 🔑 **API key (Phase 3+)** is sent only to Google's Gemini endpoint, never stored server-side.

---

## 📄 License

MIT
