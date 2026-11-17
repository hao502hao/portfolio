# Portfolio

静态个人作品集网站，面向 GitHub Pages 发布。

## 本地预览

PDF.js 使用 ES Module，Edge 会阻止通过 `file://` 直接加载。Windows 本地预览时，请双击项目根目录中的 `本地预览.cmd`，它会启动本地服务器并自动用 Edge 打开：

```text
http://127.0.0.1:4177/
```

不要直接双击 `index.html` 或 `viewer.html`。

也可以在此目录手动启动任意静态 HTTP 服务器：

例如：

```powershell
python -m http.server 8000
```

再打开 `http://127.0.0.1:8000/`。

## 构建样式

```powershell
npm install
npm run build:css
```

## 目录

- `index.html`：作品集首页
- `viewer.html`：PDF.js 项目浏览页（缩略图、翻页和全屏，不提供下载按钮）
- `css/site.css`：已编译、可直接部署的样式
- `js/projects.mjs`：四个项目的统一配置
- `js/viewer.mjs`：PDF 阅读器逻辑
- `assets/pdfs/web/`：适合网页加载的高清优化 PDF
- `assets/thumbnails/`：各项目页面缩略图
- `assets/covers/`：项目封面图
- `assets/pdfs/original/updated-2026-11-10/`：当前发布来源，仅本地保存，不提交 Git
- `assets/pdfs/original/previous-2026-11-10/`：更新前备份，保留且不覆盖

## 部署

仓库为纯静态文件，可直接从仓库根目录发布到 GitHub Pages。所有资源均使用相对路径，兼容 `https://hao502hao.github.io/portfolio/` 这类子路径地址。

网页标题、描述和 PDF 发布副本元数据不包含作者姓名。公开静态网站无法从技术上彻底阻止访客保存浏览器已经接收的资源，因此本项目移除明显下载入口，但不承诺防复制或防截图。

## 第三方组件

- PDF.js 6.5.438，Apache-2.0 License
- Tailwind CSS 4.x，MIT License（仅用于构建静态 CSS）

