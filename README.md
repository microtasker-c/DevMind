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

## 登录与路由守护

当前版本暂时停用邮箱验证和忘记密码/密码找回功能，无需配置 Resend 或 SMTP。
保留邮箱密码注册、登录、退出及会话管理；注册成功后即可写作和管理账户，已有未验证账户也可直接使用。
不会将账户的 `emailVerified` 标记为 true；保留 Better Auth 所需的认证字段和表，不修改已有账户数据。

首页和已发布文章详情公开访问。写作、我的文章、编辑和账户设置仍要求登录；文章保存和姓名修改同样在服务端校验会话。
文章归属、输入校验和安全返回地址限制继续生效，不能编辑其他用户的文章。

验证页面和找回密码页面已移除，直接访问显示未找到页面；服务端同样禁用邮件验证、密码重置申请与重置回调接口（返回 404）。
当前无法通过邮件找回忘记的密码。未来恢复时需同时接入发信服务并恢复 UI、路由与接口。

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
node --experimental-strip-types --import ./tests/register-loader.mjs --test tests/profile-update.test.mjs
```
