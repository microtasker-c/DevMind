# AGENTS.md

# Dev-Mind — Project Instructions

## 1. Project Overview

Dev-Mind 是一个面向开发者的 AI 技术知识社区，产品形态参考 Medium。

项目不仅提供传统技术内容社区功能，还将逐步整合 AI 能力，为开发者提供技术文章创作、内容阅读、智能问答和知识检索等服务。

### Development Principles

- 优先保证核心业务功能的完整性。
- 重视用户体验、视觉一致性和交互细节。
- 保持代码结构清晰，避免过度工程化。
- 优先采用官方文档推荐的稳定实践。
- 不为了使用新技术而引入不必要的复杂度。
- 所有功能都应考虑异常状态、加载状态和空数据状态。

## 2. Technology Stack

项目必须遵循以下技术选型。未经明确授权，不得擅自替换核心技术。

| Category            | Technology           |
| ------------------- | -------------------- |
| Framework           | Next.js App Router   |
| Language            | TypeScript           |
| UI Components       | HeroUI               |
| Styling             | Tailwind CSS         |
| Rich Text Editor    | BlockNote            |
| Database            | Supabase PostgreSQL  |
| ORM                 | Drizzle ORM          |
| Authentication      | Better Auth          |
| AI Integration      | OpenAI Responses API |
| Frontend Deployment | Vercel               |
| Database Deployment | Supabase             |

### Technology Constraints

1. 使用 Next.js App Router，不使用 Pages Router。
2. 使用 TypeScript，不使用 JavaScript 编写新的业务模块。
3. 使用 HeroUI 作为主要 UI 组件库。
4. 使用 Tailwind CSS 编写样式，避免无必要地混用其他 CSS 框架。
5. 使用 BlockNote 实现文章编辑功能，不自行重复实现富文本编辑器。
6. 使用 Supabase PostgreSQL 作为主要数据库。
7. 使用 Drizzle ORM 管理数据库 Schema、查询和迁移。
8. 使用 Better Auth 负责身份认证，不使用 Supabase Auth 替代。
9. 使用 OpenAI Responses API 实现 AI 功能。
10. 使用 Vercel 部署 Next.js 应用，Supabase 提供数据库服务。

不要未经确认引入 Prisma、Redux、其他认证框架或其他数据库。

## 3. Next.js Architecture

### 3.1 App Router

遵循 Next.js App Router 的文件系统路由规范。

- 使用 `app/` 组织路由。
- 使用 `layout.tsx` 管理共享布局。
- 使用 `page.tsx` 定义页面。
- 使用动态路由处理文章详情等资源。
- 使用 Route Handlers 实现服务端 HTTP API。
- 使用 Server Actions 处理适合通过表单或服务端调用的业务操作。

### 3.2 Server Components and Client Components

默认使用 React Server Components。

只有在确实需要浏览器交互时才使用 `"use client"`。

适合 Client Components 的场景：

- 用户交互和事件处理
- React 状态管理
- 富文本编辑器
- AI 对话交互
- 浏览器 API
- 需要客户端生命周期的组件

避免在整个页面或布局中不必要地使用 `"use client"`。

尽量缩小 Client Component 的边界，避免将整个组件树转变为客户端组件。

### 3.3 Data Fetching

- 优先在 Server Components 中获取服务端数据。
- 避免为了服务端组件获取数据而额外创建无意义的内部 HTTP 请求。
- 根据业务需求选择服务端查询、Server Actions 或 Route Handlers。
- 对用户相关数据必须进行身份验证和权限校验。
- 不要假设所有数据都可以公开访问。

### 3.4 Next.js Version Compatibility

- 遵循项目实际安装的 Next.js 版本。
- 不要混用不同大版本的 API。
- `params`、`searchParams` 等 API 必须按照当前版本的类型和异步规范使用。
- 使用缓存、重新验证和路由配置时，先确认当前版本的官方文档。
- 不要照搬旧版本 Next.js 教程中的过时写法。

## 4. TypeScript and React Standards

### TypeScript

- 优先使用明确的类型定义。
- 避免使用 `any`。
- 不要为了消除类型错误而随意使用类型断言。
- 对外部 API、表单和数据库输入进行类型验证。
- 合理区分数据库类型、业务类型和 UI 类型。
- 优先复用已有类型，避免重复定义。

### React

- 使用函数组件和 Hooks。
- 遵循 React Hooks 规则。
- 避免不必要的 `useEffect`。
- 避免不必要的状态和重复数据。
- 使用稳定的 `key`。
- 将复杂业务逻辑与 UI 展示适当分离。
- 不要为了组件复用而过度抽象。

