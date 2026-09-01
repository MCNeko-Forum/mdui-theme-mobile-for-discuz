# MDUI 主题自定义变量

本文列出 MDUI 手机版主题当前实际读取的全部主题自定义变量。

## 配置位置

后台 → 界面 → 风格管理 → 编辑 MDUI 主题 → 自定义变量。

- 变量名不区分大小写，Discuz 会统一转换，但建议按本文的小写写法填写。
- 修改后如页面未立即更新，请在后台更新缓存；开发环境可删除 `data/template` 中对应的模板编译缓存。
- 未列出的 Discuz 内置基础字段（如 `styleimgdir`）通常不应随意修改。

## 变量一览

| 变量名                    | 用途                   | 默认值       |
| ---------------------- | -------------------- | --------- |
| `mdui_color`           | MDUI 主题主色            | `#2B7ACD` |
| `mdui_resource`        | MDUI 核心 CSS、JS 的加载来源 | `local`   |
| `mdui_my_diy`          | “我的”页底部的静态导航模块       | 空         |
| `mdui_addcss`          | 全站额外 CSS             | 空         |
| `mdui_head`            | 全站 `<head>` 自定义代码    | 空         |
| `mdui_footer`         | 全站 footer 自定义代码      | 空         |
| `mdui_fonts`          | 全站自定义字体 CSS 链接（每行一个） | 空         |
| `mdui_thread_autoload` | 主题帖页自动加载下一页          | 空（关闭）     |

***

## `mdui_color`：主题主色

控制 MDUI 的主色，并同步写入浏览器的 `theme-color`。

### 值格式

填写六位十六进制颜色值。

```text
#2B7ACD
```

### 示例

```text
变量名：mdui_color
变量值：#6750A4
```

### 注意

- 必须填写六位十六进制颜色值；不要填写 CSS 变量声明、RGB/HSL、颜色名称、分号或 `<style>` 标签。
- 空值时主题会回退为 `#2B7ACD`。

***

## `mdui_resource`：MDUI 核心资源来源

决定 MDUI `mdui.css` 与 `mdui.global.js` 从本地还是指定 CDN 加载。

### 可用值

| 变量值             | 资源来源                              |
| --------------- | --------------------------------- |
| `local`         | 主题本地 `template/MDUI/static`，默认且推荐 |
| `cdn`           | 兼容旧值，等同于 `unpkg`                  |
| `unpkg`         | `https://unpkg.com`               |
| `jsdelivr`      | `https://cdn.jsdelivr.net`        |
| `jsdmirror_com` | `https://cdn.jsdmirror.com`       |
| `jsdmirror_cn`  | `https://cdn.jsdmirror.cn`        |

所有外部 CDN 均固定使用 MDUI `2.1.5`，以匹配主题当前组件版本。

### 示例

使用本地资源：

```text
变量名：mdui_resource
变量值：local
```

使用 jsDelivr：

```text
变量名：mdui_resource
变量值：jsdelivr
```

使用 jsdmirror.cn：

```text
变量名：mdui_resource
变量值：jsdmirror_cn
```

### 注意

- 除以上值以外的任意值都会回退为本地资源。
- 图标字体、主题业务样式 `style.css`、Discuz 公共脚本始终从本地加载，不会随该变量切换。
- 生产环境优先使用 `local`；选择 CDN 前应确认客户端网络可访问对应域名。

***

## `mdui_my_diy`：“我的”页静态导航模块

在“我的”页的积分、任务、勋章、道具等导航项之后追加静态 HTML。变量为空时整个模块不渲染，不会留下空白。

### 值格式

填写合法的 MDUI/HTML 片段。推荐使用一个或多个 `mdui-list-item`。

### 单个入口示例

```html
<mdui-list-item icon="shopping_bag" data-href="home.php?mod=space&do=shop" rounded>
    我的商城
</mdui-list-item>
```

### 多个入口示例

