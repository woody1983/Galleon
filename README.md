# 🪙 Galleon

> **先做出让人上瘾的情感闭环，再逐步叠加智能。**  
> *Build the addictive emotional loop first, then layer intelligence on top.*

Galleon 是一款专为中文用户设计的智能记账应用，以「金币与炼金术」为设计主题，追求 Dieter Rams 式的克制美学。它不仅是记账工具，更是你财务旅程中的魔法伙伴。

---

## ✨ 核心特性

### 🎯 自然语言记账
- 输入「星巴克 35」或「昨天打车二十八」即可自动识别
- 本地规则解析，零延迟响应
- 支持多模态输入（文字、语音、拍照）

### 🪙 金币掉落反馈
- 每次记账触发精美的金币动画
- 配合音效，打造上瘾式情感闭环
- 让记账从负担变成小确幸

### 🔮 AI 智能增强（可选）
- 集成 Google Gemini API（用户自备 Key）
- 票据拍照自动识别
- 智能分类与异常检测
- 离线优先，网络不佳时自动降级本地解析

### 🔒 隐私优先
- **零遥测**：无分析、无追踪、无服务端调用
- **数据永不上传**：所有数据存储在本地 IndexedDB
- **开源透明**：MIT 许可证，代码可审计

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 15 + TypeScript |
| 样式 | Tailwind CSS + shadcn/ui |
| 动画 | Framer Motion |
| 数据 | Dexie.js (IndexedDB) |
| 图表 | Recharts |
| AI | Google Gemini API |

---

## 📱 功能模块

- **今日** — 快速记账入口，展示当日交易
- **账本** — 历史记录浏览、搜索、筛选
- **洞察** — 数据可视化与消费分析
- **金库** — 设置、数据导出、安全锁定

---

## 🗺️ 开发路线图

| 阶段 | 目标 | 预计时间 |
|------|------|----------|
| Phase 0 | 项目初始化与设计系统 | 5-7 天 |
| Phase 1 | 基础记账闭环（MVP） | 2-3 周 |
| Phase 2 | 账本历史视图 | 2 周 |
| Phase 3 | 多模态输入 + AI 增强 | 3 周 |
| Phase 4 | 洞察与预算系统 | 2-3 周 |
| Phase 5 | 安全、打磨与发布 | 2 周 |

详细实施计划见 [`doc/implementation_plan.md`](doc/implementation_plan.md)

---

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/woody1983/Galleon.git
cd Galleon

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 📝 设计理念

> *"好的设计是诚实的。"* — Dieter Rams

- **Less, but better** — 功能克制，每个特性都有存在的理由
- **情感化设计** — 金币掉落动画让记账变得有趣
- **本地优先** — 你的数据永远属于你
- **渐进增强** — 无网络、无 AI 也能完整使用

---

## 📄 许可证

[MIT License](LICENSE)

---

<p align="center">
  <sub>Made with 🪙 and magic</sub>
</p>
