# Dev-Mind 项目方案

> 面向开发者的 AI 技术知识社区，产品形态参考 Medium。

## 1. 项目目标

Dev-Mind 是一个以技术文章为核心的社区网站，第一阶段重点完成：

- 文章发布、阅读和基础互动
- AI 阅读助手
- AI 写作助手
- 可部署上线的完整开发闭环

跨文章知识检索作为第二阶段的最小版本实现。第一阶段不引入复杂 Agent 框架，也不追求企业级高并发架构。

## 2. 已确定技术栈

| 分类 | 选型 |
| --- | --- |
| Web 框架 | Next.js App Router |
| 语言 | TypeScript |
| UI 组件 | HeroUI |
| 样式 | Tailwind CSS |
| 富文本编辑器 | BlockNote |
| 数据库 | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| 身份认证 | Better Auth |
| 中国大陆 AI 主供应商 | 阿里云百炼 / 通义千问 |
| 前端部署 | Vercel |
| 数据库部署 | Supabase |

项目使用 Server Components 作为默认方案；需要编辑器、AI 对话、浏览器 API 或交互状态的区域才使用 Client Components。

### AI 供应商决策

用户已选择中国大陆内的 AI 服务，因此本项目的实际 AI 供应商采用阿里云百炼，而不是 OpenAI。项目根目录 `AGENTS.md` 中原有的 OpenAI 选型应视为待更新的历史约束，后续开发以本文档和用户最新决策为准。

推荐模型：

| 用途 | 模型 |
| --- | --- |
| 摘要、核心观点、文章问答 | `qwen-plus` |
| 标题生成和简单改写 | `qwen-turbo` |
| 后续 RAG 向量检索 | `text-embedding-v3` |

DeepSeek API 可作为未来备用供应商，但第一版只接入一个供应商，降低配置和排查成本。

## 3. 第一阶段功能范围

### 3.1 用户和认证

使用 Better Auth + Drizzle + Supabase PostgreSQL，支持：

- 邮箱注册
- 邮箱密码登录
- 退出登录
- 登录状态管理
- 基础用户信息

第一阶段不主动加入 OAuth、社交登录、团队协作和复杂权限系统。

### 3.2 文章社区

支持以下基本能力：

- 文章列表和分页
- 文章详情页
- 新建文章
- 编辑草稿
- 保存草稿
- 发布和取消发布
- 删除自己的文章
- 作者信息
- 点赞和取消点赞
- 评论和删除自己的评论
- 文章关键词搜索

公开页面只展示已发布文章。编辑、删除、发布、点赞和评论接口必须在服务端验证登录状态和资源权限，不能只依靠前端隐藏按钮。

推荐数据表：

- `users`
- `sessions`、`accounts` 等 Better Auth 表
- `articles`
- `article_likes`
- `comments`

`articles` 的核心字段：

```text
id, author_id, title, summary, slug,
content_json, content_html, status,
created_at, updated_at, published_at
```

BlockNote JSON 是编辑源，`content_html` 用于阅读页展示，正文提交时必须在服务端校验，不能直接信任客户端数据。

### 3.3 BlockNote 编辑器

BlockNote 负责文章创作，不自行实现富文本编辑器。编辑器需要满足：

- 客户端渲染
- 初始化已有 BlockNote JSON
- 草稿保存
- 发布前校验
- 获取当前选中文本
- 对选区执行局部替换

项目应封装一个小型编辑器适配层，隔离 BlockNote 的选区读取和插入 API，便于将来更换编辑器或升级版本。

## 4. AI 阅读助手

### 4.1 功能

在文章详情页提供侧边栏或抽屉，支持：

1. 生成文章摘要
2. 提取核心观点
3. 解释用户选中的技术术语
4. 针对当前文章提问

第一版的术语解释采用“选中文本后解释”的交互，不要求模型自动识别整篇文章的所有术语。

### 4.2 操作流程

