# Galleon — Detailed Implementation Plan
<!-- 完整实施方案：每一步、每个决策点、每个边界情况 -->

> **Philosophy**: Build the addictive emotional loop first, then layer intelligence on top.
> （核心理念：先做出让人上瘾的情感闭环，再逐步叠加智能。）

---

## Phase 0: Initialization & Design System
<!-- 阶段0：项目初始化与设计系统搭建 — 预计5-7天 -->

### Step 0.1 — Project Scaffolding
<!-- 项目骨架搭建 -->
1. Initialize a **Next.js 15** project with the App Router, TypeScript, and ESLint.
2. Install core dependencies: `tailwindcss`, `framer-motion`, `dexie`, `zod`, `recharts`, `date-fns`, `lucide-react`, `clsx`, `tailwind-merge`.
   <!-- 安装核心依赖，注意版本锁定 -->
3. Install `shadcn/ui` CLI and initialize the component library.
4. Set up path aliases (`@/components`, `@/hooks`, `@/services`, `@/lib`).

   **Decision Point**: shadcn/ui requires a specific Tailwind config. Run `npx shadcn-ui@latest init` and choose the "New York" style for a cleaner Rams-esque look.
   <!-- 决策点：shadcn/ui 初始化时选 "New York" 风格，更贴合 Rams 的克制美学 -->

   **Edge Case**: Next.js 15 may have breaking changes with certain shadcn components. Pin the shadcn version and test each imported component individually.
   <!-- 边界情况：Next.js 15 可能与某些 shadcn 组件有兼容问题，需逐个验证 -->

### Step 0.2 — Design System (CSS Variables)
<!-- 设计系统实现 — 把 PRD 的视觉规范变成代码 -->
1. Define the full CSS custom property palette in `globals.css`:
   - Gold spectrum: `--galleon-gold`, `--galleon-gold-light`, `--galleon-gold-dark`
   - Silver: `--gringotts-silver`, `--gringotts-silver-dark`
   - Ink/text hierarchy: `--ink-primary`, `--ink-secondary`, `--ink-tertiary`
   - Backgrounds: `--parchment`, `--parchment-dark`, `--midnight`
   - Status colors: `--spell-success` (income), `--spell-danger` (expense), `--spell-info`
   <!-- 颜色变量定义，源自"金币与炼金术"主题 -->
2. Set up the font stack via Google Fonts:
   - Display: `Playfair Display` + `Noto Serif SC`
   - Body: `Inter` + `PingFang SC`
   - Mono: `JetBrains Mono`
   <!-- 中西文字体混排方案 -->
3. Define the 8px base grid spacing system (`--space-xs` through `--space-xxl`).
4. Define border radii tokens (`--radius-sm: 4px`, `--radius-md: 8px`, `--radius-full: 9999px`).
   <!-- 间距与圆角：Rams 式克制精确 -->

   **Decision Point**: Dark mode strategy — use CSS `prefers-color-scheme` media query AND a manual toggle. Store the preference in `localStorage`.
   <!-- 决策点：深色模式用 CSS 媒体查询 + 手动切换，偏好存 localStorage -->

   **Edge Case**: `Noto Serif SC` is a large CJK font. Subset it or use `font-display: swap` to prevent FOIT (Flash of Invisible Text).
   <!-- 边界情况：中文衬线字体文件很大（数 MB），需要子集化或用 swap 策略避免页面闪烁 -->

### Step 0.3 — Core Layout & Navigation
<!-- 核心布局与导航结构 -->
1. Create the root layout (`src/app/layout.tsx`) with:
   - A responsive sidebar / bottom tab bar (mobile: bottom tabs, desktop: sidebar).
   - Four navigation items: Today, Ledger, Insight, Vault.
   <!-- 四个主要导航项：今日、账本、洞察、金库 -->
2. Create placeholder page files:
   - `src/app/page.tsx` → Today (default)
   - `src/app/ledger/page.tsx`
   - `src/app/insight/page.tsx`
   - `src/app/vault/page.tsx`

   **Decision Point**: Bottom tab bar vs sidebar for mobile. The PRD wireframe shows a bottom bar approach. Use a shared `<NavShell>` component that renders differently based on viewport.
   <!-- 决策点：移动端用底部标签栏，桌面端用侧边栏，共享 NavShell 组件 -->

   **Edge Case**: Route transitions. Use `framer-motion` `AnimatePresence` at the layout level to get smooth page transitions without blocking navigation.
   <!-- 边界情况：路由过渡动画不能阻塞导航，用 AnimatePresence 包裹 -->

