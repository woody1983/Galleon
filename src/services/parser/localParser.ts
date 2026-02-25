// src/services/parser/localParser.ts
// Natural Language Parser - Local Rules Version
// Zero latency, no AI dependency

import type { TransactionCategory } from "@/types/transaction";

export interface ParseResult {
  amount?: number;
  type: "expense" | "income";
  category?: TransactionCategory;
  merchant?: string;
  date?: string; // ISO format YYYY-MM-DD
  confidence: number;
  needsReview: boolean;
  parsedDate?: string; // Original date text
}

// Currency suffixes
const CURRENCY_SUFFIXES = ["元", "块", "¥", "yuan", "rmb", "RMB"];

// Income keywords
const INCOME_KEYWORDS = [
  "工资", "salary", "收入", "入账", "转账", "退款", "报销", "奖金", "分红", "理财",
  "wage", "income", "deposit", "refund", "reimbursement", "bonus", "dividend",
];

// Category keywords for auto-classification when merchant not found
const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  "餐饮": ["咖啡", "奶茶", "吃饭", "餐厅", "食堂", "外卖", "午餐", "晚餐", "早餐", "food", "coffee", "tea", "milk tea", "lunch", "dinner", "breakfast"],
  "交通": ["打车", "地铁", "公交", "taxi", "subway", "bus", "transport", "出行"],
  "购物": ["买东西", "购物", "shopping", "买"],
  "娱乐": ["电影", "游戏", "movie", "game", "娱乐", "entertainment"],
  "居住": ["房租", "水电", "宽带", "话费", "rent", "utilities"],
  "医疗": ["医院", "药店", "看病", "hospital", "pharmacy", "medical"],
  "教育": ["学费", "书", "课程", "tuition", "book", "course", "education"],
  "投资": ["股票", "基金", "保险", "stock", "fund", "insurance", "investment"],
  "收入": ["工资", "奖金", "salary", "bonus", "income"],
  "其他": [],
};

// Generic merchant names for each category when no specific merchant is found
const CATEGORY_MERCHANT_NAMES: Record<TransactionCategory, string> = {
  "餐饮": "餐饮消费",
  "交通": "交通出行",
  "购物": "购物消费",
  "娱乐": "娱乐消费",
  "居住": "居住费用",
  "医疗": "医疗费用",
  "教育": "教育支出",
  "投资": "投资理财",
  "收入": "收入",
  "其他": "其他消费",
};

// Date keywords mapping
const DATE_KEYWORDS: Record<string, number> = {
  "今天": 0,
  "today": 0,
  "昨天": -1,
  "yesterday": -1,
  "前天": -2,
  "the day before yesterday": -2,
};

