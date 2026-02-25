// src/lib/seed.ts
// Dev-only seed data — 50 realistic transactions spanning 30 days
// Tagged with "__seed__" for selective clearing

import { db } from "@/lib/db";
import type { TransactionInput } from "@/types/transaction";

const SEED_TAG = "__seed__";

// Helper: date string N days ago
function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

const SEED_TRANSACTIONS: TransactionInput[] = [
    // ── 餐饮 (14 entries) ──────────────────────────────────────────────────────
    { amount: 38, type: "expense", category: "餐饮", merchant: "星巴克", description: "星巴克 拿铁 38", date: daysAgo(0), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 25, type: "expense", category: "餐饮", merchant: "麦当劳", description: "麦当劳 套餐 25", date: daysAgo(1), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 32, type: "expense", category: "餐饮", merchant: "美团外卖", description: "美团外卖 外卖 32", date: daysAgo(1), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 268, type: "expense", category: "餐饮", merchant: "海底捞", description: "海底捞 火锅 268", date: daysAgo(3), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 19, type: "expense", category: "餐饮", merchant: "肯德基", description: "肯德基 早餐 19", date: daysAgo(4), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 28, type: "expense", category: "餐饮", merchant: "瑞幸咖啡", description: "瑞幸咖啡 大杯拿铁 28", date: daysAgo(5), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 45, type: "expense", category: "餐饮", merchant: "饿了么", description: "饿了么 午饭 45", date: daysAgo(6), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 12, type: "expense", category: "餐饮", merchant: "沙县小吃", description: "沙县小吃 12", date: daysAgo(8), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 88, type: "expense", category: "餐饮", merchant: "必胜客", description: "必胜客 披萨 88", date: daysAgo(10), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 15, type: "expense", category: "餐饮", merchant: "兰州拉面", description: "兰州拉面 午餐 15", date: daysAgo(12), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 36, type: "expense", category: "餐饮", merchant: "星巴克", description: "星巴克 美式 36", date: daysAgo(14), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 22, type: "expense", category: "餐饮", merchant: "美团外卖", description: "美团外卖 晚饭 22", date: daysAgo(16), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 55, type: "expense", category: "餐饮", merchant: "西贝莜面村", description: "西贝莜面村 55", date: daysAgo(20), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 18, type: "expense", category: "餐饮", merchant: "全家便利店", description: "全家便利店 便当 18", date: daysAgo(25), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 交通 (7 entries) ──────────────────────────────────────────────────────
    { amount: 28, type: "expense", category: "交通", merchant: "滴滴打车", description: "滴滴打车 28", date: daysAgo(0), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 6, type: "expense", category: "交通", merchant: "地铁", description: "地铁 6", date: daysAgo(2), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 156, type: "expense", category: "交通", merchant: "高铁", description: "高铁 上海-南京 156", date: daysAgo(7), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 320, type: "expense", category: "交通", merchant: "中国石化", description: "加油 320", date: daysAgo(9), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 3, type: "expense", category: "交通", merchant: "哈罗单车", description: "共享单车 3", date: daysAgo(11), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 35, type: "expense", category: "交通", merchant: "滴滴打车", description: "滴滴打车 深夜 35", date: daysAgo(17), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 8, type: "expense", category: "交通", merchant: "公交车", description: "公交车 8", date: daysAgo(22), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 购物 (7 entries) ──────────────────────────────────────────────────────
    { amount: 299, type: "expense", category: "购物", merchant: "淘宝", description: "淘宝 冬季外套 299", date: daysAgo(2), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 599, type: "expense", category: "购物", merchant: "京东", description: "京东 机械键盘 599", date: daysAgo(5), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 89, type: "expense", category: "购物", merchant: "超市", description: "超市 日用品 89", date: daysAgo(9), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 398, type: "expense", category: "购物", merchant: "优衣库", description: "优衣库 毛衣 398", date: daysAgo(13), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 129, type: "expense", category: "购物", merchant: "无印良品", description: "无印良品 收纳 129", date: daysAgo(18), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 45, type: "expense", category: "购物", merchant: "拼多多", description: "拼多多 零食 45", date: daysAgo(23), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 199, type: "expense", category: "购物", merchant: "ZARA", description: "ZARA 衬衫 199", date: daysAgo(28), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 娱乐 (5 entries) ──────────────────────────────────────────────────────
    { amount: 75, type: "expense", category: "娱乐", merchant: "电影院", description: "电影院 75", date: daysAgo(3), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 25, type: "expense", category: "娱乐", merchant: "网易云音乐", description: "网易云音乐 年会员 25", date: daysAgo(8), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 148, type: "expense", category: "娱乐", merchant: "KTV", description: "KTV 包厢 148", date: daysAgo(15), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 68, type: "expense", category: "娱乐", merchant: "Steam", description: "Steam 游戏 68", date: daysAgo(19), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 30, type: "expense", category: "娱乐", merchant: "B站大会员", description: "B站大会员 季度 30", date: daysAgo(26), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 居住 (4 entries) ──────────────────────────────────────────────────────
    { amount: 4500, type: "expense", category: "居住", merchant: "房东", description: "房租 月付 4500", date: daysAgo(1), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 68, type: "expense", category: "居住", merchant: "电力公司", description: "电费 68", date: daysAgo(6), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 32, type: "expense", category: "居住", merchant: "自来水公司", description: "水费 32", date: daysAgo(6), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 280, type: "expense", category: "居住", merchant: "物业", description: "物业费 280", date: daysAgo(20), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 医疗 (3 entries) ──────────────────────────────────────────────────────
    { amount: 85, type: "expense", category: "医疗", merchant: "药店", description: "感冒药 85", date: daysAgo(4), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 300, type: "expense", category: "医疗", merchant: "医院", description: "门诊挂号+检查 300", date: daysAgo(12), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 580, type: "expense", category: "医疗", merchant: "美年大健康", description: "年度体检 580", date: daysAgo(24), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 教育 (3 entries) ──────────────────────────────────────────────────────
    { amount: 199, type: "expense", category: "教育", merchant: "极客时间", description: "极客时间 专栏 199", date: daysAgo(7), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 89, type: "expense", category: "教育", merchant: "书店", description: "技术书籍 89", date: daysAgo(14), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 680, type: "expense", category: "教育", merchant: "得到", description: "得到 年度会员 680", date: daysAgo(27), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 投资 (2 entries) ──────────────────────────────────────────────────────
    { amount: 1000, type: "expense", category: "投资", merchant: "支付宝基金", description: "基金定投 1000", date: daysAgo(1), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 2000, type: "expense", category: "投资", merchant: "支付宝基金", description: "基金定投 2000", date: daysAgo(16), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 收入 (3 entries) ──────────────────────────────────────────────────────
    { amount: 18000, type: "income", category: "收入", merchant: "公司", description: "月薪 18000", date: daysAgo(0), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 3500, type: "income", category: "收入", merchant: "公司", description: "绩效奖金 3500", date: daysAgo(15), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 800, type: "income", category: "收入", merchant: "兼职", description: "兼职收入 800", date: daysAgo(22), confidence: 1, needsReview: false, tags: [SEED_TAG] },

    // ── 其他 (2 entries) ──────────────────────────────────────────────────────
    { amount: 58, type: "expense", category: "其他", merchant: "理发店", description: "理发 58", date: daysAgo(10), confidence: 1, needsReview: false, tags: [SEED_TAG] },
    { amount: 12, type: "expense", category: "其他", merchant: "快递", description: "快递费 12", date: daysAgo(21), confidence: 1, needsReview: false, tags: [SEED_TAG] },
];

/** Insert all seed transactions. Skips if seed data already exists. */
export async function seedDatabase(): Promise<{ inserted: number; skipped: boolean }> {
    const existing = await db.transactions
        .filter(tx => tx.tags?.includes(SEED_TAG))
        .count();

    if (existing > 0) {
        return { inserted: 0, skipped: true };
    }

    const now = new Date().toISOString();
    const records = SEED_TRANSACTIONS.map(tx => ({
        ...tx,
        subCategory: "",
        aiReasoning: "Seed data",
        createdAt: now,
        updatedAt: now,
    }));

    await db.transactions.bulkAdd(records as never);
    return { inserted: records.length, skipped: false };
}

/** Remove all seed transactions (tagged with __seed__). */
export async function clearSeedData(): Promise<number> {
    const ids = await db.transactions
        .filter(tx => tx.tags?.includes(SEED_TAG))
        .primaryKeys();

    await db.transactions.bulkDelete(ids as number[]);
    return ids.length;
}

/** Count existing seed transactions. */
export async function countSeedData(): Promise<number> {
    return db.transactions
        .filter(tx => tx.tags?.includes(SEED_TAG))
        .count();
}