### Step 0.4 — PWA Configuration
<!-- PWA 配置 — 从第一天起就可安装、可离线 -->
1. Configure `next-pwa` (or manual Service Worker if `next-pwa` is incompatible with Next.js 15).
2. Create `manifest.json` with app name "Galleon", theme color `#D4AF37`, and icons.
3. Define a basic caching strategy: cache-first for static assets, network-first for API routes.

   **Decision Point**: `next-pwa` vs manual SW. Check compatibility with Next.js 15 App Router first. If broken, use `workbox` directly.
   <!-- 决策点：next-pwa 若不兼容 Next.js 15，则直接用 workbox 手写 Service Worker -->

   **Edge Case**: Service Worker lifecycle. On first install, the SW won't control the page until refresh. Show a subtle "App ready for offline" toast.
   <!-- 边界情况：Service Worker 首次安装后需刷新才能控制页面，考虑显示提示 -->

### Step 0.5 — Coin Drop Animation (Standalone)
<!-- 金币掉落动画 — 独立组件，本阶段可单独运行验证 -->
1. Build `CoinDrop.tsx` using Framer Motion with spring physics:
   - `stiffness: 200`, `damping: 15`
   - 🪙 emoji + amount display, centered overlay, `pointer-events: none`.
2. Add the coin drop sound effect (`public/sounds/coin-drop.mp3`).
3. Create a trigger mechanism: `useCoinDrop()` hook that plays the animation + sound.

   **Decision Point**: Sound on by default? The PRD says "(可关闭)". Default to ON, but respect `localStorage` preference and system mute state.
   <!-- 决策点：音效默认开启，但需响应用户偏好和系统静音状态 -->

   **Edge Case**: iOS Safari blocks autoplay audio. The sound must be triggered by a user gesture (the form submit counts).
   <!-- 边界情况：iOS Safari 阻止自动播放音频，必须由用户手势触发 -->

**Phase 0 Exit Criteria**: PWA installable, light/dark mode toggle works, Coin Drop animation runs independently.
<!-- 阶段0验收标准：可安装为 PWA，深浅模式切换流畅，金币掉落动画可独立运行 -->

---

## Phase 1: Basic Bookkeeping Closed-Loop (MVP)
<!-- 阶段1：基础记账闭环 — 预计2-3周 — 这是情感"上瘾"的关键 -->

### Step 1.1 — Data Schema (Dexie.js)
<!-- 数据层定义 -->
1. Define the `Transaction` schema with Dexie:
   ```
   id            - auto-increment primary key
   amount        - number (always positive)
   type          - "expense" | "income"
   currency      - "CNY" (fixed for v1)
   category      - string, from preset enum
   merchant      - string
   description   - string
   date          - ISO 8601 string (YYYY-MM-DD)
   createdAt     - timestamp
   confidence    - number (0-1), default 1.0 for manual entries
   needsReview   - boolean, default false
   tags          - string[]
   aiReasoning   - string (optional)
   source        - "text" | "voice" | "photo" | "manual"
   ```
   <!-- 交易数据模型：包含 AI 置信度和来源追踪 -->
2. Create indices on `date`, `category`, `type` for efficient queries.
3. Write a `migration hook` placeholder in the DB initialization for future SQLite WASM migration.
   <!-- 预留迁移钩子，Phase 3+ 可能切换到 SQLite WASM -->

   **Decision Point**: Store `date` as ISO string or as a Date object? Use ISO string for serialization safety, parse with `date-fns` for display.
   <!-- 决策点：日期存 ISO 字符串（序列化安全），用 date-fns 解析显示 -->

   **Edge Case**: IndexedDB storage limits vary by browser (Safari ~1GB, Chrome ~80% of disk). For a personal accounting app this is unlikely to be hit, but add a storage usage indicator in Vault.
   <!-- 边界情况：IndexedDB 存储上限因浏览器而异，在 Vault 页添加存储用量指示器 -->

### Step 1.2 — Category System
<!-- 分类系统 -->
1. Define 10 preset categories (matching PRD):
   `餐饮, 交通, 购物, 娱乐, 居住, 医疗, 教育, 投资, 收入, 其他`
   <!-- 10 个预设分类，与 PRD Gemini 提示词一致 -->