// Merchant dictionary (~200 common merchants)
const MERCHANT_DICT: Record<string, { category: TransactionCategory; aliases?: string[] }> = {
  // 餐饮 - Dining
  "星巴克": { category: "餐饮", aliases: ["starbucks", "sbux"] },
  "麦当劳": { category: "餐饮", aliases: ["mcdonalds", "mcd", "金拱门"] },
  "肯德基": { category: "餐饮", aliases: ["kfc", "kfc"] },
  "必胜客": { category: "餐饮", aliases: ["pizza hut", "pizzahut"] },
  "海底捞": { category: "餐饮" },
  "喜茶": { category: "餐饮", aliases: ["heytea"] },
  "奈雪": { category: "餐饮", aliases: ["nayuki", "奈雪的茶"] },
  "瑞幸": { category: "餐饮", aliases: ["luckin", "luckin coffee"] },
  "蜜雪冰城": { category: "餐饮", aliases: ["mixue"] },
  "茶百道": { category: "餐饮" },
  "一点点": { category: "餐饮" },
  "CoCo": { category: "餐饮", aliases: ["coco", "都可"] },
  "贡茶": { category: "餐饮", aliases: ["gongcha"] },
  "汉堡王": { category: "餐饮", aliases: ["burger king", "burgerking"] },
  "赛百味": { category: "餐饮", aliases: ["subway"] },
  "塔可钟": { category: "餐饮", aliases: ["taco bell", "tacobell"] },
  "真功夫": { category: "餐饮" },
  "永和大王": { category: "餐饮" },
  "老乡鸡": { category: "餐饮" },
  "西贝": { category: "餐饮", aliases: ["西贝莜面村"] },
  "外婆家": { category: "餐饮" },
  "绿茶": { category: "餐饮", aliases: ["绿茶餐厅"] },
  "太二": { category: "餐饮", aliases: ["太二酸菜鱼"] },
  "和府捞面": { category: "餐饮" },
  "味千拉面": { category: "餐饮" },
  "吉野家": { category: "餐饮", aliases: ["yoshinoya"] },
  "食其家": { category: "餐饮", aliases: ["sukiya"] },
  "萨莉亚": { category: "餐饮", aliases: ["saizeriya"] },
  "棒约翰": { category: "餐饮", aliases: ["papa johns", "papajohns"] },
  "达美乐": { category: "餐饮", aliases: ["dominos", "domino"] },
  " Costa": { category: "餐饮", aliases: ["costa coffee"] },
  "太平洋咖啡": { category: "餐饮", aliases: ["pacific coffee"] },
  "Tim Hortons": { category: "餐饮", aliases: ["tims", "tim hortons"] },
  "Manner": { category: "餐饮", aliases: ["manner coffee"] },
  "M Stand": { category: "餐饮", aliases: ["mstand"] },
  "Seesaw": { category: "餐饮", aliases: ["seesaw coffee"] },
  "%Arabica": { category: "餐饮", aliases: ["arabica", "百分号咖啡"] },
  "Blue Bottle": { category: "餐饮", aliases: ["blue bottle coffee", "蓝瓶咖啡"] },
  "Peets": { category: "餐饮", aliases: ["peets coffee", "皮爷咖啡"] },
  "Tims": { category: "餐饮" },
  
  // 交通 - Transportation
  "滴滴": { category: "交通", aliases: ["didi", "滴滴出行", "打车", "出租车"] },
  " Uber": { category: "交通", aliases: ["uber"] },
  "Lyft": { category: "交通", aliases: ["lyft"] },
  "Grab": { category: "交通", aliases: ["grab"] },
  "高德打车": { category: "交通" },
  "美团打车": { category: "交通" },
  "曹操出行": { category: "交通" },
  "首汽约车": { category: "交通" },
  "神州专车": { category: "交通" },
  "享道出行": { category: "交通" },
  "如祺出行": { category: "交通" },
  "T3出行": { category: "交通" },
  "花小猪": { category: "交通" },
  "阳光出行": { category: "交通" },
  "嘀嗒": { category: "交通", aliases: ["嘀嗒出行"] },
  "哈啰": { category: "交通", aliases: ["哈啰出行", "哈罗", "hellobike"] },
  "青桔": { category: "交通", aliases: ["青桔单车"] },
  "美团单车": { category: "交通" },
  "摩拜": { category: "交通", aliases: ["mobike"] },
  "ofo": { category: "交通", aliases: ["小黄车"] },
  "地铁": { category: "交通", aliases: ["subway", "metro", "地鐵"] },
  "公交": { category: "交通", aliases: ["bus", "公交车", "巴士"] },
  "火车": { category: "交通", aliases: ["train", "铁路", "高铁", "动车"] },
  "飞机": { category: "交通", aliases: ["flight", "airplane", "航空", "机场"] },
  "加油": { category: "交通", aliases: ["petrol", "gas", "油费", "中石化", "中石油", "壳牌"] },
  "停车": { category: "交通", aliases: ["parking", "停车费", "泊车"] },
  "高速": { category: "交通", aliases: ["highway", "高速费", "过路费", "etc"] },
  "洗车": { category: "交通", aliases: ["car wash", "洗车费"] },
  "保养": { category: "交通", aliases: ["maintenance", "保养费", "修车"] },
  "充电": { category: "交通", aliases: ["charging", "充电桩", "特来电", "星星充电"] },
  
  // 购物 - Shopping
  "淘宝": { category: "购物", aliases: ["taobao", "tb", "天猫", "tmall"] },
  "京东": { category: "购物", aliases: ["jd", "jingdong"] },
  "拼多多": { category: "购物", aliases: ["pdd", "pinduoduo"] },
  "亚马逊": { category: "购物", aliases: ["amazon", "amzn"] },
  "天猫": { category: "购物", aliases: ["tmall", "天猫超市"] },
  "盒马": { category: "购物", aliases: ["hema", "盒马鲜生"] },
  "叮咚": { category: "购物", aliases: ["叮咚买菜"] },
  "美团买菜": { category: "购物" },
  "朴朴": { category: "购物", aliases: ["朴朴超市"] },
  "永辉": { category: "购物", aliases: ["永辉超市"] },
  "沃尔玛": { category: "购物", aliases: ["walmart", "wal-mart"] },
  "家乐福": { category: "购物", aliases: ["carrefour"] },
  "大润发": { category: "购物", aliases: ["rt-mart"] },
  "山姆": { category: "购物", aliases: ["sams", "山姆会员店"] },
  "Costco": { category: "购物", aliases: ["costco", "开市客"] },
  "宜家": { category: "购物", aliases: ["ikea"] },
  "无印良品": { category: "购物", aliases: ["muji"] },
  "优衣库": { category: "购物", aliases: ["uniqlo"] },
  "Zara": { category: "购物", aliases: ["zara"] },
  "H&M": { category: "购物", aliases: ["h&m", "hm"] },
  "GAP": { category: "购物", aliases: ["gap"] },
  "Nike": { category: "购物", aliases: ["nike", "耐克"] },
  "Adidas": { category: "购物", aliases: ["adidas", "阿迪达斯"] },
  "Apple": { category: "购物", aliases: ["apple", "苹果", "app store", "icloud"] },
  "小米": { category: "购物", aliases: ["xiaomi", "mi"] },
  "华为": { category: "购物", aliases: ["huawei"] },
  "苏宁": { category: "购物", aliases: ["suning", "苏宁易购"] },
  "国美": { category: "购物", aliases: ["gome", "国美电器"] },
  "迪卡侬": { category: "购物", aliases: ["decathlon"] },
  "名创优品": { category: "购物", aliases: ["miniso"] },
  "屈臣氏": { category: "购物", aliases: ["watsons"] },
  "丝芙兰": { category: "购物", aliases: ["sephora"] },
  "万宁": { category: "购物", aliases: ["mannings"] },
  "7-11": { category: "购物", aliases: ["7eleven", "seven eleven", "711"] },
  "全家": { category: "购物", aliases: ["familymart", "family mart"] },
  "罗森": { category: "购物", aliases: ["lawson"] },
  "喜士多": { category: "购物", aliases: ["c-store"] },
  "便利蜂": { category: "购物", aliases: ["bianlifeng"] },
  "每日优鲜": { category: "购物" },
  "本来生活": { category: "购物" },
  "顺丰": { category: "购物", aliases: ["sf", "顺丰速运", "快递"] },
  "京东物流": { category: "购物" },
  "菜鸟": { category: "购物", aliases: ["菜鸟裹裹", "菜鸟驿站"] },
  
  // 娱乐 - Entertainment
  "电影院": { category: "娱乐", aliases: ["cinema", "影院", "万达影城", "cgv", "百老汇"] },
  "腾讯视频": { category: "娱乐", aliases: ["tencent video", "腾讯"] },
  "爱奇艺": { category: "娱乐", aliases: ["iqiyi"] },
  "优酷": { category: "娱乐", aliases: ["youku"] },
  "B站": { category: "娱乐", aliases: ["bilibili", "哔哩哔哩"] },
  "Netflix": { category: "娱乐", aliases: ["netflix", "奈飞"] },
  "YouTube": { category: "娱乐", aliases: ["youtube", "油管"] },
  "Spotify": { category: "娱乐", aliases: ["spotify"] },
  "Apple Music": { category: "娱乐", aliases: ["apple music"] },
  "QQ音乐": { category: "娱乐", aliases: ["qq music"] },
  "网易云": { category: "娱乐", aliases: ["netease cloud", "网易云音乐"] },
  "Steam": { category: "娱乐", aliases: ["steam", "游戏"] },
  "PlayStation": { category: "娱乐", aliases: ["ps", "ps5", "ps4", "playstation"] },
  "Xbox": { category: "娱乐", aliases: ["xbox", "xbox game pass", "xgp"] },
  "Nintendo": { category: "娱乐", aliases: ["nintendo", "switch", "任天堂"] },
  "KTV": { category: "娱乐", aliases: ["ktv", "卡拉ok", "唱吧"] },
  "酒吧": { category: "娱乐", aliases: ["bar", "pub"] },
  "剧本杀": { category: "娱乐" },
  "密室": { category: "娱乐", aliases: ["密室逃脱"] },
  "桌游": { category: "娱乐", aliases: ["board game"] },
  "网吧": { category: "娱乐", aliases: ["internet cafe", "网咖"] },
  "游乐场": { category: "娱乐", aliases: ["amusement park", "迪士尼", "欢乐谷", "长隆", "环球影城"] },
  "动物园": { category: "娱乐", aliases: ["zoo"] },
  "博物馆": { category: "娱乐", aliases: ["museum"] },
  "演唱会": { category: "娱乐", aliases: ["concert", "演出", "音乐节"] },
  "展览": { category: "娱乐", aliases: ["exhibition", "画展", "艺术展"] },
  "书店": { category: "娱乐", aliases: ["bookstore", "诚品", "西西弗", "言几又"] },
  "图书馆": { category: "娱乐", aliases: ["library"] },
  "健身房": { category: "娱乐", aliases: ["gym", "fitness", "威尔仕", "一兆韦德", "中体倍力"] },
  "游泳馆": { category: "娱乐", aliases: ["swimming", "泳池"] },
  "瑜伽": { category: "娱乐", aliases: ["yoga"] },
  "滑雪": { category: "娱乐", aliases: ["skiing", "snowboarding"] },
  "保龄球": { category: "娱乐", aliases: ["bowling"] },
  "台球": { category: "娱乐", aliases: ["billiards", "桌球"] },
  "高尔夫": { category: "娱乐", aliases: ["golf"] },
  "网球": { category: "娱乐", aliases: ["tennis"] },
  "羽毛球": { category: "娱乐", aliases: ["badminton"] },
  "篮球": { category: "娱乐", aliases: ["basketball"] },
  "足球": { category: "娱乐", aliases: ["football", "soccer"] },
  "乒乓球": { category: "娱乐", aliases: ["pingpong", "table tennis"] },
  
  // 居住 - Housing
  "房租": { category: "居住", aliases: ["rent", "租金", "租房"] },
  "房贷": { category: "居住", aliases: ["mortgage", "月供"] },
  "物业费": { category: "居住", aliases: ["property fee", "物业"] },
  "水电": { category: "居住", aliases: ["utilities", "水电费", "电费", "水费", "煤气", "燃气"] },
  "宽带": { category: "居住", aliases: ["internet", "网络", "wifi", "电信", "联通", "移动", "长城宽带"] },
  "话费": { category: "居住", aliases: ["phone bill", "手机费", "电话费", "流量", "套餐"] },
  "有线电视": { category: "居住", aliases: ["cable tv", "歌华有线"] },
  "维修": { category: "居住", aliases: ["repair", "修理", "家电维修"] },
  "保洁": { category: "居住", aliases: ["cleaning", "家政", "阿姨", "钟点工"] },
  "搬家": { category: "居住", aliases: ["moving", "搬家公司"] },
  "装修": { category: "居住", aliases: ["renovation", "装修费", "家具", "建材"] },
  "家具": { category: "居住", aliases: ["furniture", "宜家", "红星美凯龙", "居然之家"] },
  "家电": { category: "居住", aliases: ["appliances", "电器", "苏宁", "国美"] },
  "超市": { category: "居住", aliases: ["supermarket", "日用品"] },
  
  // 医疗 - Medical
  "医院": { category: "医疗", aliases: ["hospital", "诊所", "门诊", "急诊", "挂号"] },
  "药店": { category: "医疗", aliases: ["pharmacy", "药房", "屈臣氏", "万宁", "海王星辰", "老百姓大药房"] },
  "体检": { category: "医疗", aliases: ["checkup", "体检中心", "美年大健康", "爱康国宾"] },
  "牙医": { category: "医疗", aliases: ["dentist", "牙科", "口腔", "瑞尔齿科"] },
  "眼科": { category: "医疗", aliases: ["eye doctor", "眼镜", "验光", "宝岛眼镜", "亮视点"] },
  "按摩": { category: "医疗", aliases: ["massage", "推拿", "理疗", "足疗", "spa"] },
  "心理咨询": { category: "医疗", aliases: ["therapy", "心理医生"] },
  "疫苗": { category: "医疗", aliases: ["vaccine", "打针", "接种"] },
  "中医": { category: "医疗", aliases: ["tcm", "中药", "针灸"] },
  
  // 教育 - Education
  "学费": { category: "教育", aliases: ["tuition", "学杂费", "书本费"] },
  "培训": { category: "教育", aliases: ["training", "培训班", "新东方", "好未来", "学而思"] },
  "考试": { category: "教育", aliases: ["exam", "考试费", "托福", "雅思", "gre", "gmat", "cfa"] },
  "书籍": { category: "教育", aliases: ["books", "买书", "教材", "参考书", "当当", "京东图书", "亚马逊图书"] },
  "在线课程": { category: "教育", aliases: ["online course", "网课", "慕课", "coursera", "udemy", "极客时间", "得到", "混沌学园"] },
  "会员": { category: "教育", aliases: ["membership", "知识付费", "知乎", "喜马拉雅", "樊登读书"] },
  "文具": { category: "教育", aliases: ["stationery", "办公用品", "得力", "晨光"] },
  
  // 投资 - Investment
  "股票": { category: "投资", aliases: ["stock", "股市", "证券", "华泰", "中信", "国泰君安"] },
  "基金": { category: "投资", aliases: ["fund", "基金定投", "余额宝", "理财通", "蚂蚁财富"] },
  "债券": { category: "投资", aliases: ["bond"] },
  "期货": { category: "投资", aliases: ["futures"] },
  "外汇": { category: "投资", aliases: ["forex"] },
  "保险": { category: "投资", aliases: ["insurance", "保单", "平安", "人寿", "太平洋保险", "重疾险"] },
  "黄金": { category: "投资", aliases: ["gold"] },
  "数字货币": { category: "投资", aliases: ["crypto", "bitcoin", "btc", "eth", "币圈", "交易所"] },
  "房产": { category: "投资", aliases: ["property investment", "买房投资"] },
  "定投": { category: "投资", aliases: ["dca", "定期投资"] },
  
  // 收入 - Income
  "工资": { category: "收入", aliases: ["salary", "paycheck", "月薪", "年薪", "工资条"] },
  "奖金": { category: "收入", aliases: ["bonus", "年终奖", "绩效", "提成"] },
  "兼职": { category: "收入", aliases: ["part-time", "副业", "freelance", "自由职业"] },
  "投资": { category: "收入", aliases: ["investment income", "理财收益", "股息", "分红", "利息"] },
  "红包": { category: "收入", aliases: ["red envelope", "压岁钱", "礼金", "份子钱"] },
  "退款": { category: "收入", aliases: ["refund", "退货", "返还"] },
  "报销": { category: "收入", aliases: ["reimbursement", "差旅报销", "费用报销"] },
  "转账": { category: "收入", aliases: ["transfer", "收款", "入账"] },
  "租金": { category: "收入", aliases: ["rental income", "收租", "房租收入"] },
  "中奖": { category: "收入", aliases: ["lottery", "彩票"] },
};