1. 用户打开已发布文章。
2. 点击“AI 阅读助手”。
3. 选择摘要、核心观点或术语解释，或者输入问题。
4. 服务端读取文章标题和清理后的正文。
5. 服务端调用百炼模型。
6. 通过 `ReadableStream` 将结果逐步返回浏览器。
7. 前端按 Markdown 渲染结果。
8. 用户可以停止、重试、清空回答。

### 4.3 建议接口

```text
POST /api/ai/reader/summary
POST /api/ai/reader/key-points
POST /api/ai/reader/explain
POST /api/ai/reader/ask
```

请求体示例：

```ts
type ReaderRequest = {
  articleId: string;
  question?: string;
  selectedText?: string;
};
```

所有接口都必须处理：

- 加载状态
- 流式增量文本
- 用户主动停止
- 网络错误
- 模型错误
- 空响应
- 重试
- Markdown、代码块、列表和引用展示

停止生成使用客户端 `AbortController` 取消请求，并让服务端将取消信号传递给模型请求。

## 5. AI 写作助手

### 5.1 功能

编辑器旁提供 AI 写作面板，支持：

- 生成标题
- 生成摘要
- 润色选中文本
- 扩写选中文本
- 缩写选中文本
- 改成更清晰的技术表达

### 5.2 安全的确认式流程

1. 用户在 BlockNote 中选择一段文字。
2. 点击 AI 操作。
3. 前端保存选中文本、选区位置和文档版本。
4. 服务端请求模型。
5. 页面展示原文和 AI 结果预览。
6. 用户选择“应用修改”或“放弃”。
7. 只有确认后，才替换原选区。

AI 返回结果不能直接覆盖整篇文章，也不能直接覆盖用户当前正在编辑的内容。

如果模型返回期间文档已经发生变化，应用修改时应提示用户重新选择文本，防止过期选区写入错误位置。

### 5.3 建议接口

```text
POST /api/ai/writer/title
POST /api/ai/writer/summary
POST /api/ai/writer/rewrite
```

请求体示例：

```ts
type WriterRequest = {
  articleId?: string;
  operation: "polish" | "expand" | "shorten";
  selectedText: string;
  surroundingText?: string;
};
```

响应至少包含：

```ts
type WriterPreview = {
  originalText: string;
  generatedText: string;
  operation: string;
};
```

## 6. AI 服务层和中国大陆 API 接入

业务代码不直接依赖百炼 SDK 或 HTTP 细节，统一通过服务层调用：

```ts
interface AiProvider {
  streamChat(input: {
    system: string;
    user: string;
    context?: string;
  }): Promise<ReadableStream>;

  generateText(input: {
    system: string;
    user: string;
  }): Promise<string>;

  embed?(text: string): Promise<number[]>;
}
```

推荐环境变量：

```env
AI_PROVIDER=qwen
DASHSCOPE_API_KEY=
AI_MODEL=qwen-plus
AI_FAST_MODEL=qwen-turbo
AI_EMBEDDING_MODEL=text-embedding-v3
```

API Key 只能保存在服务端环境变量中，不得使用 `NEXT_PUBLIC_` 前缀，不得发送到浏览器。AI 请求必须经过服务端认证、输入校验、长度限制和基础频率限制。

虽然百炼提供 OpenAI 兼容接口，但项目将其视为“百炼适配器”，不能因此把模型密钥或请求逻辑放进 React 组件。

## 7. 第二阶段：最小版跨文章知识检索

第一版 RAG 不使用 Agent，不立即引入 pgvector。

### 7.1 建议流程

1. 文章发布时读取正文。
2. 按段落或固定长度切分文本。
3. 写入 `article_chunks`。
4. 使用 PostgreSQL 全文搜索建立检索索引。
5. 用户提问时召回相关片段。
6. 将前 5 个片段放入模型上下文。
7. 生成带来源的回答。
8. 页面展示真实文章标题、来源片段和原文链接。

### 7.2 数据表

```text
article_chunks
  id
  article_id
  chunk_index
  content
  search_vector
```

### 7.3 接口

