(function () {
	// 自实现线性滚动动画：scrollIntoView({behavior:'smooth'}) 由浏览器决定时长与
	// 缓动（各浏览器不一致，常见 ~300-500ms 的 ease-in-out），观感发"猛"；这里用
	// rAF + 匀速插值，约 600ms 直线滑到位，观感丝滑
	var DURATION = 600;

	function getTarget(hash) {
		if (!hash) return null;
		return document.getElementById(decodeURIComponent(hash.slice(1)));
	}

	var animId = 0;
	function smoothScrollTo(targetY) {
		var startY = window.pageYOffset;
		var dist = targetY - startY;
		if (Math.abs(dist) < 1) return;
		var start = null;
		var id = ++animId;
		function step(ts) {
			// 新动画接管后本帧作废（连续点击锚点时不打架）
			if (id !== animId) return;
			if (start === null) start = ts;
			var p = Math.min((ts - start) / DURATION, 1);
			// 线性插值：匀速滑动，无加减速突兀感
			window.scrollTo(0, startY + dist * p);
			if (p < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function scrollToHash() {
		var target = getTarget(location.hash);
		if (!target) return;
		// 目标位置 = 元素顶 - 一点呼吸空间
		var rect = target.getBoundingClientRect();
		smoothScrollTo(window.pageYOffset + rect.top - 8);
	}

	document.addEventListener('click', function (event) {
		var link = event.target.closest && event.target.closest('a[href*="#"],mdui-button[href*="#"],mdui-button-icon[href*="#"]');
		if (!link && event.composedPath) {
			link = event.composedPath().find(function (node) {
				return node && node.matches && node.matches('a[href*="#"],mdui-button[href*="#"],mdui-button-icon[href*="#"]');
			});
		}
		if (!link) return;
		var href = link.getAttribute('href');
		if (!href || href.charAt(0) !== '#') return;
		var target = getTarget(href);
		if (!target) return;
		event.preventDefault();
		history.pushState(null, '', href);
		scrollToHash();
	});
	window.addEventListener('hashchange', scrollToHash);
	window.addEventListener('load', function () { setTimeout(scrollToHash, 0); });
})();
