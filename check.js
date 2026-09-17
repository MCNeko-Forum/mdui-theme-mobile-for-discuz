// 模板自检：确认必需文件存在、Discuz 模板标签配对、引用的静态资源都已同步
// 跑法：node check.js

const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const root = __dirname;
let failed = 0;

function check(name, ok, detail) {
	if (!ok) {
		failed++;
		console.error(`FAIL ${name}${detail ? ': ' + detail : ''}`);
	}
}

// 1. 必需文件
const required = [
	'discuz_style_default.xml',
	'touch/common/header.htm',
	'touch/common/footer.htm',
	'touch/common/showmessage.htm',
	'touch/common/seccheck.htm',
	'touch/common/faq.htm',
	'touch/forum/discuz.htm',
	'touch/forum/forumdisplay.htm',
	'touch/forum/forumdisplay_passwd.htm',
	'touch/forum/announcement.htm',
	'touch/forum/viewthread.htm',
	'touch/forum/viewthread_pay.htm',
	'touch/tag/tag.htm',
	'touch/tag/tagitem.htm',
	'touch/portal/index.htm',
	'touch/php/portal_index.php',
	'touch/member/login.htm',
	'touch/member/register.htm',
	'touch/member/getpasswd.htm',
	'touch/home/space_profile.htm',
	'touch/home/space_wall.htm',
	'touch/home/space_comment_li.htm',
	'touch/home/space_thread.htm',
	'touch/home/space_friend.htm',
	'touch/home/space_favorite.htm',
	'touch/home/space_pm.htm',
	'touch/home/space_pm_node.htm',
	'touch/home/space_notice.htm',
	'touch/home/spacecp_friend.htm',
	'touch/home/spacecp_favorite.htm',
	'touch/home/spacecp_pm.htm',
	'touch/home/follow_feed.htm',
	'touch/home/follow_feed_li.htm',
	'touch/home/spacecp_header.htm',
	'touch/home/spacecp_footer.htm',
	'touch/home/spacecp_profile.htm',
	'touch/home/spacecp_profile_nav.htm',
	'touch/home/spacecp_avatar.htm',
	'touch/home/spacecp_credit_base.htm',
	'touch/ranklist/ranklist.htm',
	'touch/ranklist/member.htm',
	'touch/ranklist/member_list.htm',
	'touch/ranklist/thread.htm',
	'touch/ranklist/blog.htm',
	'touch/ranklist/poll.htm',
	'touch/ranklist/picture.htm',
	'touch/ranklist/activity.htm',
	'touch/ranklist/forum.htm',
	'touch/ranklist/group.htm',
	'touch/ranklist/side_top.htm',
	'touch/ranklist/period.htm',
	// 帖子图片查看器的跨域下载中转，随主题一起部署
	'imgdl.php',
	'static/style.css',
	'static/mdui.css',
	'static/mdui.global.js',
	'static/icons/material-icons.css',
	'static/icons/material-icons.woff2',
];
for (const f of required) {
	check(`文件存在 ${f}`, existsSync(join(root, f)));
}

// 2. 模板标签配对：if/loop 必须闭合
const templates = required.filter((f) => f.endsWith('.htm'));
for (const f of templates) {
	if (!existsSync(join(root, f))) continue;
	const src = readFileSync(join(root, f), 'utf8');
	for (const tag of ['if', 'loop']) {
		// {if} 和 {elseif} 都不算闭合，只有 {/if} 算
		const open = (src.match(new RegExp(`<!--\\{${tag}\\s`, 'g')) || []).length;
		const close = (src.match(new RegExp(`<!--\\{/${tag}\\}-->`, 'g')) || []).length;
		check(`${f} 的 ${tag} 配对`, open === close, `${open} 个开始 / ${close} 个结束`);
	}
}

// 3. 模板里引用的 styleimgdir 资源必须真实存在
const xml = readFileSync(join(root, 'discuz_style_default.xml'), 'utf8');
const dir = xml.match(/<item id="styleimgdir"><!\[CDATA\[(.*?)\]\]><\/item>/)?.[1];
check('xml 里有 styleimgdir', !!dir, dir);
check('styleimgdir 指向本模板 static', dir === 'template/MDUI/static', dir);

// 4. header 引用的文件名必须和 sync-assets.js 同步的一致
const header = readFileSync(join(root, 'touch/common/header.htm'), 'utf8');
for (const asset of ['mdui.css', 'mdui.global.js', 'icons/material-icons.css', 'style.css']) {
	check(`header 引用了 ${asset}`, header.includes(asset));
}

// 5. footer 必须有 Discuz 要求的收尾调用
const footer = readFileSync(join(root, 'touch/common/footer.htm'), 'utf8');
check('footer 有 updatesession()', footer.includes('updatesession()'));
check('footer 有 output()', footer.includes('output()'));

