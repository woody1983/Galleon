项目名称：Galleon

Galleon — "每一枚加隆都算数"

🎨 设计哲学与参考大师

选定参考：Dieter Rams（迪特·拉姆斯）

"Less, but better"
为什么选择他：
博朗（Braun）经典设计语言 — 功能主义与优雅并存
与 Galleon 的"轻量记账"理念完美契合
他的十项设计原则可直接作为代码规范
Rams 原则在 Galleon 的体现：
| Rams 原则   | Galleon 实现     |
| --------- | -------------- |
| 好的设计是创新的  | AI 多模态输入替代传统表单 |
| 好的设计让产品有用 | 3秒记账，零学习成本     |
| 好的设计是美的   | 金币动画 + 留白呼吸感   |
| 好的设计让产品易懂 | 自然语言即界面        |
| 好的设计是诚实的  | 不夸大AI能力，错误时坦诚  |
| 好的设计是持久的  | 经典配色，不追潮流      |
| 好的设计是细致的  | 微交互精确到毫秒       |
| 好的设计是环保的  | 本地优先，减少云端依赖    |
| 好的设计是极简的  | 每个像素都有功能       |

视觉系统（Galleon Design System）

/* 核心色板 — 源自金币与炼金术 */
:root {
  /* 主色：炼金金 */
  --galleon-gold: #D4AF37;
  --galleon-gold-light: #F4E4BC;
  --galleon-gold-dark: #B8941F;
  
  /* 辅色：古灵银（平衡金色的张扬）*/
  --gringotts-silver: #C0C0C0;
  --gringotts-silver-dark: #808080;
  
  /* 功能色：魔法墨水 */
  --ink-primary: #1A1A1A;    /* 深黑 — 主要文字 */
  --ink-secondary: #4A4A4A;  /* 炭灰 — 次要文字 */
  --ink-tertiary: #9A9A9A;   /* 银灰 — 占位符 */
  
  /* 背景：羊皮纸到深夜 */
  --parchment: #FAF8F3;      /* 主背景 — 暖白 */
  --parchment-dark: #F0EBE0; /* 卡片背景 */
  --midnight: #0F0F0F;       /* 深色模式 */
  
  /* 状态色：魔法效果 */
  --spell-success: #2D5A3D;  /* 古魔文绿 — 收入 */
  --spell-danger: #8B2635;   /* 龙血红 — 支出 */
  --spell-info: #2C4F6B;     /* 鹰蓝 — 信息 */
}

字体系统

/* 中西文搭配 */
--font-display: "Playfair Display", "Noto Serif SC", serif;  /* 标题 — 优雅衬线 */
--font-body: "Inter", "PingFang SC", sans-serif;             /* 正文 — 清晰无衬线 */
--font-mono: "JetBrains Mono", "SF Mono", monospace;         /* 数字 — 等宽易读 */

间距与网格（Rams 式精确）

/* 8px 基准网格 */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-xxl: 48px;

/* 圆角：克制 */
--radius-sm: 4px;   /* 按钮、输入框 */
--radius-md: 8px;   /* 卡片 */
--radius-full: 9999px; /* 胶囊、头像 */

功能架构与界面设计

信息架构
Galleon
├── 今日（Today）— 默认页
│   ├── 快速记账（语音/文字/拍照）
│   ├── 今日流水
│   └── AI 洞察卡片
├── 账本（Ledger）— 历史记录
│   ├── 时间轴视图
│   ├── 分类统计
│   └── 搜索与筛选
├── 洞察（Insight）— AI 分析
│   ├── 消费趋势
│   ├── 异常提醒
│   └── 自然语言问答
└── 我的（Vault）— 设置
    ├── 预算设定
    ├── 数据管理
    └── 关于

    核心界面设计

1. 今日页（Today）— 默认着陆

