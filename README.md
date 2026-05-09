# 个人站模板 — Astro + Cloudflare Pages + 广告三件套

零成本建站 + 收广告费的一条龙模板。

## 技术栈

- **框架**: [Astro 4](https://astro.build) — 静态为先，零 JS 体积
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com) — 无限带宽，免费
- **广告**: Google AdSense + 联盟链接（京东/淘宝）
- **分析**: Cloudflare Web Analytics（免费无限制）
- **边缘中间件**: Workers 做防爬虫 / A/B测试 / 地理分流

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 构建预览（模拟 CF Pages 环境）
npm run preview
```

## 部署到 Cloudflare Pages

### 方式一：Wrangler CLI

```bash
# 登录（第一次需要）
npx wrangler login

# 部署
npm run deploy
```

### 方式二：GitHub 自动部署

1. 推送到 GitHub 仓库
2. Cloudflare Dashboard → Pages → Create a project → Connect Git
3. 选仓库，构建配置自动读取 `wrangler.toml`
4. 设自定义域名：Pages 后台 → Custom domains → 输入你的域名

### 方式三：直接上传

```bash
npm run build
npx wrangler pages deploy ./dist --project-name=personal-site
```

## 广告配置

### Google AdSense

1. 去 [AdSense](https://adsense.google.com) 注册账号
2. 审核通过后获取 `ca-pub-XXXXXXXXXXXXXX`
3. 替换模板中所有 `ca-pub-XXXXXXXXXXXXXX` 和 `ad-slot` 值
4. 隐私政策页（已内置）是 AdSense 审核必要条件

### 联盟链接（京东/淘宝）

1. 注册 [京东联盟](https://union.jd.com) / [淘宝客](https://pub.alimama.com)
2. 获取推广链接
3. 替换 `AffiliateLink` 组件的 `url` 参数

### Workers 广告优化

`workers/_worker.js` 自动：
- 识别爬虫并跳过广告渲染（节省展示成本）
- 按 IP 分 A/B 测试组
- 检测国内 IP 并标记

## 自定义

| 文件 | 作用 |
|---|---|
| `src/pages/` | 页面文件，按路径映射 |
| `src/pages/blog/` | 文章，每篇一个 .astro 文件 |
| `src/components/AdSense.astro` | 广告组件，可改广告格式 |
| `src/components/AffiliateLink.astro` | 联盟链接组件 |
| `src/layouts/BaseLayout.astro` | 全局布局 + 样式 |
| `workers/_worker.js` | 边缘中间件逻辑 |
| `astro.config.mjs` | Astro 配置 + 适配器 |
| `wrangler.toml` | CF Pages 项目配置 |

## 注意

- `.cn` 域名需要 ICP 备案，备案信息挂在国内 DNS 服务商
- 备案域名 + CF Pages = 国内用户延迟 200-300ms，免费代价
- AdSense 审核需要内容合规 + 隐私政策页面
- 域名绑定 CF Pages 不需要切换 NS，支持第三方 DNS
