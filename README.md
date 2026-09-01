# MDUI Theme Mobile for Discuz

面向 Discuz! X5.0 的 MDUI 风格手机版主题，使用 MDUI 2.x Web Components 构建移动端论坛界面。

## 特性

- Material Design 风格的手机版论坛界面
- 支持 Discuz! X5.0 的论坛、门户、群组、个人中心和设置页面
- 支持发帖、回复、编辑、表情、图片和附件上传
- 支持投票、悬赏、辩论、活动、商品和分类信息主题
- 支持帖子图片、附件、隐藏内容、打赏、评论和回复操作
- 支持 MDUI 主题色、亮色/暗色模式和自定义字体
- 支持本地资源、unpkg、jsDelivr 和 jsdmirror CDN 资源模式
- 未覆盖的页面自动回落到 Discuz 默认手机版模板

## 环境要求

- Discuz! X5.0
- PHP 8.0 或更高版本
- UTF-8 字符集
- 支持现代 JavaScript 的移动端浏览器

## 安装

1. 将此仓库下载，上传到 Discuz 站点的 `template/` 目录，并将 `mdui-theme-mobile-for-discuz` 更名为 `MDUI`。
2. 将手机版主题设置为 `MDUI 手机版`。
3. 在后台更新缓存和模板缓存。
4. 打开手机版页面确认主题资源正常加载。

## 资源模式

主题默认使用本地 MDUI 资源。可在主题设置中选择以下资源模式：

- `local`：使用 `static/mdui.css` 和 `static/mdui.global.js`
- `unpkg` 或 `cdn`：使用 unpkg
- `jsdelivr`：使用 jsDelivr
- `jsdmirror_com`：使用 jsdmirror.com
- `jsdmirror_cn`：使用 jsdmirror.cn

生产环境建议优先使用本地资源，或根据站点网络环境选择稳定的 CDN。

## 开发

主题目录包含以下辅助命令：

```bash
npm install
npm run check
npm run sync
```

- `npm run check`：检查主题资源和文件引用
- `npm run sync`：同步 npm 依赖中的 MDUI 和 Material Icons 资源

## 目录说明

- `common/`：桌面版公共模板
- `forum/`：桌面版论坛模板
- `home/`：桌面版个人中心模板
- `touch/`：手机版模板
- `static/`：主题 CSS、JavaScript、图标和字体资源
- `discuz_style_default.xml`：Discuz 主题安装配置

## 兼容说明

主题主要针对 Discuz! X5.0 手机版进行适配。部分 Discuz 模块、第三方插件和自定义 DIY 页面仍可能使用默认模板或插件自身模板，具体显示效果取决于站点启用的功能和插件。

使用第三方插件时，请确认插件已经提供手机版钩子，并在升级主题或插件后清理 Discuz 模板缓存。

## 许可

本项目采用 MIT License，详见 [LICENSE](LICENSE)。

MDUI 和 Material Icons 是其各自项目的开源软件，相关版权归原作者所有。
