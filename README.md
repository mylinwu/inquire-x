# Inquire X

一个支持三段式思考流程的 AI 聊天应用。

## 功能特性

- **三段式 AI 回复流程**：思考 → 自我质疑 → 打磨，提供更深思熟虑的回答
- **流式 Markdown 渲染**：支持 CommonMark、GFM（表格、任务列表）、代码高亮、KaTeX 数学公式
- **智能追问**：AI 回复完成后自动生成 3 个追问建议
- **推荐问题**：空状态时展示可点击的推荐问题
- **会话管理**：支持多会话，数据持久化到 localStorage
- **设置自定义**：API Key、模型选择、提示词、流式速度等

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **AI SDK**: ai-sdk + @ai-sdk/react + @openrouter/ai-sdk-provider
- **Markdown**: markdown-it + KaTeX
- **代码高亮**: Shiki
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 配置

1. 打开应用后，点击左上角菜单按钮
2. 点击"设置"按钮
3. 填入你的 OpenRouter API Key（从 [openrouter.ai/keys](https://openrouter.ai/keys) 获取）
4. 选择 AI 模型
5. 保存设置

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # 聊天 API
│   │   ├── followup/route.ts  # 追问生成 API
│   │   └── models/route.ts    # 模型列表 API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页面
├── components/
│   ├── ChatInput.tsx          # 输入框组件
│   ├── ChatList.tsx           # 聊天列表
│   ├── ChatMessage.tsx        # 消息组件
│   ├── MarkdownRenderer.tsx   # Markdown 渲染器
│   ├── MenuPanel.tsx          # 侧边菜单
│   ├── Navbar.tsx             # 导航栏
│   ├── RecommendedQuestions.tsx # 推荐问题
│   └── SettingsDialog.tsx     # 设置弹框
├── hooks/
│   └── useChat.ts             # 聊天 Hook
├── lib/
│   ├── highlighter.ts         # 代码高亮
│   ├── markdown.ts            # Markdown 处理
│   └── utils.ts               # 工具函数
├── store/
│   └── index.ts               # Zustand Store
└── types/
    └── index.ts               # 类型定义
```

## 三段式回复流程

1. **思考中**：AI 给出初始回答
2. **自我质疑中**：AI 审视自身答案，找出不严谨之处
3. **打磨中**：基于反思结果输出最终优化的答复

可在设置中关闭三段式流程，使用单次直接回复。

## License

MIT