┌─────────────────────────────────────┐
│  周四, 2月26日          💰 12,450   │  ← 顶部：日期+余额
│                                     │
│  ┌─────────────────────────────┐   │
│  │  "今天午餐35元..."          │   │  ← AI 输入框（核心）
│  │  [🎤] [📷] [⚡]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  今日支出              -234 ¥      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  ☕ 星巴克               -35 ¥     │  ← 时间轴
│  08:30  咖啡 | AI 95%置信度         │
│                                     │
│  🚕 滴滴出行             -28 ¥     │
│  12:45  交通 | 已确认               │
│                                     │
│  🍜 兰州拉面             -26 ¥     │
│  18:20  餐饮 | 手动修正             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💡 AI 发现：本周咖啡支出    │   │  ← 洞察卡片
│  │     比上周增加 40%           │   │
│  └─────────────────────────────┘   │
│                                     │
│        [⚪]  记账按钮  [⚪]         │  ← 悬浮操作
└─────────────────────────────────────┘

关键交互：
输入框支持自然语言（"今天星巴克35"）和语音（长按麦克风）
右侧滑动快速确认，左滑编辑/删除
金币掉落音效（可关闭）确认记账成功

洞察页（AI 对话界面）
┌─────────────────────────────────────┐
│  洞察                    [📊] [💬]  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  本月消费概览                │   │
│  │  [环形图] 餐饮 40% 交通 25%  │   │
│  │            购物 20% 其他 15% │   │
│  └─────────────────────────────┘   │
│                                     │
│  💬 与 Galleon 对话                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 这周外卖花了多少？           │   │  ← 用户
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 本周外卖支出 286元，比上周   │   │  ← AI
│  │ 增加 45%。主要下单：麦当劳   │   │
│  │ (3次)。建议尝试自带午餐？    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [快捷问题] [本月趋势] [异常提醒]    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  输入问题...        [发送]   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

AI 功能规格（Gemini 2.5 集成）

核心能力矩阵
| 功能         | 输入       | Gemini 任务 | 输出        |
| ---------- | -------- | --------- | --------- |
| **智能记账**   | 语音/文字/图片 | 多模态解析     | 结构化交易数据   |
| **分类建议**   | 商户名+描述   | 分类推理      | 预设分类+置信度  |
| **异常检测**   | 历史数据+新交易 | 模式识别      | 异常标记+原因   |
| **自然语言查询** | 问题文本     | RAG+生成    | 数据+自然语言回答 |
| **消费洞察**   | 时段数据     | 趋势分析      | 3条可执行建议   |
| **预算预测**   | 历史+目标    | 时间序列预测    | 达成概率+调整建议 |


提示词工程（v1.0）
// src/services/gemini/prompts.ts
export const GalleonPrompts = {
  // 交易提取 — 多模态通用
  extractTransaction: `
你是 Galleon（古灵阁智能记账助手）的 AI 核心。
任务：从用户输入中提取交易信息，返回严格 JSON。

输入可能为：
- 自然语言："今天星巴克咖啡35块"
- 票据图片：小票照片
- 语音转文字："呃...那个...昨天打车花了二十八"

输出规则：
1. amount: 数字（元），必须为正
2. currency: 固定 "CNY"
3. category: 必须从 [餐饮,交通,购物,娱乐,居住,医疗,教育,投资,收入,其他] 选择
4. merchant: 商户名，尽可能具体（"星巴克"而非"咖啡"）
5. date: ISO 8601 日期，默认为今天
6. type: "expense" | "income"
7. confidence: 0-1，低于 0.7 标记 needsReview
8. tags: 数组，AI 生成的关键词

JSON Schema:
{
  "amount": number,
  "currency": "CNY",
  "category": string,
  "merchant": string,
  "description": string,
  "date": "YYYY-MM-DD",
  "type": "expense"|"income",
  "confidence": number,
  "needsReview": boolean,
  "tags": string[],
  "aiReasoning": string  // 简要说明分类依据
}

示例输入："昨晚海底捞人均150"
示例输出：
{
  "amount": 150,
  "currency": "CNY",
  "category": "餐饮",
  "merchant": "海底捞",
  "description": "晚餐",
  "date": "2024-02-25",
  "type": "expense",
  "confidence": 0.92,
  "needsReview": false,
  "tags": ["火锅", "聚餐", "晚餐"],
  "aiReasoning": "海底捞为连锁火锅品牌，人均150符合餐饮消费特征"
}
`,

  // 对话响应 — 带上下文
  chatResponse: (history: string, data: string) => `
你是 Galleon，用户的私人财务顾问。风格：专业、简洁、有洞察力，偶尔幽默。

可用数据（最近30天）：
${data}

对话历史：
${history}

回答规则：
1. 直接回答问题，不绕弯子
2. 提供具体数字，不说"大概"
3. 给出1条可执行建议
4. 使用 emoji 增加可读性
5. 如果不确定，诚实说明

禁止：
- 编造数据
- 给出投资建议
- 透露其他用户数据
`,

  // 洞察生成
  generateInsights: (transactions: string) => `
基于以下消费数据，生成3条洞察：

${transactions}

洞察类型：
1. 异常提醒（消费突增、重复扣费等）
2. 趋势分析（与上月/上周对比）
3. 储蓄建议（基于收入支出比）

格式：JSON 数组，每条包含 type, title, description, action
`
};

