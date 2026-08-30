<?php

/**
 * MDUI 手机版门户首页数据层
 *
 * 数据获取方式模仿 bygsjw_sj：优先读 Discuz 原生 DIY 模块（block），
 * 后台没配 DIY 时回落到论坛帖子，保证空站也有内容可看。
 *
 * 产出变量：
 *   $mdui_slide    幻灯片条目
 *   $mdui_headline 头条条目
 *   $mdui_tabs     array('newthread'=>..., 'hot'=>..., 'digest'=>...) 选项卡三组
 *   $mdui_feed     信息流条目，额外带 images（帖内前三张图）
 *   $mdui_an       论坛公告
 *   $mdui_nav      快捷导航的 HTML 原文
 *   $mdui_entry    宫格入口的 HTML 原文
 * 每组元素统一为 array('url','title','pic','author','authorid','dateline','views','replies','tid')，
 * 模板层不必区分数据来自 block 还是论坛。
 */

if (!defined('IN_DISCUZ')) {
	exit('Access Denied');
}

// 按模块名找 DIY 模块。后台「专题管理 → DIY」里新建模块时，把「模块名称」填成下面的值即可接管对应位置。
// common_block 里能自定义的标识只有 name 和 classname，blockclass 是系统按 block 类目录自动生成的固定值
//（portal_article / forum_thread 等），后台改不了，所以只能认 name
$mdui_blocknames = array(
	'slide' => 'MDUI手机版幻灯片',
	'headline' => 'MDUI手机版头条',
	'newreply' => 'MDUI手机版最新回复',
	'hot' => 'MDUI手机版热帖',
	'digest' => 'MDUI手机版精华帖子',
	'feed' => 'MDUI手机版最新',
	'nav' => 'MDUI手机版首页导航',
	'entry' => 'MDUI手机版宫格入口',
);
$mdui_blocks = array();
// HTML 类模块（自定义HTML）的渲染结果官方在保存时就写进了 summary（function_block.php:263），
// 不走 itemlist，所以这里把 summary 一并取出来直接用
$mdui_nav = $mdui_entry = '';
foreach (C::t('common_block')->fetch_all_by_where('WHERE b.name IN (' . dimplode($mdui_blocknames) . ')', 0, 0, '', ',b.summary') as $block) {
	$key = array_search($block['name'], $mdui_blocknames);
	if ($key !== false && empty($mdui_blocks[$key])) {
		$mdui_blocks[$key] = $block['bid'];
		if ($key == 'nav') {
			$mdui_nav = $block['summary'];
		} elseif ($key == 'entry') {
			$mdui_entry = $block['summary'];
		}
	}
}
if ($mdui_blocks) {
	include_once libfile('function/block');
	// 先载入模块到 $_G['block']，后续才能调用 Discuz 原生强制更新函数。
	block_get_batch(array_values(array_diff_key($mdui_blocks, array('nav' => 1, 'entry' => 1))));
	// 首页所有使用论坛帖子数据源的 DIY 模块每次访问都即时更新；静态 HTML 和非帖子模块保持原缓存策略。
	foreach ($mdui_blocks as $bid) {
		if (in_array($_G['block'][$bid]['blockclass'], array('forum_thread', 'group_thread'))) {
			block_updatecache($bid, true);
		}
	}
}

