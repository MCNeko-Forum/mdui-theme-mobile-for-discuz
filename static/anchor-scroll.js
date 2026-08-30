(function () {
	function getTarget(hash) {
		if (!hash) return null;
		return document.getElementById(decodeURIComponent(hash.slice(1)));
	}
	function scrollToHash() {
		var target = getTarget(location.hash);
		if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
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
		target.scrollIntoView({behavior: 'smooth', block: 'start'});
	});
	window.addEventListener('hashchange', scrollToHash);
	window.addEventListener('load', function () { setTimeout(scrollToHash, 0); });
})();