```text
POST /api/ai/search/ask
```

响应示例：

```ts
type SearchAnswer = {
  answer: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    slug: string;
    excerpt: string;
    chunkId: string;
  }>;
};
```

升级路线：PostgreSQL 全文搜索 → `text-embedding-v3` → Supabase pgvector → 关键词和向量混合检索。

## 8. 页面和目录建议

主要页面：

```text
/
/login
/register
/write
/articles/[slug]
/articles/[slug]/edit
/profile/[username]
```

推荐目录职责：

```text
app/                 路由、页面、Route Handlers
components/editor/   BlockNote 编辑器
components/ai/       阅读助手和写作助手
components/articles/ 文章列表和详情
lib/db/              Drizzle Schema、查询和迁移
lib/auth/            Better Auth 配置
lib/ai/              百炼适配器、提示词、流式封装
lib/search/          全文检索和文章切片
types/               公共业务类型
```

核心业务文件尽量控制在 300 行以内，按职责拆分，避免将数据库、模型调用和 UI 逻辑写在同一个文件中。

## 9. 部署方案

推荐部署组合：

- GitHub：代码仓库
- Vercel：Next.js 应用和自动部署
- Supabase：PostgreSQL 数据库
- 百炼：AI 模型服务

Vercel 部署在境外，访问中国大陆 AI API 可能出现偶发延迟或超时。学习项目可以先使用 Vercel；如果实际流式请求不稳定，再将 Next.js 应用迁移到阿里云函数计算、腾讯云 CloudBase 或火山引擎。

部署前需要配置：

- `DATABASE_URL`
- Better Auth 的密钥和站点地址
- `DASHSCOPE_API_KEY`
- AI 模型名称
- 生产环境 Cookie 和回调地址

仓库应提供 `.env.example`，只写变量名称和说明，不写真实密钥。

## 10. 测试和验收标准

### 普通功能

- 未登录用户不能创建、编辑、发布文章。
- 只有作者可以编辑或删除自己的文章。
- 草稿不会出现在公开列表。
- 同一用户不能重复点赞同一篇文章。
- 用户只能删除自己的评论。
- 空列表、加载失败和表单错误都有明确反馈。

### AI 阅读助手

- 文章详情页可以触发摘要和问答。
- 结果逐步显示，而不是等待完整响应。
- Stop 可以停止生成。
- 失败后 Retry 可以重新请求。
- Markdown、代码块和列表能够正常展示。

### AI 写作助手

- 可以从编辑器选中文本。
- 可以请求润色、扩写或缩写。
- 返回结果先进入预览。
- 放弃操作不会改变原文。
- 确认后只替换选中文字。
- 文档发生变化后不会错误覆盖新内容。

### 跨文章检索

- 回答来自数据库中真实存在的文章片段。
- 页面显示文章标题、片段和原文链接。
- 来源链接能够跳转到对应文章。

## 11. 开发时间估算

按每天 2～3 小时计算：

| 阶段 | 预计时间 |
| --- | --- |
| Next.js 工程、UI、认证 | 3～5 天 |
| BlockNote、文章 CRUD、发布 | 5～7 天 |
| 点赞、评论、搜索 | 2～4 天 |
| AI 阅读助手 | 4～6 天 |
| AI 写作助手 | 5～7 天 |
| 部署、异常处理和测试 | 3～5 天 |
| 最小版跨文章检索 | 4～6 天 |

第一阶段预计 4～6 周；包含最小版 RAG 预计 5～7 周。免费额度可覆盖早期开发，主要可变成本来自模型调用。

## 12. 明确的第一版边界

第一版不做：

- OAuth 和社交登录
- 复杂角色权限
- 多级评论
- 关注和私信
- 实时协作编辑
- Agent 工作流
- 一开始就使用 pgvector
- 企业级监控、计费和高并发优化

先确保“注册 → 创作 → 发布 → 阅读 → AI 辅助 → 互动 → 部署上线”完整可用，再按实际使用情况扩展。

