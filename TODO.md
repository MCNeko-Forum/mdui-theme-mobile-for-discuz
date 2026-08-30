# MDUI 手机版待办清单

以 [bygsjw\_sj](file:///d:/repos/bbs-app/LocalForumTest/template/bygsjw_sj/touch) 的模板文件为基准对比。
MDUI 没做的页面会自动回落到 Discuz 自带的 `template/default/touch`，功能能用但样式不统一。

`.bak` 备份文件不计入。

- √ MDUI 核心 CSS 和 JS 支持通过主题变量 `mdui_resource` 在本地、unpkg、jsDelivr、jsdmirror.com 和 jsdmirror.cn 之间切换，默认使用本地资源；旧值 `cdn` 兼容映射到 unpkg。
- √ `ahome_horn` 触屏发布页表情保留横向排列，清除黑点，并扩大为 2.75rem 点击区域、2rem 图片和 .25rem 间距以减少误触。
- √ 记录发布与各级回复直接复用日志 / 家园的 comcom 表情面板，点击后向当前输入框插入 `[em:N:]` 代码。
- √ “我的”页支持通过主题变量 `mdui_my_diy` 插入静态 MDUI 导航模块；变量为空时不显示。

` `  = 没写独立模板；`□ `  = 正在完成中，但用 JS 把 default 的表单转成 MDUI 组件后塞进 mdui-dialog。

不做广告部分。

## 公共

| 页面    | 文件                     |   已做   |
| ----- | ---------------------- | :----: |
| 页头    | `common/header`        |    √   |
| 页脚    | `common/footer`        |    √   |
| 提示信息页 | `common/showmessage`   |    √   |
| 导航菜单  | `common/header_nav`    | <br /> |
| 常见问题  | `common/faq`           |    √   |
| 购买邀请码 | `common/buyinvitecode` | <br /> |

## 论坛

| 页面         | 文件                                                            |   已做   |
| ---------- | ------------------------------------------------------------- | :----: |
| 论坛首页       | `forum/discuz`                                                |    √   |
| 版块帖子列表     | `forum/forumdisplay`                                          |    √   |
| 帖子内容页      | `forum/viewthread`                                            |    √   |
| 帖子列表片段     | `forum/forumdisplay_list`                                     | <br /> |
| 版块快速发帖     | `forum/forumdisplay_fastpost`                                 | <br /> |
| 版块密码       | `forum/forumdisplay_passwd`                                   |    √   |
| 版块付费       | `forum/forumdisplay_pay`                                      | <br /> |
| 发帖 / 编辑    | `forum/post`（`post_editor_attribute`、`post_editor_extra` 已内联） |    √   |
- √ 发主题保存草稿（按用户组权限显示）及“我的主题”草稿标签页 | `forum/post` / `home/space_thread` | √ |
| 发帖-投票      | `forum/post_poll`                                             |    √   |
| 发帖-活动      | `forum/post_activity`                                         |    √   |
| 发帖-辩论      | `forum/post_debate`                                           |    √   |
| 发帖-悬赏      | `forum/post_reward`                                           |    √   |
| 发帖-商品      | `forum/post_trade`                                            |    √   |
| 发帖-分类信息    | `forum/post_sortoption`                                       |    √   |
| 帖子内容-楼层列表  | `forum/viewthread_list`                                       | <br /> |
| 帖子内容-楼层节点  | `forum/viewthread_node`                                       | <br /> |
| 帖子内容-投票    | `forum/viewthread_poll`                                       |    √   |
| 帖子内容-投票人列表 | `forum/viewthread_poll_voter`                                 |    √   |
| 帖子内容-活动    | `forum/viewthread_activity`                                   |    √   |
| 帖子内容-辩论    | `forum/viewthread_debate`                                     |    √   |
| 帖子内容-悬赏    | `forum/viewthread_reward`                                     |    √   |
| 帖子内容-商品    | `forum/viewthread_trade`                                      |    √   |
| 帖子内容-付费  | `forum/viewthread_pay`                                        |    √   |
| 主题评价（评分）   | `forum/rate` / `rate_view`                                    |    √   |
| 帖子管理       | `forum/topicadmin` / `topicadmin_action`                      |    △   |
| 导读         | `forum/guide` / `guide_list_row`                              |    √   |
| 公告         | `forum/announcement`                                          |    √   |
| 附件付费       | `forum/attachpay`                                             | <br /> |
| 支付         | `forum/pay` / `pay_view`                                      | <br /> |
| 论坛代码（表情等）  | `forum/discuzcode`                                            | <br /> |
| 搜索-分类信息选项  | `forum/search_sortoption`                                     | <br /> |

### 版块帖子列表功能

- √ 已补齐版块图标、排名、收藏入口、版主信息、子版块统计、作者空间入口、特殊主题和图片主题标识。
- √ 版规（`$_G['forum']['rules']`）已用 `mdui-collapse` 折叠展示，只在第一页出现。
- √ 版块通用筛选已改为独立 `mdui-dialog` 弹窗，排序方式、发表时间、主题分类、主题类型、精华、推荐可同时组合筛选，另附重置与热帖独立入口。
- √ 已补齐普通主题分类与分类信息类型入口，并兼容分类信息列表模式输出。
- √ 分类信息快捷条件筛选已改为独立 `mdui-dialog` 弹窗，支持 text、number、calendar、checkbox、radio、select、range 多类型条件同时组合筛选。
- √ 主题卡片已补悬赏/商品金额与「已解决」标签、推荐（点赞）数，回复数改用含点评的 `allreplies`。
- √ 图片模式（版块后台开启 picstyle）已做双列封面卡片流，并提供图片/列表模式切换入口。
- □ 分类信息的链接式快捷筛选（后台勾选「字体搜索」）尚未提供 MDUI 呈现，目前只覆盖表单式。
- □ 悬赏筛选的 `rewardtype`（进行中/已结束）细分条件尚未加入筛选弹窗。
- □ 主题归档（`$forumarchive`）切换入口未做，bygsjw\_sj 移动端同样没有，仅 default PC 版提供。
- □ `forum/forumdisplay_fastpost` 和 `forum/forumdisplay_pay` 仍缺少 MDUI 独立模板。

### 发帖 / 编辑页功能（`forum/post`）

- √ 三角色表单（newthread / reply / edit）共用一套 MDUI 布局。
- √ 发帖类型 tab（普通 / 投票 / 悬赏 / 辩论 / 活动 / 商品 / 插件主题），整页跳转换 `special`/`sortid`。
- √ 编辑器工具条：图片、附件、表情、插入 BBCode、附加选项。
- √ 图片 / 附件上传走 swfupload 接口，成功后插入 `[attachimg]`/`[attach]`，可删除（已入库的走后端删库）。
- √ 插入面板：URL、图片、音频、视频、引用、代码、隐藏、免费内容。
- √ 附加选项折叠面板：匿名、倒序查看、屏蔽回复、签名等基础属性；文本特性；阅读权限；回帖奖励（含累进计算）；抢楼；售价；标签；定时发布。
- √ AJAX 提交，成功后携带 `tid`/`pid` 跳转看帖，失败回退原生提交。
- √ `post_editor_extra` 转接分类信息、辩论立场、特殊主题子模板。
- √ 六个专题子模板（`post_poll` / `post_activity` / `post_debate` / `post_reward` / `post_trade` / `post_sortoption`）已 MDUI 化并在浏览器逐个验证（special=1\~5 与分类信息版块）。
- √ 图片/附件删除按钮不再误触表单提交：删除按钮显式 `type="button"`、删除委托 `preventDefault()`、`post.htm` 加 form 级 `submit` 拦截兜底，已浏览器验证（误点不跳转、正常提交仍走 AJAX 成功）。
- √ 图片缩略图删除按钮改为图片内部左上角的小号圆形角标（20px、半透明深底、白图标、缩进 3px），图片内部下方叠加「点击插入图片」提示条。
- √ 发帖 / 编辑页全部 MDUI 下拉菜单限制为最多 50dvh / 22rem，高度超出时可上下滑动；分类信息动态原生下拉同时保留浏览器滚动选择。
- √ 发帖-版块选择（`post_forumselect`）已改为 MDUI 三列级联列表，支持常用版块、单击选择、双击进入版块和发帖跳转。

## 帖子内容页功能差距

逐段对照 bygsjw\_sj 的 `forum/viewthread_list.php` 盘出来的缺口。

`√` = 已做；`□` = 完成中；` `  = 未做。

| 功能                                                           | 参照位置                                  |  已做 |
| ------------------------------------------------------------ | ------------------------------------- | :-: |
| 举报（收在三点菜单里，radio 选理由 + 其他自填）                                 | default `viewthread_node.htm`         |  √  |
| 回帖三点菜单（删除 / 屏蔽 / 警告 / 置顶回复）                                  | `viewthread_list.php` 38-53           |  √  |
| 签名档（signature / globalsightml / 被禁提示）                        | `viewthread_list.php` 259-265         |  √  |
| 顶 / 踩（postreview）                                            | `viewthread_list.php` 289-292         |  √  |
| 打赏入口与最近 5 人（当前页 MDUI 弹窗，统一由 dialog 承担滚动，避免双滚动条）              | `viewthread_list.php` 222-240         |  √  |
| 只看该作者 / 查看全部                                                 | `viewthread_list.php` 397-401         |  √  |
| 不推荐（recommend subtract）与推荐计数                                 | `viewthread_list.php` 249-254         |  √  |
| 编辑权限补全（adminid 比较 + 编辑时限）                                    | default `viewthread_node.htm` 401     |  √  |
| 作者头衔（authortitle）                                            | `viewthread_list.php` 68-70           |  √  |
| 游客 IP 显示                                                     | `viewthread_list.php` 73              |  √  |
| 匿名帖版主可见真名                                                    | `viewthread_list.php` 75-79           |  √  |
| 置顶回复楼层图标 / postno                                            | `viewthread_list.php` 56-64           |  √  |
| 追加内容（postappend）                                             | default `viewthread_node.htm` 403-404 |  √  |
| 道具弹窗购买 / 使用                                                  | default `viewthread_node.htm` 422-424 |  √  |
| 相关推荐（relateitem 通用卡片）                                        | `viewthread_list.php` 327-392         |  √  |
| 分类信息表格（threadsortshow）                                       | `viewthread_list.php` 128-162         |  √  |
| 游客提示（guesttipsinthread）                                      | `viewthread_list.php` 166-179         |  √  |
| 滚动加载更多回帖                                                     | `viewthread.php` 73-113               |  √  |
| 滚动加载无限重复刷新修复（后端页码超出总页数会回退渲染末页、返回内容非空，改用总页数判断终止；单页帖子不再渲染加载模块） | `viewthread.htm`                      |  √  |
| 帖内广告位（DIY block）                                             | `viewthread_list.php` 320-325         |  不做 |

## 门户

| 页面   | 文件                                     |   已做   |
| ---- | -------------------------------------- | :----: |
| 门户首页 | `portal/index`                         |    √   |
| 文章列表 | `portal/list` / `list_list`            | <br /> |
| 文章内容 | `portal/view`                          | <br /> |
| 文章评论 | `portal/portal_comment` / `comment_li` | <br /> |
| 发表评论 | `portal/portalcp_comment`              | <br /> |

## 个人中心 / 家园

| 页面      | 文件                                                                    |  已做 |
| ------- | --------------------------------------------------------------------- | :-: |
| 个人资料页   | `home/space_profile`（`mycenter=1` 为“我的”卡片中心，普通 `do=profile` 保持空间资料布局） |  √  |
| 设置-页头   | `home/spacecp_header`                                                 |  √  |
| 设置-页脚   | `home/spacecp_footer`                                                 |  √  |
| 设置-资料   | `home/spacecp_profile`                                                |  √  |
| 设置-资料导航 | `home/spacecp_profile_nav`                                            |  √  |
| 设置-头像上传 | `home/spacecp_avatar`                                                 |  √  |
| 个人资料主体  | `home/space_profile_body`（已内联至 `space_profile`）                       |  √  |
| 个人主页菜单  | `home/space_menu`（已内联至 `space_profile`）                               |  √  |
| 我的主题    | `home/space_thread`                                                   |  √  |
| 我的收藏    | `home/space_favorite`                                                 |  √  |
| 我的好友    | `home/space_friend`                                                   |  √  |
| 我的日志    | `home/space_blog_list` / `space_blog_view`                            |  √  |

- □ 编辑日志的站点分类、个人分类、标签回填，以及新建个人分类的显隐需进行页面回归。
  \| 通知提醒 | `home/space_notice` | √ |
  \| 私信 | `home/space_pm` / `space_pm_node` | √ |
  \| 记录 | `home/space_doing` / `space_doing_form` / `space_doing_li` / `spacecp_doing` | √ |
| 访客记录 | `home/space_click` | |
  \| 留言板 / 评论片段 | `home/space_wall` / `space_comment_li` | √ |
  \| 打招呼 | `home/spacecp_poke`（已内联至个人资料页弹窗） | √ |
  \| 任务 | `home/space_task` / `space_task_list` / `space_task_detail` | |
  \| 动态 | `home/follow_feed` / `follow_feed_li` | |
  \| 设置-积分 | `home/spacecp_credit_base` / `credit_header` / `credit_log` | √ |
  \| 设置-隐私 | `home/spacecp_privacy` | |
  \| 设置-用户组 | `home/spacecp_usergroup` / `usergroup_header` | |
  \| 设置-推广 | `home/spacecp_promotion` | |
  \| 设置-收藏 | `home/spacecp_favorite` | √ |
  \| 设置-好友 | `home/spacecp_friend` | √ |
  \| 设置-关注 | `home/spacecp_follow` | |
  \| 设置-发私信 | `home/spacecp_pm` | √ |
  \| 设置-发日志 | `home/spacecp_blog` | |
  \| 设置-发评论 | `home/spacecp_comment` | |
  \| 设置-付款 | `home/spacecp_payment_pay` | |

## 道具

bygsjw\_sj 也没做，目前全走 default。入口 `home.php?mod=magic`，
三个 tab（道具中心 / 我的道具 / 使用记录）由 `space_magic` 按 `$action` 分发子模板。

| 页面                   | 文件                                 |   已做   |
| -------------------- | ---------------------------------- | :----: |
| 道具页外壳（含三 tab 导航）     | `home/space_magic`                 |    √   |
| 道具中心（购买列表，全量展示）      | `home/space_magic_shop`            |    √   |
| 道具购买确认               | `home/space_magic_shop_opreation`  |    √   |
| 我的道具（全量展示）           | `home/space_magic_mybox`           |    √   |
| 道具使用表单               | `home/space_magic_mybox_opreation` |    √   |
| 道具使用记录               | `home/space_magic_log`             |    √   |
| 道具操作弹窗（取消效果 / 退还红包等） | `home/spacecp_magic`               |    √   |

## 会员

| 页面   | 文件                 |   已做   |
| ---- | ------------------ | :----: |
| 登录   | `member/login`     |    √   |
| 注册   | `member/register`  |    √   |
| 找回密码 | `member/getpasswd` |    √   |

## 群组

| 页面        | 文件                                               |                               已做                               |
| --------- | ------------------------------------------------ | :------------------------------------------------------------: |
| 群组首页      | `group/index` / `group_index`                    |                                √                               |
| 群组内容      | `group/group` / `group_right`                    |                                √                               |
| 群组列表      | `group/group_list` / `type`                      |                                √                               |
| 我的群组      | `group/group_my`                                 |                                √                               |
| 推荐 / 关注群组 | `group/group_recommend` / `group_attentiongroup` |                                √                               |
| 创建群组      | `group/group_create`                             |                                √                               |
| 群组管理      | `group/group_manage`                             |                                √                               |
| 群组成员      | `group/group_memberlist`                         |                                √                               |
| 群组邀请      | `group/group_invite`                             | 不单独实现：当前 `forum_group.php` 的 action 白名单不含 invite，避免创建无法命中的独立模板 |

## 搜索

| 页面   | 文件                              |   已做   |
| ---- | ------------------------------- | :----: |
| 搜索入口 | `search/pubsearch`              |    √   |
| 搜索帖子 | `search/forum` / `thread_list`  |    √   |
| 搜索文章 | `search/portal` / `portal_list` |    √   |
| 搜索群组 | `search/group` / `group_list`   |    √   |

## 排行榜

| 页面 | 文件 | 已做 |
| --- | --- | :---: |
| 排行榜总览 | `ranklist/ranklist` | √ |
| 会员榜与成员列表 | `ranklist/member` / `member_list` | √ |
| 主题、日志、投票榜 | `ranklist/thread` / `blog` / `poll` | √ |
| 图片、活动、版块、群组榜 | `ranklist/picture` / `activity` / `forum` / `group` | √ |
| 榜单顶栏与时间筛选 | `ranklist/side_top` / `period` | √ |

## 标签

| 页面  | 文件                    |   已做   |
| --- | --------------------- | :----: |
| 标签页 | `tag/tag` / `tagitem` |    √   |

- √ 首页最新帖 DIY 信息流图片已修复：过滤 Discuz 无封面时注入的 `nophoto.gif`，有帖内图片时显示真实图片，无图片时不显示占位图。
- √ 首页命名 DIY 中所有论坛 / 群组主题数据源模块每次访问首页均调用 Discuz 原生 `block_updatecache(..., true)` 强制刷新；静态 HTML 与非帖子模块不受影响。
- √ 底部导航“发现”已改为“圈子”，新增 MDUI 圈子首页：参考 bygsjw\_sj 展示推荐圈子、圈子分类、子分类和最近更新圈子，复用 Discuz 原有数据与跳转。

## 数据层（php/）

bygsjw\_sj 把额外的取数逻辑放在 `touch/php/` 下，模板用 `<!--{eval include ...}-->` 引入。

| 用途       | 文件                                                   |   已做   |
| -------- | ---------------------------------------------------- | :----: |
| 门户首页数据   | `php/portal_index`                                   |    √   |
| 论坛首页数据   | `php/forum_discuz`                                   | <br /> |
| 版块页数据    | `php/forum_forumdisplay` / `forum_forumdisplay_list` | <br /> |
| 发帖版块选择数据 | `php/forum_post_forumselect`                         | <br /> |
| 文章列表数据   | `php/portal_list`                                    | <br /> |
| 页头数据     | `php/header` / `header_nav`                          | <br /> |
| 页脚链接     | `php/footer_url`                                     | <br /> |
| DIY 模块更新 | `php/block_update`                                   | <br /> |
| 公共函数     | `php/function_bygsjw`                                | <br /> |

