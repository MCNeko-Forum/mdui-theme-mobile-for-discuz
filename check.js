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
	const path = join(root, '../../source/language', file);
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

console.log(failed === 0 ? 'OK 全部通过' : `${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
