# 教育培训后台管理系统 MVP

这个工作区现在是一版可运行的静态教学运营平台网页原型，首页提供两个入口：

- 课件知识库
- 学生管理平台

目标是先验证老师每天会用的流程：

- 账号、角色、权限
- 学生、班级、课程管理
- 课件上传、分类、云端下载
- 每节课课堂反馈记录
- 成绩与多维评分
- 学生阶段报告初稿生成
- 后续 AI、RAG、PDF、家长端实现路径

## 线上发布

这个版本是可直接部署的静态网页，可以发布到 Vercel、Netlify、GitHub Pages，或阿里云 OSS / 腾讯云 COS + CDN。

推荐先用 Vercel 或 Netlify：

1. 将项目推送到 GitHub。
2. 在 Vercel 导入仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 填 `npm run build`。
5. Output Directory 留空或填 `.`。

发布后会得到一个公网 URL，老师可以直接通过浏览器访问。

如果你希望我直接生成可分享 demo 链接，需要提供一个 GitHub 远程仓库，或允许我使用你的 Vercel / Netlify 账号完成登录发布。

## 本地预览

开发时可以直接打开 `index.html`。

也可以启动本地服务：

```bash
npm run dev
```

然后访问：

```text
http://localhost:4173
```

## Supabase 初始化

1. 在 Supabase Dashboard 打开 `SQL Editor`。
2. 新建查询，粘贴并执行 `supabase-setup.sql`。
3. 在 `Authentication > Users` 创建第一个账号。
4. 在 SQL Editor 执行脚本末尾的角色更新语句，将该账号设为 `admin`。
5. 回到网页，使用该账号登录后即可上传、下载和删除云端课件。

前端只使用 Publishable key。不要把 Secret key、`service_role` key 或数据库密码写入项目。

## 当前边界

课件文件和课件元数据已接入 Supabase；其他教学数据仍使用浏览器 `localStorage` 保存。下一步包括：

- 将学生、班级、成绩和报告迁移到 PostgreSQL
- 完善账号邀请和密码重置
- 结构化报告生成接口
- 文档解析、向量索引和 RAG 问答
- HTML 模板转 PDF