// 6. 引用了 common/header 的页面模板必须也引用 common/footer，否则页面被截断（不输出 </html>）
for (const f of templates) {
	if (!existsSync(join(root, f))) continue;
	const src = readFileSync(join(root, f), 'utf8');
	if (!src.includes('<!--{template common/header}-->')) continue;
	check(`${f} 引用了 common/footer`, src.includes('<!--{template common/footer}-->'));
}

// 7. header 里绑定的 id 必须在页面模板中存在
check(
	'#mdui_menu_btn 有页面产生',
	templates.some((f) => existsSync(join(root, f)) && readFileSync(join(root, f), 'utf8').includes('id="mdui_menu_btn"'))
);

// 8. mdui-tab 没有 href 属性（只有 value），跳转必须走 footer 里的 data-href 委托
for (const f of templates) {
	if (!existsSync(join(root, f))) continue;
	const src = readFileSync(join(root, f), 'utf8');
	const bad = src.match(/<mdui-tab\s[^>]*\shref=/g);
	check(`${f} 的 mdui-tab 用 data-href 而非 href`, !bad, bad ? `${bad.length} 处` : '');
}
check('footer 有 data-href 跳转委托', footer.includes("closest('[data-href]')"));

// 9. space_profile 的 mycenter 卡片与普通资料页分支必须独立，且“我的空间”回到普通 profile
const profile = readFileSync(join(root, 'touch/home/space_profile.htm'), 'utf8');
check('space_profile 有 mycenter 分支', profile.includes("<!--{if $_GET['mycenter']}-->") && profile.includes('<!--{/if}-->'));
check('我的空间链接普通 profile', profile.includes('href="home.php?mod=space&do=profile"'));

// 10. {lang xx} 只能取到「模板所在目录 + touch + 根」三处语言文件的键（见 class_template.php languagevar()）
//    跨目录引用（比如 portal 模板用 forum 的键）会渲染成 !key!
function langkeys(file) {
	const path = join(root, '../../source/i18n/SC_UTF8', file);
	if (!existsSync(path)) return [];
	return [...readFileSync(path, 'utf8').matchAll(/^\s*'([\w]+)'\s*=>/gm)].map((m) => m[1]);
}
const rootkeys = langkeys('lang_template.php');
const touchkeys = langkeys('touch/lang_template.php');
for (const f of templates) {
	if (!existsSync(join(root, f))) continue;
	// touch/xxx/yyy.htm -> xxx；common 目录取根语言文件
	const seg = f.split('/')[1];
	const allowed = new Set([...rootkeys, ...touchkeys, ...(seg === 'common' ? [] : langkeys(`${seg}/lang_template.php`))]);
	const used = [...readFileSync(join(root, f), 'utf8').matchAll(/\{lang\s+([\w:]+)\}/g)].map((m) => m[1]);
	const miss = [...new Set(used)].filter((k) => !k.includes(':') && !allowed.has(k));
	check(`${f} 的 {lang} 键在可见语言文件内`, miss.length === 0, miss.join(' '));
}

// 11. 通知页的「分类菜单入口」开关必须前后端同名：notice.php 用它跳过读列表与清未读，
//     space_notice.htm 用它切换菜单/列表两个分支；任一侧改名都会让徽标静默归零
const noticePhpBack = '../../source/app/home/child/space/notice.php';
const noticeHtmBack = 'touch/home/space_notice.htm';
if (existsSync(join(root, noticePhpBack)) && existsSync(join(root, noticeHtmBack))) {
	const phpSrc = readFileSync(join(root, noticePhpBack), 'utf8');
	const htmSrc = readFileSync(join(root, noticeHtmBack), 'utf8');
	check('notice.php 定义 $notice_menu 开关', /\$notice_menu\s*=/.test(phpSrc));
	check('space_notice 用 $notice_menu 切换菜单分支', htmSrc.includes('<!--{if $notice_menu}-->'));
	// 菜单分支必须排在读列表逻辑之前，否则进菜单仍会清空未读
	const guardAt = phpSrc.indexOf('$notice_menu');
	const listAt = phpSrc.indexOf('fetch_all_by_uid');
	check('notice.php 的开关早于列表查询', guardAt !== -1 && listAt !== -1 && guardAt < listAt);

	// 有未读时把 chevron 换成红点：必须用 variant="small"（内置 .375rem 圆点），
	// 默认的 large 变体带 min-width:1rem，会在列表项里撑出一块空位
	const dots = [...htmSrc.matchAll(/<!--\{if ([^}]*?)\}--><mdui-badge slot="end-icon" variant="small">/g)].map((m) => m[1]);
	check('未读红点用 variant="small" 且受未读计数控制', dots.length === 2 && dots.some((c) => c.includes('newpm')) && dots.some((c) => c.includes('category_num')), `命中 ${dots.length} 处`);
	check('未读红点没有自定义 CSS 兜底', !htmSrc.includes('mdui-notice-dot'));
}