### Component Design

- 保持组件职责单一。
- 优先使用组合而不是复杂的条件判断。
- 公共组件应具有明确的 Props 类型。
- 避免将大量业务逻辑堆积在单个页面组件中。
- 不要为了复用而创建只有一次使用价值的复杂抽象。

## 5. UI and Styling

### HeroUI

- 优先使用 HeroUI 提供的组件。
- 统一使用 HeroUI 组件及其设计规范。
- 只有在现有组件无法满足需求时，才自行实现基础 UI 组件。
- 不要在未经确认的情况下混入其他 UI 组件库。
- 注意 HeroUI 当前安装版本的 API 和组件属性。

### Tailwind CSS

- 使用 Tailwind CSS 管理布局、间距、颜色和响应式样式。
- 保持样式命名和设计规则一致。
- 避免大量重复的自定义 CSS。
- 优先使用响应式设计。
- 注意深色模式和主题一致性。

### Design Principles

Dev-Mind 的视觉风格应体现技术社区的专业性。

- 页面简洁、清晰，避免过度装饰。
- 保持合理的信息层级和内容密度。
- 文章阅读体验应优先于装饰效果。
- AI 对话界面应突出交互效率和信息可读性。
- 统一按钮、卡片、表单、弹窗和导航的设计语言。
- 不要生成千篇一律的 AI Dashboard 模板界面。

## 6. BlockNote Editor

BlockNote 是 Dev-Mind 的核心内容编辑工具。

### Development Rules

- 使用 BlockNote 官方推荐的 React 集成方式。
- 文章内容优先使用 BlockNote 的结构化文档数据。
- 明确区分编辑器内容与文章元数据。
- 正确处理编辑器初始化、内容更新和数据持久化。
- 注意编辑器组件的客户端渲染要求。
- 避免在不必要的情况下重复创建 Editor 实例。
- 正确处理草稿、已发布文章和编辑状态。

### Data Persistence

- 保存结构化文档数据，不要仅保存编辑器生成的 HTML。
- 根据实际需求生成 HTML 或其他展示格式。
- 文章内容需要考虑数据校验和异常恢复。
- 不要直接信任客户端提交的文章内容。

## 7. Database and Drizzle ORM

### Database

Supabase PostgreSQL 是项目的主要数据库。

Drizzle ORM 负责数据库 Schema、查询和迁移。

### Rules

- 使用 Drizzle Schema 定义数据库结构。
- 数据库 Schema 应保持集中管理。
- 使用明确的主键、外键和索引。
- 正确设计用户、文章、评论和 AI 对话之间的关系。
- 合理使用事务保证多步骤数据操作的一致性。
- 避免重复查询和不必要的数据读取。
- 所有数据库操作必须在可信任的服务端环境执行。

### Migrations

- 使用 Drizzle Kit 管理数据库迁移。
- 数据库结构变更必须生成对应迁移文件。
- 不允许随意删除生产环境数据。
- 不允许通过未经确认的操作重置生产数据库。
- 迁移前检查现有数据和表结构。

### Database Security

- 不要将数据库连接字符串暴露给客户端。
- 不要将数据库密钥提交到 Git。
- 对涉及用户数据的操作进行权限检查。
- 正确处理 Supabase PostgreSQL 的连接配置。
- 区分开发环境与生产环境的数据库连接。

## 8. Authentication — Better Auth

Better Auth 是项目唯一的身份认证方案。

第一阶段仅支持：

- 邮箱注册
- 邮箱密码登录
- 退出登录
- 登录状态管理
- 基础用户信息管理

### Rules

- 使用 Better Auth 官方推荐的集成方式。
- 使用 Drizzle ORM 与 PostgreSQL 适配。
- 认证相关配置统一管理。
- 服务端和客户端认证逻辑适当分离。
- 对需要登录的页面和业务接口进行身份验证。
- 对文章编辑、删除等操作进行资源级权限校验。
- 不要仅依靠前端隐藏按钮实现权限控制。
- 密码和认证凭证不得明文存储或暴露。

第一阶段不主动引入 OAuth、社交登录等额外认证方式。

注意 Better Auth 自身的数据库 Schema 与业务数据 Schema 应保持清晰的职责边界。

## 9. AI Integration — OpenAI Responses API

OpenAI Responses API 是项目的 AI 能力接入方案。

### Initial Features

第一阶段优先实现：