// Build reverse lookup map for aliases
const MERCHANT_ALIAS_MAP: Record<string, string> = {};
Object.entries(MERCHANT_DICT).forEach(([merchant, data]) => {
  MERCHANT_ALIAS_MAP[merchant.toLowerCase()] = merchant;
  data.aliases?.forEach((alias) => {
    MERCHANT_ALIAS_MAP[alias.toLowerCase()] = merchant;
  });
});

/**
 * Extract amount from text
 * Supports: 35, 35元, 35块, ¥35, 35yuan, 35rmb
 * Returns first match
 */
function extractAmount(text: string): number | null {
  // Match patterns like: 35, 35.5, 35.50
  // Support currency suffixes
  const suffixPattern = CURRENCY_SUFFIXES.join("|");
  const regex = new RegExp(
    `(\\d+(?:\\.\\d{1,2})?)(?:\\s*(?:${suffixPattern}))?`,
    "i"
  );

  const match = text.match(regex);
  if (match) {
    const amount = parseFloat(match[1]);
    return isNaN(amount) ? null : amount;
  }

  return null;
}

/**
 * Extract merchant from text
 * Returns matched merchant name or null
 */
function extractMerchant(text: string): { merchant: string; category: TransactionCategory } | null {
  const lowerText = text.toLowerCase();

  // Direct match
  for (const [alias, merchant] of Object.entries(MERCHANT_ALIAS_MAP)) {
    if (lowerText.includes(alias)) {
      const category = MERCHANT_DICT[merchant].category;
      return { merchant, category };
    }
  }

  return null;
}