```html
<mdui-list-item icon="event" data-href="plugin.php?id=example:event" rounded>
    活动中心
</mdui-list-item>
<mdui-list-item icon="redeem" data-href="plugin.php?id=example:exchange" rounded>
    兑换中心
</mdui-list-item>
```

### 与原导航分隔

在第一个入口前加入分割线：

```html
<mdui-divider style="margin:.5rem 0"></mdui-divider>
<mdui-list-item icon="shopping_bag" data-href="home.php?mod=space&do=shop" rounded>
    我的商城
</mdui-list-item>
```

只保留留白、不显示线：

```html
<div style="height:.5rem"></div>
<mdui-list-item icon="shopping_bag" data-href="home.php?mod=space&do=shop" rounded>
    我的商城
</mdui-list-item>
```

### 常用图标

可以修改 `icon` 属性，常用值包括：

| 图标值                   | 适用场景  |
| --------------------- | ----- |
| `shopping_bag`        | 商城、购买 |
| `event`               | 活动    |
| `redeem`              | 兑换    |
| `card_giftcard`       | 福利、礼包 |
| `storefront`          | 店铺    |
| `confirmation_number` | 卡券    |
| `extension`           | 插件功能  |
| `help`                | 帮助中心  |

### 注意

- `data-href` 使用站内链接时，主题会统一接管点击跳转；也可以直接写 `href`。
- 变量内容会原样输出，因此仅限可信任的管理员编辑，勿粘贴来源不明的脚本或 HTML。
- 不要再嵌套一层 `<mdui-list>`，因为插槽已经位于现有列表内部。

***

## `mdui_fonts`：全站自定义字体

每行填写一个字体 CSS 的完整 `http://` 或 `https://` 链接，主题会在所有手机版页面的 `<head>` 中自动生成对应的样式表引用；空行和非 HTTP(S) 内容会忽略。

示例：

```text
https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap
https://cdn.example.com/fonts/my-font.css
```

该变量仅负责加载字体文件；要将字体应用到页面，请在 `mdui_addcss` 中写相应的 `font-family` 规则。

## `mdui_head` / `mdui_footer`：全站自定义代码

`mdui_head` 的内容会原样输出到所有手机版页面的 `</head>` 前，`mdui_footer` 的内容会原样输出到公共页脚开始位置，适合放置可信任的全站 HTML、CSS 或 JavaScript 代码。

只允许管理员填写可信内容，不要粘贴来源不明的代码；如果只需要追加 CSS，请继续使用 `mdui_addcss`。

## `mdui_addcss`：全站额外 CSS

向 MDUI 手机端所有页面的 `<head>` 注入额外 CSS，适合少量主题微调。

### 值格式

直接填写 CSS 规则，不要添加 `<style>` 标签。

### 示例

将全局圆角调大：

```css
mdui-card {
    border-radius: 1.25rem;
}
```

隐藏某个自定义导航入口：

```css
.mdui-mycenter-list mdui-list-item[data-href="plugin.php?id=example:event"] {
    display: none;
}
```

### 注意

- 该变量会原样输出到页面内的 `<style>` 标签，只应填写 CSS。
- 不要填写 `<script>`、`<style>` 或不可信内容。
- 需要较大规模或长期维护的样式，应改写主题本地 `static/style.css`，不要堆积在该变量中。

***

## 主题基础字段（通常无需修改）

以下字段属于 Discuz 主题的基础配置，不是本主题新增功能变量：

| 字段             | 当前值                    | 说明               |
| -------------- | ---------------------- | ---------------- |
| `styleimgdir`  | `template/MDUI/static` | 主题静态资源目录         |
| `imgdir`       | `template/MDUI/static` | 主题图片目录           |
| `font`         | 系统字体栈                  | Discuz 样式基础字体设置  |
| `fontsize`     | `14px/1.5`             | Discuz 样式基础字号与行高 |
| `contentwidth` | `100%`                 | Discuz 样式基础内容宽度  |