- AI 多轮对话
- 流式响应
- 对话历史管理
- AI 技术问答
- 基础错误处理
- 停止生成

### Development Rules

- 所有 OpenAI API 请求必须在服务端执行。
- API Key 必须存储在服务端环境变量中。
- 不允许将 OpenAI API Key 暴露给浏览器。
- 使用 Responses API，不要擅自改用旧版 Assistants API。
- 正确处理流式响应。
- 正确处理请求超时、网络异常和 API 错误。
- 支持用户主动停止生成。
- 根据实际业务需要保存对话记录。
- 对用户输入和模型输出进行必要的校验。
- 不要假设模型输出始终符合预期格式。

### AI Architecture

将 AI API 调用、业务逻辑和前端交互适当分离。

避免直接在 React 组件中编写模型请求逻辑。

未来扩展 RAG、结构化输出和工具调用时，应尽量复用现有 AI 服务层。

## 10. Environment Variables and Security

- 使用环境变量管理敏感配置。
- 不要提交 `.env`、`.env.local` 等包含真实密钥的文件。
- 提供 `.env.example`，只保留变量名称和必要说明。
- 只有明确允许公开的配置才能使用 `NEXT_PUBLIC_` 前缀。
- 不要将数据库连接字符串、OpenAI API Key 或认证密钥暴露给客户端。
- 不要在日志中输出密码、Token 或完整敏感请求信息。
- 对外部输入进行必要的校验。
- 对敏感业务接口实施身份认证、权限校验和必要的请求限制。

## 11. Error Handling and User Experience

每个主要业务功能都应考虑：

- Loading State
- Error State
- Empty State
- Success Feedback
- Form Validation
- Network Failure

AI 功能还需要考虑：

- 模型请求失败
- 流式响应中断
- 用户取消生成
- 空响应
- 超时和重试
- 历史消息加载失败

不要仅处理正常成功路径。

## 12. Project Development Workflow

Codex 在执行任务时必须遵循以下流程。

### Before Development

1. 阅读项目根目录的 AGENTS.md。
2. 检查现有项目目录结构。
3. 阅读相关组件、服务和数据库 Schema。
4. 检查 package.json 中实际安装的依赖版本。
5. 理解现有实现和相关业务逻辑。
6. 对于涉及架构或数据库的改动，先提出实施方案。

### During Development

1. 优先修改与当前任务直接相关的文件。
2. 尽量遵循现有代码风格。
3. 避免无关重构。
4. 不擅自更换技术栈或安装大型依赖。
5. 不覆盖用户已有的未提交修改。
6. 对不明确的业务规则先询问，不自行假设。

### After Development

1. 检查 TypeScript 类型错误。
2. 执行项目已有的 Lint 检查。
3. 运行必要的测试。
4. 在适当情况下执行生产构建。
5. 检查是否引入新的安全问题。
6. 总结修改文件、实现内容和验证结果。
7. 明确说明尚未完成的部分。

不得声称已经通过未实际执行的测试或构建。

## 13. Dependency Management

- 优先使用项目已有依赖。
- 安装新依赖前说明用途和必要性。
- 优先选择官方维护且与当前版本兼容的依赖。
- 不要随意升级核心依赖。
- 不要为解决一个小问题引入多个功能重复的库。
- 修改 package.json 后检查依赖兼容性。

## 14. Git and Code Safety

- 不擅自执行 `git reset --hard`。
- 不擅自删除用户已有代码或文件。
- 不擅自覆盖未提交的工作。
- 不擅自执行生产数据库重置。
- 不擅自提交或推送代码，除非用户明确要求。
- 保持每次修改的范围清晰，方便代码审查和回滚。

## 15. Documentation Priority

开发过程中优先参考：

1. 当前项目实际安装版本对应的官方文档。
2. 官方 API Reference。
3. 官方 GitHub 仓库和示例。
4. 可信赖的社区实践。

涉及 Next.js、React、HeroUI、Tailwind CSS、BlockNote、Drizzle ORM、Better Auth、Supabase 和 OpenAI 时，不要直接套用过时教程。

当文档与项目当前版本不一致时，以项目实际版本和对应的官方文档为准。

## 16. Final Principle

Dev-Mind 的开发目标是构建一个具备真实业务价值、良好用户体验和可维护工程架构的 AI 技术知识社区。

Codex 应优先保证：

- 正确性
- 可维护性
- 安全性
- 用户体验
- 技术栈一致性

不要为了追求开发速度而牺牲代码质量，也不要为了追求架构复杂度而引入不必要的技术。