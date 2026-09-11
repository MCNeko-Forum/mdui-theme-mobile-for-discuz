# 使用指南

## 安装步骤

### 1. 备份原文件

首先备份你的原始模板文件：

```bash
cp /www/wwwroot/new.ikunmc.com/template/MDUI/touch/forum/post_forumselect.htm \
   /www/wwwroot/new.ikunmc.com/template/MDUI/touch/forum/post_forumselect.htm.bak
```

### 2. 替换模板文件

将仓库中的 `post_forumselect.htm` 复制到你的 Discuz! 模板目录：

```bash
cp post_forumselect.htm /www/wwwroot/new.ikunmc.com/template/MDUI/touch/forum/
```

### 3. 清空 Discuz! 业面缓存

登录 Discuz! 后台，到 **全局** → **型号管理** → 点击对应型号，会可以看到清空缓存的选项。

或使用下面的方法直接删除业面缓存文件：

```bash
rm -rf /www/wwwroot/new.ikunmc.com/data/template/*/touch_forum_*.tmp.php
```

### 4. 刷新页面测试

访问发帖页面，验证修改是否有效。

## 功能测试清单

下图是应用此模板后的推荐测试清单：

✅ **布局测试**
- [ ] 左侧分区辅助栏正常显示
- [ ] 右侧版块列表正常显示
- [ ] 屏幕缩小时两栏正常伸缩
- [ ] 分区辅助栏 sticky 定位正常

✅ **交互测试**
- [ ] 点击版块行直接跳转发帖页面
- [ ] 点击箭头只展开/收起子版块，不跳转
- [ ] 子版块每行两个卡片显示
- [ ] 点击子版块卡片直接跳转发帖页面
- [ ] 切换分区后子版块展开状态重置
- [ ] 点击分区按钮正常切换版块列表
- [ ] 分区按钮双击跳转到分区页面

✅ **视觉测试**
- [ ] 版块图标正常显示
- [ ] 点击涟漪效果正常显示
- [ ] 箭头旋转动画正常
- [ ] 无"子版块"文字标签

## 故障排查

### 修改不生效

如果修改后页面仍旧是旧的样子，可以尝试：

1. **清空测试浏览器缓存**
   - 按 `Ctrl+Shift+Del` （Windows）或 `Cmd+Shift+Del` （Mac）
   - 选择"清空所有数据"

2. **清空 Discuz! 缓存**
   ```bash
   rm -rf /www/wwwroot/new.ikunmc.com/data/template/*
   ```

3. **检查模板文件是否正常**
   ```bash
   # 检查文件是否存在
   ls -la /www/wwwroot/new.ikunmc.com/template/MDUI/touch/forum/post_forumselect.htm
   
   # 检查文件流量
   wc -l /www/wwwroot/new.ikunmc.com/template/MDUI/touch/forum/post_forumselect.htm
   ```

### 版块不正常显示

如果版块列表阻是空的，检查是否是权限不足：

1. 确保用户有上转发帖的权限
2. 检查常用版块是否初始化（不是游客身份）

### 图标不显示

如果版块图标池不显示：

1. 检查 forumfield 表是否有版块图标数据
2. 检查图标 CDN 路径是否正常：
   ```
   /data/attachment/common/
   ```

## 技术支持

如有任何问题，请处联系我们。