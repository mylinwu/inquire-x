# Inquire X

一个支持三段式思考流程的 AI 聊天应用，提供深度对话体验。

## 功能特性

### 核心功能

- **三段式 AI 回复流程**：撰写 → 检查 → 润色，提供更深思熟虑的回答
- **思考模型支持**：支持显示"思考中"状态，实时展现 AI 思考过程
- **流式 Markdown 渲染**：支持 CommonMark、GFM（表格、任务列表）、代码高亮、KaTeX 数学公式
- **智能追问**：AI 回复完成后自动生成 3 个追问建议
- **重新生成功能**：支持重新生成 AI 回复内容

### 问题管理

- **推荐问题**：空状态时展示可点击的推荐问题
- **AI 生成问题**：可开启 AI 根据参考问题风格生成新问题，支持缓存和刷新
- **问题编辑**：支持自由换行编辑推荐问题

### 用户体验

- **会话管理**：支持多会话，数据持久化到 localStorage
- **PWA 支持**：可安装为桌面应用，支持离线使用
- **响应式设计**：适配桌面和移动设备
- **设置自定义**：API Key、模型选择、提示词、流式速度、温度参数等

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

应用将在 <http://localhost:4000> 启动。

### 配置

1. 打开应用后，点击左上角菜单按钮
2. 点击"设置"按钮
3. 填入你的 OpenRouter API Key（从 [openrouter.ai/keys](https://openrouter.ai/keys) 获取）
4. 选择 AI 模型
5. 根据需要调整设置：
   - 开启/关闭三段式思考流程
   - 开启 AI 生成推荐问题
   - 调整模型温度参数
   - 自定义用户称呼
6. 保存设置

## 项目结构

```text
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # 聊天 API
│   │   ├── followup/route.ts          # 追问生成 API
│   │   ├── models/route.ts            # 模型列表 API
│   │   └── generate-questions/route.ts # AI 生成问题 API
│   ├── globals.css                    # 全局样式
│   ├── layout.tsx                     # 根布局
│   └── page.tsx                       # 主页面
├── components/
│   ├── ChatInput.tsx                  # 输入框组件
│   ├── ChatList.tsx                   # 聊天列表
│   ├── ChatMessage.tsx                # 消息组件
│   ├── MarkdownRenderer.tsx           # Markdown 渲染器
│   ├── MenuPanel.tsx                  # 侧边菜单
│   ├── Navbar.tsx                     # 导航栏
│   ├── RecommendedQuestions.tsx       # 推荐问题
│   ├── SettingsDialog.tsx             # 设置弹框
│   └── settings/                      # 设置子组件
│       ├── SettingsBasicSection.tsx
│       ├── SettingsModelSection.tsx
│       ├── SettingsFeatureSection.tsx
│       ├── SettingsPromptsSection.tsx
│       └── SettingsImportExport.tsx
├── hooks/
│   └── useChat.ts                     # 聊天 Hook
├── lib/
│   ├── highlighter.ts                 # 代码高亮
│   ├── markdown.ts                    # Markdown 处理
│   └── utils.ts                       # 工具函数
├── store/
│   └── index.ts                       # Zustand Store
└── types/
    └── index.ts                       # 类型定义
```

## 三段式回复流程

1. **打草稿中**：AI 给出初始回答
2. **检查中**：AI 审视自身答案，找出不严谨之处
3. **正在输出**：基于反思结果输出最终优化的答复

可在设置中关闭三段式流程，使用单次直接回复。

## AI 生成问题

开启 AI 生成问题功能后：

- AI 会根据设置的参考问题风格生成 5 个新问题
- 生成的问题会缓存到本地，下次打开时直接使用
- 可通过右上角的"换一批"按钮重新生成
- 生成过程中显示加载状态

## 高级设置

### 模型温度

- **低温度 (0.0-0.7)**：回答更精确、保守
- **高温度 (0.8-2.0)**：回答更有创意、跳跃性

### 用户信息

- 可设置用户称呼，AI 在对话中会使用
- 自动在提示词中包含当前时间信息

## 开发命令

```bash
# 开发模式
pnpm dev          # 启动开发服务器 (端口 4000)

# 构建
pnpm build        # 构建生产版本

# 启动生产服务器
pnpm start        # 启动生产服务器

# 代码检查
pnpm lint         # 运行 ESLint
```

## License

MIT