2. Each category gets:
   - An emoji icon (☕🚕🛍️🎮🏠💊📚💰💵📦)
   - A display color (derived from design system)
3. Store as a constant enum in `src/lib/constants.ts`.

   **Decision Point**: Allow custom categories in v1? **No.** Keep it simple. Custom categories are a Phase 4+ feature to avoid schema complexity.
   <!-- 决策点：v1 不支持自定义分类，保持简单 -->

### Step 1.3 — Natural Language Parser (Local Rules)
<!-- 自然语言解析器 — 本地规则版，不依赖 AI，零延迟 -->
1. Build `src/services/parser/localParser.ts`:
   - Input: a raw text string (e.g., "星巴克 35", "lunch Starbucks 35 yuan", "打车28")
   - Output: a partial `Transaction` object validated by Zod.
   <!-- 输入自然语言，输出 Zod 校验后的结构化交易数据 -->
2. Parsing strategy (ordered):
   - **Amount extraction**: Regex for numbers, handling 元/块/¥/yuan/rmb suffixes.
   - **Merchant extraction**: Match against a built-in dictionary of ~200 common merchants (Starbucks, McDonald's, Didi, etc.) + use the remaining non-number text.
   - **Category inference**: Merchant → category mapping table. If no match, default to "其他".
   - **Date extraction**: Look for 昨天/前天/today/yesterday patterns. Default: today.
   - **Type inference**: Default "expense". Keywords like 工资/salary/收入 trigger "income".
   <!-- 解析策略：金额提取 → 商户匹配 → 分类推理 → 日期识别 → 收支判断 -->
3. Set `confidence` based on parse completeness:
   - Amount + merchant found → 0.9
   - Amount only → 0.7
   - Ambiguous → 0.5 (set `needsReview: true`)
   <!-- 置信度打分：信息越完整，置信度越高 -->

   **Decision Point**: How to handle Chinese number words (二十八 = 28, 一百五 = 150)?
   - Phase 1: Support basic patterns only (数字). Full Chinese number word support is Phase 3 (via Gemini).
   <!-- 决策点：中文数字词（如"二十八"）Phase 1 暂不支持，Phase 3 由 Gemini 处理 -->

   **Edge Cases**:
   - "咖啡 35 外卖费 5" → Multiple amounts in one input. Phase 1: take the first amount only. Show a "split entry?" prompt in Phase 3.
   - "人均150" → "per person" semantics. Phase 1: treat as total amount. Gemini can handle "per person" logic later.
   - Empty input or gibberish → Return `null`, show a gentle error ("没听懂，再试一次？🪙").
   <!-- 边界情况：多金额输入、"人均"语义、空输入或乱码 -->

### Step 1.4 — Today Page (Core UI)
<!-- 今日页 — 应用的默认着陆页 -->
1. **Top Bar**: Date display (e.g., "周二, 2月26日") + daily balance summary.
   <!-- 顶栏：日期 + 今日余额 -->
2. **GalleonInput Component** (the hero):
   - A prominent text input with placeholder: "今天花了什么？"
   - Action buttons: 🎤 (disabled in Phase 1), 📷 (disabled in Phase 1), ⚡ (quick entry).
   - On submit: parse → validate → save to Dexie → trigger Coin Drop → refresh list.
   <!-- 核心输入组件：提交后触发 解析→校验→存储→金币动画→刷新列表 -->
3. **Transaction List**: Today's entries in reverse-chronological order.
   - Each card shows: emoji, merchant, amount, time, category tag, confidence badge.
   - Swipe right to confirm (if `needsReview`), swipe left to edit/delete.
   <!-- 今日交易列表：显示商户、金额、分类、置信度 -->
4. **Daily Summary Card**: Total income, total expense, net for the day.

   **Decision Point**: Optimistic UI — show the new transaction immediately before Dexie write completes, then reconcile.
   <!-- 决策点：乐观更新 — 先显示再存储，让用户感觉"瞬间完成" -->

   **Edge Cases**:
   - Very long merchant names → Truncate with ellipsis at 20 chars.
   - Negative amounts entered → Convert to positive, treat as expense.
   - Timezone issues → Use the browser's local timezone via `Intl.DateTimeFormat`.
   <!-- 边界情况：长商户名截断、负数金额处理、时区问题 -->

### Step 1.5 — Transaction CRUD Hook
<!-- 交易数据的增删改查 Hook -->
1. Build `useTransactions.ts`:
   - `addTransaction(data)` → parse + validate + save + trigger animation.
   - `getToday()` → filter by today's date, sorted by `createdAt` desc.
   - `deleteTransaction(id)` → soft delete? **No.** Hard delete for simplicity in Phase 1.
   - `updateTransaction(id, data)` → for manual corrections.
   <!-- CRUD 操作封装，Phase 1 用硬删除 -->
2. Use Dexie's live queries (`useLiveQuery`) for reactive UI updates.

   **Edge Case**: Race condition on rapid double-submit. Debounce the submit handler (300ms) and check for duplicate entries (same amount + merchant within 5 seconds).
   <!-- 边界情况：快速双击提交 — 防抖300ms + 5秒内相同金额和商户视为重复 -->

### Step 1.6 — Seed Data Script
<!-- 测试数据生成脚本 -->
1. Create a dev-only script that inserts 50 realistic test transactions spanning 30 days.
2. Cover all 10 categories with realistic merchant names and amounts.
   <!-- 生成50条覆盖所有分类的测试数据，跨度30天 -->

**Phase 1 Exit Criteria**: Type "咖啡 35" → see it parsed, stored, listed, with a Coin Drop animation. Fully offline.
<!-- 阶段1验收标准：输入"咖啡 35" → 解析、存储、显示、金币掉落，全程离线 -->

---

## Phase 2: Ledger (History View)
<!-- 阶段2：账本历史视图 — 预计2周 -->

### Step 2.1 — Timeline View
<!-- 时间线视图 -->
1. Group transactions by date (day headers like "2月26日 周三").
2. Within each day, show entries in reverse-chronological order.
3. Add infinite scroll / virtual list for performance with large datasets.
   <!-- 按日分组，日内倒序，大数据量用虚拟列表 -->

   **Decision Point**: Virtual list library? Use `@tanstack/react-virtual` — lightweight and well-maintained.
   <!-- 决策点：虚拟列表用 @tanstack/react-virtual -->

   **Edge Case**: Days with no transactions should not show empty headers.
   <!-- 边界情况：无交易的日期不显示空标题 -->

### Step 2.2 — Search & Filter
<!-- 搜索与筛选 -->
1. Full-text search across `merchant`, `description`, `tags`.
2. Filters:
   - By category (multi-select chips)
   - By date range (preset: today, this week, this month, custom)
   - By amount range (min/max sliders)
   - By type (income / expense / all)
   <!-- 支持按分类、日期、金额、收支类型筛选 -->
3. Combine filters with AND logic. Show active filter count as a badge.

   **Edge Case**: Dexie compound index limitations — building complex queries may require loading all data and filtering in-memory. For <10,000 records this is fine. This is exactly where the SQLite WASM migration becomes valuable.
   <!-- 边界情况：Dexie 复合索引有限，复杂查询可能需内存过滤。<1万条数据没问题，这也是为何预留了 SQLite WASM 迁移路径 -->

### Step 2.3 — Edit & Delete
<!-- 编辑与删除 -->
1. Tap a transaction → open an edit modal with pre-filled fields.
2. Allow editing: amount, category, merchant, description, date.
3. Delete with confirmation dialog (swipe-left gesture on mobile, delete button in modal).
4. Batch operations: long-press to enter selection mode, bulk delete.
   <!-- 单条编辑/删除 + 批量操作模式 -->

   **Edge Case**: Editing a transaction's date moves it to a different day group. The timeline should re-sort reactively.
   <!-- 边界情况：修改日期后交易会跳到不同的日期分组，列表需响应式重排 -->

### Step 2.4 — Statistics Cards
<!-- 简单统计卡片 -->
1. Monthly summary cards at the top of the Ledger:
   - Total income / expense / net
   - Top 3 spending categories (mini donut chart or bar)
   - Average daily spend
   <!-- 月度汇总：收支净额、Top3 支出分类、日均消费 -->

**Phase 2 Exit Criteria**: Can scroll through history, search by keyword, filter by category/date, edit and delete entries. Data persists across sessions.
<!-- 阶段2验收标准：可浏览历史、搜索、筛选、编辑、删除，数据持久化 -->

---

## Phase 3: Multi-Modal Input + AI Enhancement
<!-- 阶段3：多模态输入 + AI 增强 — 预计3周 — 差异化的关键阶段 -->

### Step 3.1 — Gemini API Integration
<!-- Gemini API 集成 — 用户自备 Key -->
1. User provides their Gemini API key in Vault settings. Store in `localStorage` (encrypted with a simple key derived from a user-set PIN, or plaintext with a clear warning).
   <!-- API Key 存储方案：localStorage，配合明确隐私提示 -->
2. Build `src/services/gemini/client.ts`:
   - Wrap `@google/generative-ai` SDK.
   - Implement retry logic (3 retries with exponential backoff).
   - Timeout after 10 seconds → fall back to local parser.
   <!-- Gemini 客户端：重试3次 + 10秒超时 → 降级到本地解析 -->
3. Build `src/services/gemini/prompts.ts` with the prompt templates from PRD v1.

   **Decision Point**: API Key security. `localStorage` is readable by any JS on the page. Options:
   - (a) Plaintext + big warning: "Your key is stored locally. Do not use on shared devices."
   - (b) Encrypt with WebCrypto API using a user-provided passphrase.
   - **Recommendation**: Option (a) for Phase 3 simplicity. Option (b) in Phase 5 Vault.
   <!-- 决策点：API Key 安全性 — Phase 3 先用明文+警告，Phase 5 再加密 -->

   **Edge Cases**:
   - Invalid API key → Show clear error, don't retry.
   - Gemini rate limits (429) → Switch to local parser, queue retries.
   - API response doesn't match Zod schema → Use local parser fallback, log the error.
   <!-- 边界情况：无效 Key、限流、响应格式不匹配 -->

### Step 3.2 — Hybrid AI Pipeline
<!-- 混合 AI 管道 — 本地优先，云端增强 -->
1. Input flow:
   ```
   User Input → Local Parser (instant) → Display result immediately
                   ↓
              Is Gemini key set? AND is input complex?
                   ↓ Yes
              Send to Gemini (async) → Zod validate → Merge/Override result
                   ↓ No
              Keep local result
   ```
   <!-- 混合流程：本地秒级响应 → 异步 Gemini 增强（如果可用） -->
2. "Complex input" heuristics: input length > 20 chars, contains ambiguous terms, or local parser confidence < 0.7.
3. When Gemini result arrives and differs from local result, show a subtle "AI suggests: [category]" chip the user can accept or dismiss.

   **Decision Point**: Should Gemini auto-override the local result? **No.** Always show the local result first. Gemini suggestions appear as a non-intrusive prompt.
   <!-- 决策点：Gemini 不自动覆盖本地结果，而是以建议形式出现，用户可接受或忽略 -->

### Step 3.3 — Voice Input
<!-- 语音输入 -->
1. Use the **Web Speech API** (`SpeechRecognition`):
   - Language: `zh-CN` (with fallback to `en-US`).
   - Continuous mode OFF (single utterance).
   - Show real-time transcript in the input field.
   <!-- 语音识别：中文优先，实时显示转录文字 -->
2. Long-press the 🎤 button to start, release to stop.
3. Feed the transcript into the same parser pipeline.

   **Edge Cases**:
   - Browser doesn't support Web Speech API (Firefox) → Hide the microphone button, show tooltip.
   - Noisy environment → Low confidence transcript. Show "听不太清，请再试一次" with the raw transcript editable.
   - Chinese dialect variations → Web Speech API handles Mandarin well, but Cantonese/Hokkien will fail. Document this limitation.
   <!-- 边界情况：浏览器不支持（隐藏按钮）、嘈杂环境、方言识别局限 -->

### Step 3.4 — Photo/Receipt Input
<!-- 照片/票据输入 -->
1. Use the **File API** to capture or upload an image.
2. Show a preview of the image in the input area.
3. Send the image to Gemini Vision for receipt parsing.
4. Display extracted data with the receipt thumbnail attached to the transaction.

   **Decision Point**: Store the image locally? Images are large. Options:
   - (a) Store as a compressed Blob in IndexedDB (Dexie supports Blobs).
   - (b) Store only the extracted text, discard the image after parsing.
   - **Recommendation**: (a) with aggressive JPEG compression (quality 0.6, max 800px width). Allow user to delete the image from the transaction later.
   <!-- 决策点：图片存储 — 压缩后存 IndexedDB，允许后续删除 -->

   **Edge Cases**:
   - Non-receipt images (selfies, screenshots) → Gemini returns low confidence or irrelevant data. Show "这好像不是收据？" and let user manually enter.
   - Blurry receipts → Gemini may return partial data. Merge with manual input.
   - Multiple items on one receipt → Gemini extracts total. "逐项拆分" is a Phase 6 feature.
   <!-- 边界情况：非票据图片、模糊图片、多商品票据 -->

### Step 3.5 — AI Confidence & Review UI
<!-- AI 置信度与人工审核界面 -->
1. Transactions with `confidence < 0.7` get a yellow "需要确认" badge.
2. Transactions with `needsReview: true` appear in a dedicated "Review Queue" section at the top of Today page.
3. One-tap confirm or edit flow.
4. Show `aiReasoning` in a collapsible tooltip on each transaction card.
   <!-- 低置信度交易显示"需要确认"徽章，AI 推理逻辑可展开查看 -->

**Phase 3 Exit Criteria**: Take a photo of a receipt OR say "昨天打车二十八" → see it structured with AI reasoning. Works with or without network (graceful degradation).
<!-- 阶段3验收标准：拍票据或说话 → 自动结构化 + AI 推理，有无网络皆可用 -->

---

## Phase 4: Insight (Basic Intelligence)
<!-- 阶段4：洞察页 — 预计2-3周 -->

### Step 4.1 — Recharts Visualization
<!-- 数据可视化 -->
1. **Monthly Trend Line Chart**: Income vs Expense over the last 6 months.
2. **Category Donut Chart**: Spending breakdown by category for the selected month.
3. **Daily Bar Chart**: Daily spend for the current month.
   <!-- 三种核心图表：月度趋势、分类占比、每日支出 -->

   **Decision Point**: Recharts vs pure CSS charts. Recharts is heavier (~40KB gzipped) but far more capable. Use it.
   <!-- 决策点：用 Recharts，虽然体积大一些但功能强大 -->

### Step 4.2 — Anomaly Detection (Local)
<!-- 异常检测 — 本地算法版 -->
1. Compare current week/month to the previous period.
2. Flag categories where spending increased by >30%.
3. Detect duplicate charges (same merchant + amount within 24 hours).
4. Show alerts as `InsightCard` components with emoji + one-line explanation.
   <!-- 异常规则：环比增长>30%、24小时内重复扣费 -->

   **Edge Case**: New users with < 1 month of data → Show "记账满一个月后，我会给你第一份洞察报告！🪙" instead.
   <!-- 边界情况：新用户数据不足 — 显示友好提示代替空洞察 -->

### Step 4.3 — Natural Language Queries (Local Rules)
<!-- 自然语言查询 — 本地规则版 -->
1. Support simple query patterns:
   - "这周外卖花了多少" → filter category=餐饮, tags contains 外卖, date=this week, sum.
   - "上个月交通" → filter category=交通, date=last month, sum + count.
   - "今天花了多少" → filter date=today, sum.
   <!-- 支持简单的自然语言查询模式 -->
2. Parse with regex templates. If no match, show "我还不太会回答这个问题，但我在学习中！".
3. Phase 4+ with Gemini: route complex queries through the chat prompt.

### Step 4.4 — Budget System
<!-- 预算系统 -->
1. Allow setting monthly budget limits per category.
2. Show progress bars (current spend / budget) on the Insight page.
3. Alert when >80% of a category budget is consumed.
   <!-- 分类月预算 + 进度条 + 80% 预警 -->

   **Decision Point**: Budget period — calendar month or rolling 30 days? **Calendar month**, it's more intuitive.
   <!-- 决策点：预算周期用自然月（更直觉） -->

**Phase 4 Exit Criteria**: Open Insight page → see trend charts, spending breakdown, anomaly alerts, and budget progress.
<!-- 阶段4验收标准：打开洞察页看到图表 + 文字洞察 + 预算进度 -->

---

## Phase 5: Vault + Polish & Release
<!-- 阶段5：金库（安全与打磨）— 预计2周 -->

### Step 5.1 — Biometric Lock
<!-- 生物识别锁 -->
1. Use **WebAuthn API** for FaceID / TouchID / Windows Hello.
2. Lock screen on app open if enabled. Unlock with biometric or fallback PIN.
   <!-- WebAuthn 生物识别 + PIN 码后备 -->

   **Edge Case**: WebAuthn not available (older browsers) → Offer PIN-only lock.
   <!-- 边界情况：浏览器不支持 WebAuthn → 仅 PIN 码锁定 -->

### Step 5.2 — Data Export
<!-- 数据导出 -->
1. Export all transactions as **CSV** (Excel-compatible with BOM for Chinese characters).
2. Export as **JSON** for backup/restore.
3. Import from JSON backup.
   <!-- CSV 导出（含 BOM 兼容中文）+ JSON 备份/恢复 -->

   **Edge Case**: Large exports (>10,000 entries) → Use `Blob` + `URL.createObjectURL` for download, don't build the entire string in memory.
   <!-- 边界情况：大量数据导出 — 用 Blob 流式下载 -->

### Step 5.3 — Onboarding Flow
<!-- 新用户引导 -->
1. First-launch tutorial: 3 screens showing the core loop (type → coin drop → done).
2. Optional: import sample data to show what the app looks like with data.
   <!-- 首次启动引导：3步展示核心循环 -->

### Step 5.4 — Dark Mode Polish
<!-- 深色模式完善 -->
1. Audit every component for proper dark mode contrast.
2. Ensure charts, cards, and animations look correct in both modes.
   <!-- 全组件深色模式审计 -->

### Step 5.5 — Performance Optimization
<!-- 性能优化 -->
1. Analyze bundle size with `next/bundle-analyzer`.
2. Lazy-load Insight and Vault pages.
3. Optimize Dexie queries with proper indexing.
4. Target: <3s first load, <100ms for transaction entry feedback.
   <!-- 目标：首次加载<3秒，记账反馈<100毫秒 -->

### Step 5.6 — Settings Page (Vault)
<!-- 设置页 -->
1. Gemini API key management (add / remove / test).
2. Sound toggle.
3. Theme toggle (light / dark / system).
4. Storage usage indicator.
5. About page with Dieter Rams quote and MIT License notice.
   <!-- 设置项：API Key、音效、主题、存储用量、关于页 -->

**Phase 5 Exit Criteria**: A complete, polished product ready for public sharing.
<!-- 阶段5验收标准：完整可分享的产品 — v1.0 正式版 -->

---

## Phase 6 (Optional Extensions)
<!-- 阶段6：可选扩展（后续迭代） -->

1. **WebLLM**: Integrate Phi-3 or Qwen2.5-7B for fully offline AI.
   <!-- 全离线 AI — 浏览器端大模型 -->
2. **SQLite WASM Migration**: Replace Dexie with `@sqlite.org/sqlite-wasm` for SQL-powered queries.
3. **E2E Encrypted Sync**: Self-hosted sync server (reference: Actual Budget).
   <!-- 端到端加密同步 -->
4. **Multi-currency / Multi-account**.
   <!-- 多币种 / 多账户支持 -->

---

## Cross-Cutting Concerns
<!-- 贯穿全局的关注点 -->

### Testing Strategy
<!-- 测试策略 -->
| Layer         | Tool             | Scope                                          |
|---------------|------------------|-------------------------------------------------|
| Unit          | Vitest           | Parser logic, Zod schemas, utility functions    |
| Component     | React Testing Lib| UI components render correctly                  |
| Integration   | Playwright       | Full user flows (type → parse → save → display) |
<!-- 单元测试、组件测试、集成测试分层 -->

### Error Handling Philosophy
<!-- 错误处理哲学 — "好的设计是诚实的" -->
- Never silently swallow errors.
- Show user-friendly messages in Chinese with emoji.
- Log technical details to console for debugging.
- If AI fails, the app must still work (graceful degradation).
<!-- 不吞错误、友好提示、控制台记录、AI 失败不影响核心功能 -->

### Accessibility
<!-- 无障碍 -->
- All interactive elements must have `aria-label`.
- Color contrast must meet WCAG AA.
- Keyboard navigation for all flows.
<!-- 无障碍标准：aria 标签、颜色对比度、键盘导航 -->

### Privacy Commitment (Hardcoded)
<!-- 隐私承诺 — 写死在代码里 -->
- **Zero telemetry**. No analytics, no tracking, no server calls (except user-initiated Gemini).
- **All data stays local**. Period.
- **API key is never sent anywhere** except directly to Google's Gemini endpoint.
<!-- 零遥测、数据永远本地、API Key 只送 Google -->
