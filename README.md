# MDUI 主题 - Discuz! X5.0 移动端发帖页面优化

这是 Discuz! X5.0 MDUI Material Design 主题的移动端发帖页面（post_forumselect.htm）优化版本。

## 功能特批

✨ **布局优化**
- 左侧分区导航栏 + 右侧版块列表的二栏布局
- 响应式设计，适配各种移动设备屏幕
- 分区导航栏 sticky 定位，方便快速切换

🎯 **交互改进**
- 点击版块行直接跳转到发帖页面（`forum.php?mod=post&action=newthread&fid=XXX`）
- 无需点击"发新帖"按钮，简化操作流程
- 点击箭头展开/收起子版块，不触发页面跳转
- 支持一次只展开一个版块的子版块列表

📱 **子版块布局**
- 每行两个子版块卡片，网格布局
- 移除了原有的"子版块"文字标签
- 支持版块图标显示（从 forumfield 表读取）

🎨 **设计元素**
- Material Design 3 颜色系统（使用 MDUI CSS 变量）
- 点击涟漪效果（mdui-ripple）
- 箭头旋转动画，90° 转换）
- Active 状态背景色反馈

## 安装使用

将 `post_forumselect.htm` 复制到 Discuz! X5.0 的对应模板目录：

```bash
/template/MDUI/touch/forum/post_forumselect.htm
```

## 技术细节

### 核心交互函数

```javascript
// 跳转到发帖页面
function gotoPost(fid) {
  location.href = 'forum.php?mod=post&action=newthread&fid=' + fid + specialQuery;
}

// 展开子版块
function expandItem(item) {
  if (!item.subs) return;
  item.subs.hidden = false;
  if (item.arrow) item.arrow.classList.add('fs-open');
  expandedItem = item;
}

// 收起子版块
function collapseItem(item) {
  if (!item.subs) return;
  item.subs.hidden = true;
  if (item.arrow) item.arrow.classList.remove('fs-open');
  if (expandedItem === item) expandedItem = null;
}
```

### 事件绑定策略

- **版块行点击**：直接跳转发帖页面
- **箭头点击**：使用 `e.stopPropagation()` 阻止冒泡，只触发展开/收起
- **子版块卡片点击**：跳转对应子版块的发帖页面
- **分区按钮点击**：切换版块列表
- **分区双击**：跳转到分区页面

### CSS 类名说明

| 类名 | 说明 |
|------|------|
| `.fs-wrap` | 主容器，flex 布局 |
| `.fs-rail` | 左侧分区导航栏 |
| `.fs-group` | 分区按钮 |
| `.fs-group.fs-active` | 激活的分区按钮 |
| `.fs-main` | 右侧版块列表容器 |
| `.fs-item` | 版块项容器 |
| `.fs-row` | 版块行 |
| `.fs-row-icon` | 版块图标 |
| `.fs-row-name` | 版块名称 |
| `.fs-row-arrow` | 展开箭头 |
| `.fs-row-arrow.fs-open` | 打开状态的箭头 |
| `.fs-subs` | 子版块容器（grid 2 列） |
| `.fs-sub` | 子版块卡片 |
| `.fs-sub-name` | 子版块名称 |
| `.fs-empty` | 空状态提示 |

### 后端数据依赖

模板依赖以下后端变量和数据结构：

- `$grouplist`：分区列表
- `$commonlist`：常用版块列表
- `$forumlist`：各分区的版块列表
- `$subforumlist`：各版块的子版块列表
- `$special`：特殊查询参数（可选）
- `forumfield` 表：读取版块图标信息
- `$_G['cache']['forums']`：全局版块缓存

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- 移动浏览器（iOS Safari, Chrome Mobile）

## 许可证

MIT

## 作者

MeowcoQAQ