/**
 * Extract date from text
 * Supports: 今天, today, 昨天, yesterday, 前天
 * Returns ISO date string or null
 */
function extractDate(text: string): { date: string; original: string } | null {
  const lowerText = text.toLowerCase();

  for (const [keyword, daysOffset] of Object.entries(DATE_KEYWORDS)) {
    if (lowerText.includes(keyword.toLowerCase())) {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      return {
        date: date.toISOString().slice(0, 10),
        original: keyword,
      };
    }
  }

  return null;
}

/**
 * Infer category from keywords when merchant not found
 */
function inferCategoryFromKeywords(text: string): TransactionCategory | null {
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category as TransactionCategory;
      }
    }
  }

  return null;
}

/**
 * Determine if transaction is income or expense
 * Default: expense
 */
function determineType(text: string): "expense" | "income" {
  const lowerText = text.toLowerCase();

  for (const keyword of INCOME_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return "income";
    }
  }

  return "expense";
}

/**
 * Calculate confidence score
 * - Amount + merchant found: 0.9
 * - Amount only: 0.7
 * - Ambiguous: 0.5 (needsReview: true)
 */
function calculateConfidence(
  amount: number | null,
  merchant: string | null,
  type: "expense" | "income"
): { confidence: number; needsReview: boolean } {
  if (amount && merchant) {
    return { confidence: 0.9, needsReview: false };
  }

  if (amount) {
    return { confidence: 0.7, needsReview: false };
  }

  return { confidence: 0.5, needsReview: true };
}

