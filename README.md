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

数据库连接在开发热更新之间复用，每个实例最多保留 1 个连接，建连超时为 30 秒；空闲 20 秒或连接存活 5 分钟后回收。文章读取遇到 `CONNECT_TIMEOUT` 会重新连接并重试一次，持续失败交由错误页面处理，写入和调用方传入的事务不会自动重试。

如果仍持续超时，请检查 Supabase 项目是否运行、数据库网络限制及本机到连接池的网络。`DATABASE_URL` 应从项目 Connect 面板复制：Vercel 通常使用 Transaction pooler（6543），本地长驻开发服务可使用 Session pooler（5432）。不要自行拼接或更换连接池主机名。

## 文章写作与阅读

- `/write`：使用 BlockNote 写作，手动保存草稿或发布。
- `/my/articles`：查看自己的草稿和已发布文章。
- `/articles/[id]/edit`：仅作者可编辑，已发布文章保存后立即公开更新。
- `/articles/[id]`：公开阅读已发布文章；草稿及无效链接返回 404。

保存草稿前会比较标题、正文和文章信息：没有更改（包括修改后撤销）时，仅显示提示，不发送保存请求或跳转。有更改且保存成功后返回首页，右下角显示约 4 秒的成功提示；保存失败时保留编辑内容。草稿不触发公开页面重新验证，避免保存时无用的编辑页渲染和布局 CSS 预加载。

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
页面使用项目内的 `ProfileSettings` 表单和 HeroUI 组件，支持修改姓名和上传头像，邮箱只读。点击“保存更改”后明确显示成功或失败 toast；姓名校验失败也显示 toast 并保留输入。资料更新成功后刷新服务器页面数据，主页文章列表读取作者头像 URL，无头像或加载失败时显示姓名首字。

姓名和头像更新复用 `POST /api/auth/update-user`，由 Better Auth 校验会话和请求来源，不要求邮箱已验证。
服务端仅接受 `name` 和 `image`：姓名去除首尾空白后长度须为 1–80 个字符；头像只接受当前 Supabase 项目 `avatars` 桶中属于当前用户的上传 URL（或 `null` 以移除头像）。不能指定用户 ID、修改邮箱或保存任意外部 URL / Base64。
保存成功后，组件会刷新会话资料并提示结果。

### 头像存储

在 `.env.local` 和部署平台配置 `NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SECRET_KEY`（或旧版 `SUPABASE_SERVICE_ROLE_KEY`）。密钥仅供服务端使用，不加 `NEXT_PUBLIC_` 前缀。
在 Supabase Storage 创建公开读取的 `avatars` 桶，限制文件大小为 2 MB、类型为 PNG / JPEG / WebP；已有其他桶时可设置 `SUPABASE_AVATAR_BUCKET`。不要添加允许匿名上传、修改或删除的策略。

用户只需选择图片：浏览器将不超过 2 MB 的 PNG / JPEG / WebP 居中裁成 256px 方形 PNG，上传到 `POST /api/account/avatar`。服务端校验 Better Auth 会话、同源请求、请求体大小和图片文件签名，然后使用服务端密钥上传到 `用户 ID/随机 UUID.png`，返回 Supabase 生成的公开 URL；Better Auth 将 URL 保存到已有 `user.image` 字段，无需数据库迁移。
选择头像只在本地预览，不上传图片或更新账户。点击“保存更改”后才上传所选头像，并将姓名和头像 URL 一起提交保存；没有选择新头像时只保存姓名。保存失败保留输入和所选图片，成功后清除待保存状态并刷新会话及页面。更换使用新 URL，避免 CDN 缓存旧图片。设置页不提供移除头像操作。

上传接口按当前服务实例限制每用户每分钟最多 10 次；多实例部署的全局配额需另配共享限流。移除头像只清空资料引用，更换或移除后的旧对象以及上传后未完成资料保存的对象仍保留在桶内，可按后续保留策略清理。

运行接口测试（使用内存适配器，不访问真实数据库，需要 Node.js 22.6+）：

```bash
node --experimental-strip-types --import ./tests/register-loader.mjs --test tests/profile-update.test.mjs
```
