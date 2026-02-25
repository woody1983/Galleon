# Galleon Research Report: Analysis of PRD v2.0 (Pragmatic Implementation)

## 1. Project Overview & Evolution
**Galleon** has evolved from a vision-led project to a **pragmatic, implementation-focused** development plan (v2.0). The core objective remains "Each Galleon counts," but the strategy now prioritizes a "Emotional Closed-Loop" early on—ensuring the app is rewarding to use even before advanced AI features are fully integrated.

## 2. Updated Technical Architecture
The strategy has shifted towards a more flexible and developer-friendly stack for 2026:
- **Framework**: Upgraded to **Next.js 15** App Router.
- **Storage Layer**: 
    - **Initial (Phase 1-2)**: **Dexie.js** (IndexedDB wrapper) for rapid development and lightweight storage.
    - **Future (Phase 3+)**: Migration path to **SQLite WASM** for advanced querying and larger datasets.
- **Hybrid AI Strategy**: 
    - **Local First**: Regex and template-based parsing for instantaneous categorization of simple inputs (e.g., "Coffee 35").
    - **Cloud Assisted**: Gemini API (User-provided keys) for complex multi-modal extraction (receipts/voice).
    - **Edge Future**: Long-term support for **WebLLM** (Phi-3/Qwen) to enable fully offline intelligence.
- **Schema & Validation**: **Zod** for strict type safety between Gemini outputs and the local database.

## 3. Core Functionality & UX Priority
The focus has sharpened on the **"3-second entry"** psychological hook:
- **Phase 1 MVP**: Prioritizes the "Input → Parse → Coin Drop Animation" loop.
- **Natural Language Parsing**: Initial emphasis on local rules to ensure zero-latency feedback.
- **PWA from Day 0**: Ensuring the app is installable and offline-capable from the start of development.

## 4. Refined Development Roadmap
The roadmap is now divided into more granular, solo-developer-optimized milestones:
1.  **Phase 0 (Foundation)**: Design system, PWA setup, and core layout.
2.  **Phase 1 (The Hook)**: Text-to-transaction loop with Dexie and "Coin Drop" physics.
3.  **Phase 2 (Management)**: Ledger history, filtering, and CRUD operations.
4.  **Phase 3 (Magic)**: Voice/Vision integration via Gemini (User Keys) and AI reasoning.
5.  **Phase 4 (Insights)**: Recharts visualization and anomaly detection.
6.  **Phase 5 (Refinement)**: Biometric security (WebAuthn), CSV exports, and polish.

## 5. Key Specificities & Implementation Risks
- **Privacy Assurance**: A hard commitment that data remains local. Gemini calls are only performed if the user provides their own key, clearly explained in the UI.
- **Migration Strategy**: The plan explicitly includes a `migration hook` to transition from IndexedDB to SQLite WASM if performance bottlenecks appear.
- **Emotional Design**: Motivation is managed through small wins (weekly demos) and immediate visual/auditory feedback (Coin Drop).

---
**Current Status**: Ready to begin **Phase 0**. The conceptual "Less, but better" philosophy from PRD v1 is now backed by a concrete, risk-aware execution path.

