<?php
/**
 * 图片直接下载中转
 *
 * 手机版帖子图片查看器（touch/forum/viewthread.htm）的「下载」按钮使用。
 * 浏览器对跨域图片不允许用 <a download> 强制下载，只能由本站中转，返回
 * Content-Disposition: attachment，从而做到「点击即下载」而不是打开图片。
 *
 * 本文件随主题一起部署在模板根目录，模板里通过 {$_G['style']['tpldir']}/imgdl.php
 * （即 ./template/MDUI/imgdl.php）引用，无需再往站点根目录单独放一份。
 *
 * 用法：/template/MDUI/imgdl.php?u=<urlencode 的图片地址>&name=<可选文件名>
 */

const VTDL_MAX_BYTES       = 31457280; // 30MB
const VTDL_MAX_REDIRECTS   = 3;
const VTDL_TIMEOUT         = 20;
const VTDL_CONNECT_TIMEOUT = 8;

const VTDL_EXT = [
	'image/jpeg'               => 'jpg',
	'image/pjpeg'              => 'jpg',
	'image/png'                => 'png',
	'image/gif'                => 'gif',
	'image/webp'               => 'webp',
	'image/bmp'                => 'bmp',
	'image/x-ms-bmp'           => 'bmp',
	'image/avif'               => 'avif',
	'image/svg+xml'            => 'svg',
	'image/x-icon'             => 'ico',
	'image/vnd.microsoft.icon' => 'ico',
	'image/tiff'               => 'tiff',
];

function vt_dl_fail($msg, $code = 400)
{
	http_response_code($code);
	header('Content-Type: text/plain; charset=utf-8');
	header('X-Content-Type-Options: nosniff');
	header('Cache-Control: no-store');
	echo $msg;
	exit;
}

/** 只允许公网 IP，挡掉内网 / 保留地址，避免被当成 SSRF 跳板 */
function vt_dl_ip_is_public($ip)
{
	return (bool)filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
}

function vt_dl_host_is_public($host)
{
	$host = trim($host, '[]');
	if ($host === '') {
		return false;
	}
	if (filter_var($host, FILTER_VALIDATE_IP)) {
		return vt_dl_ip_is_public($host);
	}
	$ips = @gethostbynamel($host);
	if (!$ips) {
		return false;
	}
	foreach ($ips as $ip) {
		if (!vt_dl_ip_is_public($ip)) {
			return false;
		}
	}
	return true;
}

function vt_dl_resolve($base, $loc)
{
	if (preg_match('#^https?://#i', $loc)) {
		return $loc;
	}
	$b = parse_url($base);
	if (!$b || empty($b['host'])) {
		return '';
	}
	$origin = $b['scheme'] . '://' . $b['host'] . (isset($b['port']) ? ':' . $b['port'] : '');
	if (strpos($loc, '//') === 0) {
		return $b['scheme'] . ':' . $loc;
	}
	if (strpos($loc, '/') === 0) {
		return $origin . $loc;
	}
	$dir = isset($b['path']) ? preg_replace('#/[^/]*$#', '/', $b['path']) : '/';
	return $origin . $dir . $loc;
}

/** 去掉目录、扩展名和危险字符，得到纯文件名主干 */
function vt_dl_stem($name)
{
	$name = str_replace(["\r", "\n", "\t", "\0"], '', (string)$name);
	$name = str_replace('\\', '/', $name);
	$pos = strrpos($name, '/');
	if ($pos !== false) {
		$name = substr($name, $pos + 1);
	}
	$name = pathinfo($name, PATHINFO_FILENAME);

	$clean = preg_replace('/[^\p{L}\p{N}._\- ]+/u', '_', $name);
	if ($clean === null) { // 非法 UTF-8
		$clean = preg_replace('/[^A-Za-z0-9._\- ]+/', '_', $name);
	}
	$clean = trim((string)$clean, '._- ');
	$clean = function_exists('mb_substr')
		? mb_substr($clean, 0, 80, 'UTF-8')
		: substr($clean, 0, 80);

	return (string)$clean;
}

$raw = isset($_GET['u']) ? trim((string)$_GET['u']) : '';
if ($raw === '' || strlen($raw) > 2048) {
	vt_dl_fail('参数错误');
}
if (strpos($raw, '//') === 0) {
	$raw = 'https:' . $raw;
}
$parts = parse_url($raw);
if (empty($parts['scheme']) || empty($parts['host'])) {
	vt_dl_fail('参数错误');
}
$scheme = strtolower($parts['scheme']);
if ($scheme !== 'http' && $scheme !== 'https') {
	vt_dl_fail('仅支持 http/https 图片地址');
}
if (!vt_dl_host_is_public($parts['host'])) {
	vt_dl_fail('该地址不允许下载', 403);
}

