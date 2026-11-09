# Dev-Mind

Dev-Mind 是面向开发者的技术知识社区，当前仓库包含可运行的 Next.js App Router 基础骨架。

## 开发

```bash
pnpm install
pnpm dev
```

## 检查

```bash
pnpm typecheck
pnpm build
```

复制 `.env.example` 为 `.env.local` 并填写服务端配置，执行 `pnpm db:migrate` 后启动应用。
首页读取数据库中已发布的真实文章，支持标题、摘要、作者、标签搜索与游标分页。没有文章时显示空状态，不自动写入示例文章。

## 文章写作与阅读

- `/write`：使用 BlockNote 写作，手动保存草稿或发布。
- `/my/articles`：查看自己的草稿和已发布文章。
- `/articles/[id]/edit`：仅作者可编辑，已发布文章保存后立即公开更新。
- `/articles/[id]`：公开阅读已发布文章；草稿及无效链接返回 404。

发布前可填写摘要、技术标签和可选的封面链接，封面仅接受 HTTP(S) 地址。摘要留空时由服务端根据正文生成，阅读时长也由服务端计算。
首期支持段落、1–3 级标题、常用列表、待办、引用、代码和链接；不包含图片上传、评论、点赞、收藏或版本历史。正文保存为 BlockNote JSONB，不保存未校验 HTML。

数据库由 `articles`、`article_contents`、`tags`、`article_tags` 四张表组成，定义见 `lib/db/article-schema.ts`。保存元数据、正文和标签使用事务，revision 防止多页面编辑相互覆盖；遇到版本冲突应先保留当前内容，再刷新页面。
业务表启用 RLS 并撤销浏览器角色直接访问权限，查询和写入通过服务端 Drizzle 执行；认证使用 Better Auth，不依赖 Supabase Auth JWT。

## 邮箱验证与路由守护

首页和已发布文章详情公开访问。写作、我的文章、编辑和账户设置要求登录且邮箱已验证；文章保存和资料修改接口同样在服务端校验，不能仅通过手动构造请求绕过。

注册后进入 `/verify-email`，页面自动发送验证邮件并显示发送结果，支持重发及刷新验证状态；现有未验证账户访问受保护页面时进入相同流程。
验证链接 1 小时内有效。未登录用户先跳转登录，验证成功后回到安全的站内原目标页。

邮件通过 Resend HTTP API 发送，无需额外 SDK。在 `.env.local` 中配置以下服务端变量后重启：

```dotenv
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=Dev-Mind <noreply@your-verified-domain.com>
```

`EMAIL_FROM` 必须使用 Resend 已验证域名下的地址；部署时同步配置 `BETTER_AUTH_URL` 和 `NEXT_PUBLIC_APP_URL` 为实际站点地址。

首次配置步骤：

1. 注册 [Resend](https://resend.com)，在 Domains 添加自己拥有的域名（建议使用发信子域名，如 `auth.your-domain.com`）。
2. 在域名的 DNS 管理处添加 Resend 页面提供的记录，等待 Domains 显示 Verified。
3. 在 API Keys 创建有发信权限的密钥，仅填入本机 `.env.local` 的 `RESEND_API_KEY`；将 `EMAIL_FROM` 设为该已验证域名下的地址。
4. 重启 `pnpm dev`，登录现有未验证账户，进入 `/verify-email`。页面会自动发送，无需重新注册。
5. 在 Resend 的邮件记录中查看发送/投递结果，然后打开收件箱内的链接完成验证。若刚尝试过发送，请等待一分钟再重试。

此流程由 Better Auth 生成验证链接、Resend 发送邮件；Supabase 只存储账户和会话。Supabase Auth 的 SMTP 与邮件模板设置不适用于此流程。
不要将密钥提交到 Git 或放入 `NEXT_PUBLIC_` 变量。部署到 Vercel 时也需配置这两个服务端变量并重新部署。
未配置或发送失败会在验证页显示错误，不会把账户直接标记为已验证。重发使用 Better Auth 的每实例内存限流（每 IP 每分钟 1 次）；多实例部署需要进一步配置共享限流存储。

## 测试

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

单元与认证接口测试使用内存适配器，不访问真实邮箱或数据库。需要 Node.js 22.6+，Node 22 的类型擦除可能显示实验特性提示。

数据库集成测试需要可创建 Schema 的测试连接，显式开启后，在随机隔离 Schema 的事务内运行迁移、文章生命周期、权限与分页断言，最后全部回滚；不向 public 表写入测试数据。默认运行会跳过：

```powershell
$env:RUN_DB_INTEGRATION = '1'
node --experimental-strip-types --import ./tests/register-loader.mjs tests/article-db.integration.mjs
Remove-Item Env:RUN_DB_INTEGRATION
```

## 账户设置

登录后，悬停或点击右上角头像，选择 Settings 进入 `/settings/account`。
页面使用 Better Auth UI 的 `AccountSettings`，支持修改姓名；邮箱只读，头像操作待后续接入。

姓名更新复用 `POST /api/auth/update-user`，由 Better Auth 校验会话和请求来源，并要求邮箱已验证。
服务端仅接受 `name`，去除首尾空白后长度须为 1–80 个字符；不接受客户端指定用户 ID 或修改邮箱、头像。
保存成功后，组件会刷新会话资料并提示结果。

运行接口测试（使用内存适配器，不访问真实数据库，需要 Node.js 22.6+）：

```bash
node --experimental-strip-types --test tests/profile-update.test.mjs
```
