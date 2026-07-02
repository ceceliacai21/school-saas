# 教育培训后台管理系统 MVP

这个工作区现在是一版可运行的静态教学运营平台网页原型，首页提供两个入口：

- 课件知识库
- 学生管理平台

目标是先验证老师每天会用的流程：

- 账号、角色、权限
- 学生、班级、课程管理
- 课件上传、分类、下载模拟
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

## 当前边界

这一版使用浏览器 `localStorage` 保存数据，适合快速试流程和确认字段。正式产品建议下一步接入：

- PostgreSQL 数据库
- 服务端鉴权与 RBAC 权限
- OSS/S3 文件云存储
- 结构化报告生成接口
- 文档解析、向量索引和 RAG 问答
- HTML 模板转 PDF
