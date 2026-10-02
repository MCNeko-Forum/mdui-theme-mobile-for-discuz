// MDUI pjax：站内链接无刷新切换页面。
// 拦截同源 <a> 点击，fetch 目标页后只替换 #mdui_app 内容并重执行区内脚本；
// 目标页没有 #mdui_app（不属于/不兼容本模板）或命中排除清单时自动整页刷新；
// showmessage 跳转提示页跟随其 meta refresh。壳（抽屉/底栏/全局脚本）不重建，
// 事件委托对新内容天然生效，也不会重复绑定。
(function () {
	var app = document.getElementById('mdui_app');
	if (!app) return;

	// 状态敏感或操作类页面直接整页跳转
	var BLOCK = [
		/member\.php\?mod=logging&action=logout/, // 登出：需整页刷新清空登录态
		/admincp\.php/,
		/mod=(modcp|recyclebin|attachment)/, // 管理操作、回收站、附件下载
		/mod=(post|misc)(&|$)/, // 发帖/回帖/编辑（forum.php?mod=post）、表情等 misc 页，脚本重，整页加载最稳
		/mod=topicadmin/ // 管理操作由 viewthread 自己 fetch 进对话框，绝不能被 PJAX 抢走（否则跳进 XML 页）
	];

	// 顶部加载进度条
	var bar = document.createElement('div');
	bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;opacity:0;z-index:9999;pointer-events:none;background:rgb(var(--mdui-color-primary,#2B7ACD));transition:width .25s,opacity .3s';
	document.body.appendChild(bar);
	var barTimer;

	function progress(on) {
		clearTimeout(barTimer);
		if (on) {
			bar.style.opacity = '1';
			bar.style.width = '30%';
		} else {
			bar.style.width = '100%';
			barTimer = setTimeout(function () {
				bar.style.opacity = '0';
				bar.style.width = '0';
			}, 300);
		}
	}

	function tryNav(href) {
		if (!href || href.charAt(0) === '#' || /^(javascript|mailto|tel):/i.test(href)) return null;
		var url;
		try { url = new URL(href, location.href); } catch (e) { return null; }
		if (url.origin !== location.origin) return null;
		var p = url.pathname + url.search;
		for (var i = 0; i < BLOCK.length; i++) {
			if (BLOCK[i].test(p)) return null;
		}
		return url;
	}

	var seq = 0;

	function closeNavigationOverlays() {
		['mdui_drawer', 'mdui_post_sheet'].forEach(function (id) {
			var overlay = document.getElementById(id);
			if (overlay && overlay.open) overlay.open = false;
		});
	}

	function go(url, push, y) {
		closeNavigationOverlays();
		var my = ++seq;
		progress(true);
		// no-store：站点无 Cache-Control 头，禁掉启发式缓存，保证回帖/编辑后
		// 拿到的帖子页是最新渲染（hide 回帖可见等内容解锁）
		fetch(url, {credentials: 'same-origin', cache: 'no-store'}).then(function (r) {
			if (!r.ok) throw new Error(r.status);
			return r.text();
		}).then(function (text) {
			if (my !== seq) return; // 已被更新的导航覆盖，丢弃旧响应
			render(url, text, push, y);
		}).catch(function () {
			location.href = url; // 网络/服务错误，整页兜底
		}).finally(function () {
			if (my === seq) progress(false);
		});
	}

	function render(url, text, push, y) {
		var doc = new DOMParser().parseFromString(text, 'text/html');
		// Discuz showmessage 跳转提示页：跟随 meta refresh
		var meta = doc.querySelector('meta[http-equiv="refresh"]');
		if (meta) {
			var m = (meta.getAttribute('content') || '').match(/url=(.+)$/i);
			location.href = m ? m[1].trim().replace(/&amp;/g, '&') : url;
			return;
		}
		var next = doc.getElementById('mdui_app');
		if (!next) {
			location.href = url; // 不属于/不兼容模板 → 整页刷新
			return;
		}
		app.innerHTML = next.innerHTML;
		// 同步壳上会过期的部分：抽屉（头像/积分/登录态）与底栏红点（新私信/提醒）。
		// 抽屉监听都在 #mdui_drawer 元素与 document 委托上，换内容不影响；
		// 底栏只动红点不动整个导航，避免发布面板脚本持有的按钮引用失效。
		var liveDrawer = document.getElementById('mdui_drawer');
		var docDrawer = doc.getElementById('mdui_drawer');
		if (liveDrawer && docDrawer) liveDrawer.innerHTML = docDrawer.innerHTML;
		// 底栏：登录/注册/找回密码页 $nofooter=1 不渲染底栏，从这些页 PJAX 跳到普通页时
		// 当前壳缺底栏 → 按目标页补上占位 div 与底栏（反向即普通页跳登录页时保留底栏，不改）
		var liveNav = document.querySelector('mdui-navigation-bar');
		var docNav = doc.querySelector('mdui-navigation-bar');
		if (!liveNav && docNav) {
			var spacer = document.createElement('div');
			spacer.style.height = '80px';
			app.parentNode.insertBefore(spacer, app.nextSibling);
			app.parentNode.insertBefore(docNav.cloneNode(true), spacer.nextSibling);
			liveNav = app.parentNode.querySelector('mdui-navigation-bar');
		}
		// 底栏高亮跟随目标页（只改 value，不重建导航，避免发布面板脚本持有的按钮引用失效）
		if (liveNav && docNav && docNav.hasAttribute('value')) liveNav.setAttribute('value', docNav.getAttribute('value'));
		var liveBadge = document.querySelector('mdui-navigation-bar-item[value=my] mdui-badge');
		var docBadge = doc.querySelector('mdui-navigation-bar-item[value=my] mdui-badge');
		if (docBadge && !liveBadge) {
			liveBadge = document.createElement('mdui-badge');
			document.querySelector('mdui-navigation-bar-item[value=my]').appendChild(liveBadge);
		} else if (!docBadge && liveBadge) {
			liveBadge.remove();
		}
		// innerHTML 插入的 script 不会执行，重建节点触发；async=false 保持外链脚本按文档顺序执行
		app.querySelectorAll('script').forEach(function (old) {
			var s = document.createElement('script');
			for (var i = 0; i < old.attributes.length; i++) {
				s.setAttribute(old.attributes[i].name, old.attributes[i].value);
			}
			s.textContent = old.textContent;
			s.async = false;
			old.parentNode.replaceChild(s, old);
		});
		// 通知壳层/页面初始化逻辑重跑（头像懒加载、抽屉主题图标等），
		// 让跨页导航时这些「数据」同步刷新
		document.dispatchEvent(new CustomEvent('mduipjax:load', {detail: {url: url}}));
		document.title = doc.title;
		if (doc.body.id) document.body.id = doc.body.id;
		if (doc.body.className) document.body.className = doc.body.className;
		if (push) {
			// 离开前把滚动位置记在当前历史条目上，后退时恢复
			history.replaceState({mduiPjax: 1, y: window.scrollY}, '');
			history.pushState({mduiPjax: 1}, '', url);
			window.scrollTo(0, 0);
		} else {
			window.scrollTo(0, y || 0);
		}
	}

	// 站内导航统一入口（data-href 委托等也走这里）；不在可接管范围则整页跳转
	window.mduiNav = function (href) {
		var url = tryNav(href);
		if (!url) {
			location.href = href;
			return;
		}
		go(url.href, true);
	};

	// 从 composedPath（由内到外）里挑出最靠内的可接管链接：
	// - 原生 <a href>
	// - 带 href 的 MDUI 自定义组件（标签名含 "-"）：它把真实 <a> 渲染在 shadow root 内，
	//   事件冒到 document 时 target 被 retarget 成宿主元素，path 里也拿不到那个 <a>
	// 排除 SVG 的 <use>/<image href="#...">：它们不是自定义元素，不会被这里命中
	function pickLink(path, node) {
		for (var i = 0; i < path.length; i++) {
			var el = path[i];
			if (!el || !el.matches) continue;
			if (el.matches('a[href]')) return el;
			if (el.localName && el.localName.indexOf('-') !== -1 && el.hasAttribute && el.hasAttribute('href')) return el;
		}
		return node && node.closest ? node.closest('a[href]') : null;
	}

	document.addEventListener('click', function (e) {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		var path = e.composedPath ? e.composedPath() : [];
		var node = e.target;
		var dataLink = node && node.closest ? node.closest('[data-href]') : null;
		if (!dataLink) dataLink = path.find(function (item) {
			return item && item.matches && item.matches('[data-href]');
		});
		if (dataLink && dataLink.dataset.href) {
			// 被排除的 URL（topicadmin 管理操作等）不能整页跳走——这些元素有自己的
			// fetch/对话框逻辑，这里直接放行让它们接管
			if (!tryNav(dataLink.dataset.href)) return;
			e.preventDefault();
			mduiNav(dataLink.dataset.href);
			return;
		}
		var link = pickLink(path, node);
		if (!link) return;
		var href = link.getAttribute('href');
		if (link.target && link.target !== '_self') return;
		if (link.hasAttribute && link.hasAttribute('download')) return;
		// 只接管「页面主体 / 侧边栏 / 底栏」内的链接（发布面板、站外提示等浮层不接管）。
		// 用 e.target 而非 link 判断：link 可能是 shadow root 里的 <a>，
		// closest() 不跨 shadow 边界会恒为 null；而 e.target 已 retarget 成宿主元素
		if (!node || !node.closest || !node.closest('#mdui_app, mdui-navigation-drawer, mdui-navigation-bar')) return;
		var url = tryNav(href);
		if (!url) return;
		e.preventDefault();
		go(url.href, true);
	}, true);

	window.addEventListener('popstate', function (e) {
		if (!(e.state && e.state.mduiPjax)) return;
		go(location.href, false, e.state.y);
	});

	// bfcache 兜底：后退恢复的旧文档可能缺回帖后解锁的内容（hide 等），强制重载
	window.addEventListener('pageshow', function (e) {
		if (e.persisted) location.reload();
	});
})();