技术实现方案

项目结构（细化版）
galleon/
├── src/
│   ├── app/                    # 路由页面
│   │   ├── page.tsx           # Today（默认）
│   │   ├── ledger/page.tsx    # 账本
│   │   ├── insight/page.tsx   # 洞察
│   │   └── vault/page.tsx     # 设置
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui 基础
│   │   ├── galleon/           # 业务组件
│   │   │   ├── GalleonInput.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   ├── CoinSpinner.tsx
│   │   │   └── InsightCard.tsx
│   │   └── charts/            # 数据可视化
│   │
│   ├── hooks/
│   │   ├── useGalleonAI.ts    # Gemini 封装
│   │   ├── useTransactions.ts # 数据管理
│   │   └── useVoiceInput.ts   # 语音输入
│   │
│   ├── services/
│   │   ├── gemini/
│   │   │   ├── client.ts
│   │   │   ├── prompts.ts
│   │   │   └── types.ts
│   │   ├── storage/
│   │   │   └── indexedDB.ts
│   │   └── analytics/
│   │       └── insights.ts    # 本地分析备用
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   └── constants.ts       # 分类枚举等
│   │
│   └── styles/
│       └── globals.css        # 设计系统变量
│
├── public/
│   ├── sounds/                # 金币音效
│   └── icons/                 # PWA 图标
│
└── prompts/                   # 提示词版本管理
    ├── v1.0_extract.md
    └── v1.0_chat.md


核心依赖
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@google/generative-ai": "^0.2.0",
    "idb": "^8.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.2.0",
    "vite-plugin-pwa": "^0.17.0"
  }
}

关键动画（Framer Motion）
// 金币掉落确认动画
export const CoinDrop = ({ amount }: { amount: number }) => (
  <motion.div
    initial={{ y: -50, opacity: 0, rotate: 0 }}
    animate={{ 
      y: 0, 
      opacity: 1, 
      rotate: 360,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }}
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               pointer-events-none z-50"
  >
    <div className="text-6xl">🪙</div>
    <div className="text-galleon-gold font-mono font-bold text-center mt-2">
      +{amount}
    </div>
  </motion.div>
);

// 列表项进入动画
export const TransactionList = ({ items }) => (
  <motion.div layout className="space-y-2">
    <AnimatePresence>
      {items.map((tx) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          layout
        >
          <TransactionCard data={tx} />
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

开发路线图

Phase 1: 核心金币（Week 1-2）

[ ] 项目搭建（Next.js + Tailwind + shadcn）
[ ] 设计系统实现（CSS 变量 + 组件）
[ ] Gemini 基础集成（文本解析）
[ ] IndexedDB 数据层
[ ] 今日页 + 基础记账
里程碑：能用文字记账，数据本地保存
Phase 2: 魔法觉醒（Week 3-4）

[ ] 语音输入（Web Speech API）
[ ] 票据拍照（Camera API + Gemini Vision）
[ ] AI 分类置信度显示
[ ] 账本页（时间轴 + 筛选）
[ ] 金币动画 + 音效
里程碑：3种输入方式，记账体验流畅
Phase 3: 智慧增长（Week 5-6）

[ ] 洞察页（自然语言查询）
[ ] 基础图表（Recharts）
[ ] 异常检测算法
[ ] 预算设定与提醒
[ ] PWA 离线支持
里程碑：AI 能提供有用建议
Phase 4: 金库完善（Week 7-8）

[ ] 数据导入/导出（CSV）
[ ] 深色模式
[ ] 生物识别锁（Vault）
[ ] 性能优化
[ ] 开源发布