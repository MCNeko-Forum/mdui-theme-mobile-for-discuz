// 外部图标字体加载器：失败自动重试，最多 10 次；成功后记录，之后页面不再重复探测
// 用法：<script src="icon-font-loader.js" data-css="https://fonts.googleapis.com/icon?family=Material+Icons&display=block"></script>
(function () {
	'use strict';
	var script = document.currentScript;
	var css = script && script.getAttribute('data-css');
	if (!css) {
		return;
	}
	var MAX = 10;
	var KEY = 'mdui_icon_font_ok';
	var tries = 0;
	var finished = false;
	var link = null;
	var timer = null;

	function store(value) {
		try {
			if (value === null) {
				localStorage.removeItem(KEY);
			} else {
				localStorage.setItem(KEY, value);
			}
		} catch (e) {}
	}

	function cached() {
		try {
			return localStorage.getItem(KEY) === css;
		} catch (e) {
			return false;
		}
	}

	function clearLink() {
		if (link && link.parentNode) {
			link.parentNode.removeChild(link);
		}
		link = null;
	}

	function succeed() {
		if (finished) {
			return;
		}
		finished = true;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		store(css);
	}

	function retry() {
		if (finished) {
			return;
		}
		clearLink();
		if (tries >= MAX) {
			// 第 10 次仍失败：停止请求，回退本地字体
			store(null);
			return;
		}
		timer = setTimeout(attempt, Math.min(tries * 1000, 5000));
	}

	// Google Fonts 的 CSS 与字体分属两个域名，CSS 能加载不代表字体可用，需要实际探测字体文件
	function probe(url) {
		if (!window.fetch || !window.Promise || url.indexOf('fonts.googleapis.com') === -1) {
			return Promise.resolve(true);
		}
		return fetch(url).then(function (res) {
			if (!res.ok) {
				throw new Error('icon css');
			}
			return res.text();
		}).then(function (text) {
			var m = text.match(/url\(\s*['"]?(https:\/\/[^'")]+)/);
			if (!m) {
				throw new Error('icon font');
			}
			return fetch(m[1]);
		}).then(function (res) {
			if (!res.ok) {
				throw new Error('icon font');
			}
			return true;
		});
	}

	function attach(url, onload, onerror) {
		link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = url;
		link.onload = onload;
		link.onerror = onerror;
		(document.head || document.getElementsByTagName('head')[0]).appendChild(link);
	}

	function attempt() {
		if (finished) {
			return;
		}
		tries++;
		var url = css;
		if (tries > 1) {
			url += (css.indexOf('?') > -1 ? '&' : '?') + 'retry=' + tries;
		}
		attach(url, function () {
			probe(url).then(succeed, retry);
		}, retry);
	}

	if (cached()) {
		// 之前成功过：直接引用，不再探测；本次加载失败才重新走重试流程
		attach(css, function () {
			finished = true;
		}, function () {
			store(null);
			finished = false;
			tries = 0;
			attempt();
		});
	} else {
		attempt();
	}
})();