$stem = vt_dl_stem(isset($_GET['name']) ? $_GET['name'] : '');

$url       = $raw;
$redirects = 0;
$sent      = false;

while (true) {
	$status   = 0;
	$ctype    = '';
	$clen     = 0;
	$location = '';
	$total    = 0;
	$abort    = '';

	$ch = curl_init($url);
	if ($ch === false) {
		vt_dl_fail('下载失败', 502);
	}

	curl_setopt_array($ch, [
		CURLOPT_FOLLOWLOCATION => false,
		CURLOPT_CONNECTTIMEOUT => VTDL_CONNECT_TIMEOUT,
		CURLOPT_TIMEOUT        => VTDL_TIMEOUT,
		CURLOPT_PROTOCOLS      => CURLPROTO_HTTP | CURLPROTO_HTTPS,
		CURLOPT_SSL_VERIFYPEER => true,
		CURLOPT_SSL_VERIFYHOST => 2,
		CURLOPT_USERAGENT      => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
		CURLOPT_HTTPHEADER     => ['Accept: image/*,*/*;q=0.8', 'Accept-Encoding: identity'],
		CURLOPT_HEADERFUNCTION => function ($ch, $line) use (&$status, &$ctype, &$clen, &$location) {
			$len = strlen($line);
			$t   = trim($line);
			if ($t === '') {
				return $len;
			}
			if (preg_match('#^HTTP/\S+\s+(\d{3})#i', $t, $m)) {
				$status   = (int)$m[1];
				$ctype    = '';
				$clen     = 0;
				$location = '';
				return $len;
			}
			$p = strpos($t, ':');
			if ($p !== false) {
				$k = strtolower(trim(substr($t, 0, $p)));
				$v = trim(substr($t, $p + 1));
				if ($k === 'content-type') {
					$ctype = strtolower($v);
				} elseif ($k === 'content-length') {
					$clen = (int)$v;
				} elseif ($k === 'location') {
					$location = $v;
				}
			}
			return $len;
		},
		CURLOPT_WRITEFUNCTION  => function ($ch, $chunk) use (&$sent, &$abort, &$status, &$ctype, &$clen, &$total, $stem) {
			if ($status >= 300 && $status < 400) {
				$abort = 'redirect';
				return 0;
			}
			if ($sent) {
				$total += strlen($chunk);
				if ($total > VTDL_MAX_BYTES) {
					return 0;
				}
				echo $chunk;
				return strlen($chunk);
			}
			if ($clen > VTDL_MAX_BYTES) {
				$abort = 'too_large';
				return 0;
			}
			$ct = trim(preg_replace('/;.*$/', '', $ctype));
			if (!isset(VTDL_EXT[$ct])) {
				$abort = 'not_image';
				return 0;
			}
			$ext  = VTDL_EXT[$ct];
			$utf8 = ($stem !== '' ? $stem : 'image') . '.' . $ext;
			$ascii = trim(preg_replace('/[^A-Za-z0-9._\-]+/', '_', preg_replace('/[^\x20-\x7E]+/', '', $stem)), '._-');
			if ($ascii === '') {
				$ascii = 'image';
			}
			$ascii .= '.' . $ext;

			header('Content-Type: ' . $ct);
			header('Content-Disposition: attachment; filename="' . $ascii . '"; filename*=UTF-8\'\'' . rawurlencode($utf8));
			if ($clen > 0) {
				header('Content-Length: ' . $clen);
			}
			header('X-Content-Type-Options: nosniff');
			header('Cache-Control: no-store');

			$sent   = true;
			$total += strlen($chunk);
			echo $chunk;
			return strlen($chunk);
		},
	]);

	curl_exec($ch);
	$errno = curl_errno($ch);
	$err   = curl_error($ch);
	curl_close($ch);

	if ($abort === 'redirect') {
		if ($redirects >= VTDL_MAX_REDIRECTS || $location === '') {
			vt_dl_fail('重定向次数过多', 502);
		}
		$next = vt_dl_resolve($url, $location);
		$np   = $next ? parse_url($next) : null;
		if (empty($np['scheme']) || empty($np['host'])
			|| !in_array(strtolower($np['scheme']), ['http', 'https'], true)
			|| !vt_dl_host_is_public($np['host'])) {
			vt_dl_fail('该地址不允许下载', 403);
		}
		$url = $next;
		$redirects++;
		continue;
	}

	if ($sent) {
		exit;
	}

	if ($abort === 'too_large') {
		vt_dl_fail('图片超过大小限制', 413);
	}
	if ($abort === 'not_image') {
		vt_dl_fail('该地址不是图片', 415);
	}
	if ($errno) {
		vt_dl_fail('下载失败：' . $err, 502);
	}
	if ($status === 404) {
		vt_dl_fail('图片不存在', 404);
	}

	vt_dl_fail('下载失败', 502);
}