// 12. 私信页的标签页必须是「我的消息 / 公共消息」（用户明确要求），且只在列表页出现——
//    用户在会话页明确不要标签页，会话/详情页进来时 $filter 已被模板兜底成空串，不进 tab 分支。
//    公共消息由 pm.php 的 filter=announcepm 产出 $grouppms/$gpmstatus，单条详情走 subop=viewg
const pmHtmBack = 'touch/home/space_pm.htm';
if (existsSync(join(root, pmHtmBack))) {
	const pmSrc = readFileSync(join(root, pmHtmBack), 'utf8');
	const tabHrefs = [...pmSrc.matchAll(/<mdui-tab\s+value="(\w+)"\s+data-href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
	check('space_pm 恰好两个标签页', tabHrefs.length === 2, `命中 ${tabHrefs.length} 个`);
	check('space_pm 标签页是 privatepm / announcepm', tabHrefs.map((t) => t[0]).join(',') === 'privatepm,announcepm');
	check('space_pm 公共消息 tab 带 filter=announcepm', (tabHrefs.find((t) => t[0] === 'announcepm') || [])[1] === 'home.php?mod=space&do=pm&filter=announcepm');

	// 整个 mdui-tabs 段落必须被 filter 守卫包住，否则会话页也会顶出标签页
	check('space_pm 标签页受 filter 守卫控制', /<!--\{if in_array\(\$filter, array\('privatepm', 'announcepm'\)\)\}-->[\s\S]*?<mdui-tabs[\s\S]*?<\/mdui-tabs>\s*<!--\{\/if\}-->/.test(pmSrc));
	check('space_pm 模板把空 $filter 兜底成空串', pmSrc.includes("<!--{eval $filter = empty($filter) ? '' : $filter;}-->"));

	// 外层守卫必须接纳 announcepm 与 viewg，否则公共消息直接掉到 user_mobile_pm_error
	check('space_pm 外层守卫接纳 announcepm/viewg', /in_array\(\$filter, array\('privatepm', 'announcepm'\)\) \|\| in_array\(\$_GET\['subop'\], array\('view', 'viewg'\)\)/.test(pmSrc));
	check('space_pm 渲染公共消息列表', pmSrc.includes('<!--{loop $grouppms $grouppm}-->') && pmSrc.includes('subop=viewg&pmid=$grouppm[id]'));

	// 回复框的表情面板：私信消息由 UCenter 的 uccode 渲染（只认 [img]，不认 [em:N:]），
	// 所以必须用论坛表情面板（插原码，发送时由 spacecp/pm.php 转 [img]），不能复用 comcom 面板
	check('space_pm 回复框挂论坛表情面板', pmSrc.includes("mduiPmSmile('replymessage')") && pmSrc.includes('<!--{template home/space_pm_smiley}-->'));
	check('space_pm 没混入 comcom 面板', !pmSrc.includes('space_doing_smiley') && !pmSrc.includes('mduiDoingSmile'));
}

const pmcpHtmBack = 'touch/home/spacecp_pm.htm';
if (existsSync(join(root, pmcpHtmBack))) {
	const pmcpSrc = readFileSync(join(root, pmcpHtmBack), 'utf8');
	check('spacecp_pm 编辑框挂论坛表情面板', pmcpSrc.includes("mduiPmSmile('sendmessage')") && pmcpSrc.includes('<!--{template home/space_pm_smiley}-->'));
}

// 13. 私信表情面板必须是论坛表情（smilies_type / smilies_array），插入表情原码；
//    私信渲染走 uccode，不认 [em:N:]，所以这里绝不能出现 comcom / [em:N:] 的痕迹
const pmSmileyBack = 'touch/home/space_pm_smiley.htm';
if (existsSync(join(root, pmSmileyBack))) {
	const pmSmileySrc = readFileSync(join(root, pmSmileyBack), 'utf8');
	check('私信表情面板加载论坛表情数据', pmSmileySrc.includes('common_smilies_var.js'));
	check('私信表情面板遍历 smilies_type/smilies_array', pmSmileySrc.includes('smilies_type') && pmSmileySrc.includes('smilies_array'));
	check('私信表情面板插入表情原码', pmSmileySrc.includes('data-code="\' + sm[1]') && pmSmileySrc.includes('target.value += code'));
	check('私信表情面板不掺 comcom / [em:N:]', !pmSmileySrc.includes('image/smiley/comcom') && !pmSmileySrc.includes('[em:'));
}

// 14. 日志 / 记录仍用 comcom 面板，插入 [em:N:]（走 bbcode，能解析）
const smileyBack = 'touch/home/space_doing_smiley.htm';
if (existsSync(join(root, smileyBack))) {
	const smileySrc = readFileSync(join(root, smileyBack), 'utf8');
	check('日志表情面板仍插 [em:N:]', smileySrc.includes("data-face=\"[em:' + index + ':]\"") && smileySrc.includes('comcom'));
}

console.log(failed === 0 ? 'OK 全部通过' : `${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
