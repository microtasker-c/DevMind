# 文章编辑、发布与真实数据设计

## 已确认需求
- 登录用户可用 BlockNote 写作、手动保存草稿、发布、编辑自己的文章。
- 已发布文章保存后立即更新公开内容，不维护版本快照，不自动保存公开文章。
- 首页及已发布详情公开阅读；写作、我的文章、账户设置要求登录且邮箱已验证。
- 注册后进入验证页自动发送邮件并显示投递请求结果；使用 Resend HTTP API。既有未验证账户访问受保护页面时同样需要验证。
- 封面 URL 在发布表单选填，可在已发布文章编辑时修改；服务端仅接受 HTTP(S) URL。

## 数据架构
Drizzle 管理 articles（UUID、author_id、title、excerpt、cover_url、draft/published、reading_minutes、revision、created_at、updated_at、published_at）、article_contents（一对一 JSONB document、format_version）、tags（UUID、name、slug）、article_tags（复合主键）。作者关联现有 Better Auth user。列表不读取正文，详情单独读取。发布时间与 UUID 稳定游标分页，作者列表索引。revision 乐观并发控制拒绝覆盖旧编辑。首次发布记录 published_at，公开更新只改变 updated_at。

写入在事务中完成，数据库约束状态、已发布字段、正文格式版本。所有访问经过可信服务端，public 业务表启用 RLS 且不向 anon/authenticated 开放直接访问；Better Auth 会话不使用 Supabase JWT，权限在服务端显式验证，不伪造 auth.uid() 策略。

## 编辑器与业务边界
复用已安装 @blocknote/core/react 0.41.x，HeroUI 构建编辑工具栏，BlockNoteViewRaw 渲染。首期支持段落、标题、引用、代码、常用列表和链接；不做上传、协作或修订历史。统一受限 BlockNote schema，服务端递归校验类型、属性、链接、深度、数量和大小。摘要为空时从正文提取，阅读时长服务端计算。

服务端查询模块负责列表、公开详情、所有者编辑数据；Server Action 负责写入与刷新缓存。写入检查登录、验证邮箱及资源所有权，页面守护不代替 Action 校验。草稿只对作者可见，公开详情对草稿和不存在文章均返回 404。

## 认证与守护
注册后允许创建未验证会话，以便访问独立验证提示页并重发邮件；服务端统一 requireVerifiedSession 守护所有私有路由及文章写入。验证提示页检查最新数据库状态，验证成功返回原站内路径，拒绝外部重定向。注册/登录/验证回调保持可达。Resend 未配置或请求失败明确报错，不记录凭据或验证链接。重发复用 Better Auth 限流。已验证依赖行为：Better Auth 1.7.18 会吞掉 sendOnSignUp 的发送异常，因此关闭隐式发送，改由验证页自动调用可等待结果的发送接口，成功才显示已发送。

## 页面
- 首页服务器读取真实已发布数据，站内搜索与游标分页；移除虚构作者、刊物、互动计数与精选文章。
- /articles/[id] 公开详情，统一只读正文。
- /write、/articles/[id]/edit、/my/articles 为私有页面。
- /verify-email 展示验证状态、重发及刷新，保留安全返回地址。
- 公共 loading/error/empty 状态与写入失败、未保存提醒、并发冲突反馈。

## 验证与范围
测试正文与 URL 校验、权限矩阵、安全返回地址、认证邮件流程和文章数据库生命周期（环境允许时）。执行 typecheck、lint、现有测试、生产构建。生成并审查 Drizzle 迁移；连接真实数据库前识别目标和现有表，仅增加表，不重置或导入虚假文章。真实 Resend 投递需要配置 RESEND_API_KEY 与 EMAIL_FROM，不在未授权时向真实收件人发送测试邮件。

不做点赞、评论、收藏、图片上传、AI 或搜索基础设施。保留所有用户已有未提交修改，不提交、不推送。