/**
 * Main parser function
 * Parses natural language input and returns transaction data
 */
export function parseNaturalLanguage(input: string): ParseResult | null {
  // Trim and validate input
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Extract components
  const amount = extractAmount(trimmed);
  const merchantData = extractMerchant(trimmed);
  const dateData = extractDate(trimmed);
  const type = determineType(trimmed);

  // Must have at least amount or merchant
  if (!amount && !merchantData) {
    return null;
  }

  // Calculate confidence
  const { confidence, needsReview } = calculateConfidence(
    amount,
    merchantData?.merchant || null,
    type
  );

  // Build result
  const result: ParseResult = {
    type,
    confidence,
    needsReview,
  };

  if (amount) {
    result.amount = amount;
  }

  if (merchantData) {
    result.merchant = merchantData.merchant;
    result.category = merchantData.category;
  } else {
    // Try to infer category from keywords
    const inferredCategory = inferCategoryFromKeywords(trimmed);
    result.category = inferredCategory || (type === "income" ? "收入" : "其他");
    // Use category name as generic merchant name when no specific merchant found
    if (inferredCategory) {
      result.merchant = CATEGORY_MERCHANT_NAMES[inferredCategory];
    }
  }

  if (dateData) {
    result.date = dateData.date;
    result.parsedDate = dateData.original;
  } else {
    // Default to today
    result.date = new Date().toISOString().slice(0, 10);
  }

  return result;
}

/**
 * Batch parse multiple inputs
 */
export function parseBatch(inputs: string[]): (ParseResult | null)[] {
  return inputs.map((input) => parseNaturalLanguage(input));
}

/**
 * Get merchant suggestions based on partial input
 */
export function getMerchantSuggestions(partial: string): string[] {
  if (!partial || partial.length < 1) return [];

  const lowerPartial = partial.toLowerCase();
  const suggestions: string[] = [];

  for (const [merchant, data] of Object.entries(MERCHANT_DICT)) {
    if (merchant.toLowerCase().includes(lowerPartial)) {
      suggestions.push(merchant);
    } else if (data.aliases?.some((alias) => alias.toLowerCase().includes(lowerPartial))) {
      suggestions.push(merchant);
    }
  }

  return suggestions.slice(0, 5); // Return top 5
}

// Export for testing
export { extractAmount, extractMerchant, extractDate, determineType, calculateConfidence };

// Export generic merchant name helper
export function getGenericMerchantName(category: TransactionCategory | undefined): string {
  if (!category) return "其他消费";
  return CATEGORY_MERCHANT_NAMES[category];
}