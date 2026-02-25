# Galleon 开发方案 v2.0  
**增量式、闭环优先、务实落地版**  
（基于 2026 年浏览器本地优先技术现实）

## 1. 总体技术决策（写进新 PRD 第一页）

| 项目           | 推荐方案                                      | 理由 / 备选方案                                      |
|----------------|-----------------------------------------------|-----------------------------------------------------|
| 框架           | Next.js 15 App Router + Tailwind + shadcn/ui  | 保持原选型，升级到 15 版本                          |
| 动画           | Framer Motion + 自定义 Coin Drop（spring physics） | 保留核心情感反馈                                    |
| 本地数据库     | **Phase 1–2：Dexie.js（IndexedDB 封装）**<br>Phase 3+ 可迁移到 SQLite WASM（@sqlite.org/sqlite-wasm 或 wa-sqlite） | Dexie 开发效率最高，后期查询/容量可升级            |
| AI 策略        | **混合模式**：<br>1. 本地规则解析（正则 + 预设模板）<br>2. Gemini API（用户自备 Key）<br>3. Phase 4+ 可选 WebLLM（Phi-3 / Qwen2.5-7B 等） | 彻底解决“本地 vs 云”矛盾，隐私 100% 可控           |
| PWA            | 从 Phase 0 配置（next-pwa 或 Vite PWA 插件）  | 离线安装即用                                        |
| 图表           | Recharts                                      | 轻量、好定制                                        |
| Schema 校验    | Zod                                           | 类型安全 + Gemini 输出校验                         |
| 语音输入       | Web Speech API                                | 浏览器原生，无需额外依赖                            |
| 照片输入       | File API + Image 预览                         | —                                                   |
| 隐私承诺       | 所有数据永远只存在本地；Gemini 调用需用户明确提供 Key | 写死在设置页                                        |

## 2. 分阶段开发路线图（建议 solo 总时长 3–4 个月）

| 阶段 | 时长（solo） | 核心目标                     | 主要功能                                                                 | 成功标准（可演示闭环）                                      | 里程碑输出                  |
|------|--------------|------------------------------|--------------------------------------------------------------------------|-------------------------------------------------------------|-----------------------------|
| **0** 初始化 | 5–7 天      | 搭建骨架 + 设计系统          | 项目初始化、完整设计系统（颜色、字体、渐变、Playfair/Inter/JetBrains）、PWA 配置、基础布局（Sidebar + Today 页） | 能安装为 PWA，深浅模式切换流畅，Coin Drop 动画独立运行     | 新 PRD.md + Storybook      |
| **1** 基础记账闭环（MVP） | 2–3 周     | “3秒记账”情感闭环            | 纯文本输入（“咖啡 35” → 自动解析）、Dexie 存储、Today 页（输入+今日列表+小计）、金币掉落动画+音效、预设 20 个分类 | 输入一句话 → 立刻看到记录 + 金币掉落 + 列表更新（全离线） | GitHub Milestone 1，可试用 |
| **2** Ledger 历史视图 | 2 周       | 可查可管                     | 时间线列表（日/月分组）、搜索 + 分类/金额过滤、编辑/删除/批量操作、简单统计卡片（本月 Top3 支出） | 能滚动查看历史，随意增删改，数据持久化                     | Milestone 2                |
| **3** 多模态 + AI 增强 | 3 周       | 让记账“变魔法”               | 语音输入、照片上传（receipt）、Gemini 调用（用户 Key + 严格 JSON Schema）、置信度 <0.7 标记 review、AI 解释气泡、本地规则 fallback | 拍收据/说一句话 → 自动结构化 + 金币掉落（有/无网皆可用）   | Milestone 3（差异化关键）  |
| **4** Insight 基础智能 | 2–3 周     | 从数据到洞察                 | Recharts 月/年趋势图、自然语言简单查询（本地规则版）、异常提醒、初步预算设置（类别月上限） | 打开 Insight 页看到图表 + 文字洞察                         | Milestone 4                |
| **5** Vault + 打磨 & 发布 | 2 周       | 安全 + 完成度                | 生物识别锁（WebAuthn/FaceID）、CSV/JSON 导出、暗黑模式完整适配、PWA 离线优化、设置页（Key、备份、关于）、onboarding | 可作为完整产品分享（个人网站 / itch.io 等）                | v1.0 正式版                |

**Phase 6（可选扩展，后续迭代）**
- 全离线 AI（WebLLM 集成）
- 迁移到 SQLite WASM + 复杂查询
- 可选端到端加密同步（自建 Sync Server，参考 Actual Budget）
- 多币种 / 多账户 / 投资追踪

## 3. 每个阶段简要执行 Checklist（示例：Phase 1）

**Phase 1 – 基础记账闭环**
- [ ] 实现自然语言解析器（Zod + 简单正则，支持中英混合）
- [ ] Dexie schema 定义（Transaction: id, date, amount, merchant, category, note, confidence, needsReview）
- [ ] Today 页面组件 + 输入表单
- [ ] Coin Drop 动画组件（Framer Motion spring）
- [ ] 单元测试：输入“星巴克 35” → 正确解析 & 存入 Dexie
- [ ] 准备 50 条测试数据插入脚本
- [ ] 音效文件集成（coin-drop.mp3）

## 4. 风险防控 & 加速建议

- **最大风险**：IndexedDB 后期性能瓶颈 → Phase 1 预留 migration hook，2 周内可切 SQLite WASM
- **动机管理**：每周五固定录制 30 秒 Demo 视频发给自己/小群
- **早期测试**：Phase 2 结束找 5–10 个记账重度用户封闭测试
- **开源准备**：从 Phase 0 用 MIT License，README 突出 Dieter Rams 哲学 + “Each Galleon counts”
- **文档位置建议**：把本方案作为 `docs/roadmap-v2.md`，PRD 保持愿景向，本文件专注执行路径

这份方案的核心是：**先做出让人上瘾的情感闭环，再逐步叠加智能**。  
Phase 1 完成后，你就已经有了一个“比大部分记账工具更好玩”的最小可用产品。

需要我把某个阶段再展开成更细的子任务列表、代码框架，或者直接给 Phase 0 的项目初始化命令吗？随时说！🚀