// block 条目 → 统一结构。fields 里带作者和统计，是 DIY 模块存扩展字段的地方
function mdui_block_items($bid) {
	global $_G;
	if (!$bid || empty($_G['block'][$bid]['itemlist'])) {
		return array();
	}
	$list = array();
	foreach ($_G['block'][$bid]['itemlist'] as $item) {
		$fields = $item['fields'] ? dunserialize($item['fields']) : array();
		$pic = '';
		// 原生 forum_thread DIY 模块没有封面时会填充 nophoto.gif，MDUI 信息流无图时不显示默认图
		if ($item['pic'] && $item['pic'] != STATICURL . 'image/common/nophoto.gif') {
			// picflag 1=本地附件 2=远程附件 其它=完整 URL
			$path = $item['makethumb'] == 1 && $item['thumbpath'] ? $item['thumbpath'] : $item['pic'];
			if ($item['picflag'] == 1) {
				$pic = $_G['setting']['attachurl'] . $path;
			} elseif ($item['picflag'] == 2) {
				$pic = $_G['setting']['ftp']['attachurl'] . $path;
			} else {
				$pic = $item['pic'];
			}
		}
		$uid = !empty($fields['authorid']) ? $fields['authorid'] : intval($fields['uid']);
		$list[] = array(
			'url' => $item['url'],
			'title' => $item['title'],
			'pic' => $pic,
			'author' => !empty($fields['author']) ? $fields['author'] : $fields['username'],
			'authorid' => $uid,
			'dateline' => empty($fields['dateline']) ? '' : dgmdate($fields['dateline'], 'u'),
			'views' => isset($fields['views']) ? $fields['views'] : $fields['viewnum'],
			'replies' => isset($fields['replies']) ? $fields['replies'] : $fields['commentnum'],
			// DIY 帖子模块的 tid 可能在 fields 或 item 中，统一保留以便补帖内附件图。
			'tid' => !empty($fields['tid']) ? intval($fields['tid']) : ($item['idtype'] == 'tid' ? intval($item['id']) : intval($item['tid'])), 
		);
	}
	return $list;
}

// 论坛帖子 → 同一结构。走原生 fetch_all_for_guide，和首页四格同一个数据源
function mdui_thread_items($type, $limit = 10) {
	global $_G;
	$list = array();
	$heats = $type == 'hot' ? 1 : 0;
	foreach (C::t('forum_thread')->fetch_all_for_guide($type, 0, array(), $heats, 0, 0, $limit) as $thread) {
		$list[] = array(
			'url' => 'forum.php?mod=viewthread&tid=' . $thread['tid'],
			'title' => $thread['subject'],
			'pic' => '',
			'author' => $thread['author'],
			'authorid' => $thread['authorid'],
			'dateline' => dgmdate($thread['dateline'], 'u'),
			'views' => $thread['views'],
			'replies' => $thread['replies'],
			'tid' => $thread['tid'],
		);
	}
	return $list;
}

$mdui_slide = mdui_block_items($mdui_blocks['slide']);
$mdui_headline = mdui_block_items($mdui_blocks['headline']);

$mdui_tabs = array();
foreach (array('newthread' => 'newreply', 'hot' => 'hot', 'digest' => 'digest') as $type => $key) {
	$items = mdui_block_items($mdui_blocks[$key]);
	$mdui_tabs[$type] = $items ? $items : mdui_thread_items($type);
}

$mdui_feed = mdui_block_items($mdui_blocks['feed']);
if (!$mdui_feed) {
	$mdui_feed = mdui_thread_items('newthread', 20);
}

// 信息流配图，每帖取前三张（block 条目自带 pic 的走 pic，不进这里）。
// forum_threadimage 只有 tid/attachment/remote 三列且每帖只存一张封面，取不到前三张也拿不到 aid，
// 所以直接读附件表。附件按 tid 末位分了 10 张表，同一末位的 tid 归一组批量查，最多 10 次查询
$mdui_feedtids = array();
foreach ($mdui_feed as $item) {
	if (!empty($item['tid']) && empty($item['pic'])) {
		$mdui_feedtids[getattachtableid($item['tid'])][] = $item['tid'];
	}
}
$mdui_feedimages = array();
foreach ($mdui_feedtids as $tableid => $tids) {
	foreach (C::t('forum_attachment_n')->fetch_all_by_id($tableid, 'tid', $tids, 'aid', 1) as $image) {
		if (count($mdui_feedimages[$image['tid']] ?? array()) < 3) {
			$mdui_feedimages[$image['tid']][] = $image['remote']
				? $_G['setting']['ftp']['attachurl'] . 'forum/' . $image['attachment']
				: getforumimg($image['aid'], 0, 300, 300);
		}
	}
}
foreach ($mdui_feed as $key => $item) {
	if (!empty($item['tid']) && !empty($mdui_feedimages[$item['tid']])) {
		$mdui_feed[$key]['images'] = $mdui_feedimages[$item['tid']];
	}
}

// 公告：缓存已按日期过滤过，直接用
loadcache('announcements');
$mdui_an = empty($_G['setting']['announcements']) ? array() : $_G['setting']['announcements'];

// {lang xx} 在门户模板下只认 portal/ + touch/ + 根三个语言文件，
// 帖子相关文案都在 forum/ 里，取出来给模板用
$mdui_l = lang('forum/template');
