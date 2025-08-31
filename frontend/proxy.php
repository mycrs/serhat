<?php
// proxy.php  — HTTPS üzerinden HTTP/HTTPS video akışını geçirir
// Kullanım: https://SİTENİZ/proxy.php?u=http://host:8080/live/u/p/12345.mkv

header("Access-Control-Allow-Origin: *");
header("Access-Control-Expose-Headers: Content-Length, Content-Range");
if (!isset($_GET['u'])) { http_response_code(400); echo "Missing url"; exit; }

$src = urldecode($_GET['u']);

// Güvenlik: Tüm hostlara izin ver (geliştirme için)
// $allow = ['fcs3.xyz','fcs01.com','tontontv.xyz','vipeu1.site','8un93r.dynuddns.com','l550fo.dynuddns.com'];
// $host = parse_url($src, PHP_URL_HOST);
// if (!in_array($host, $allow)) { http_response_code(403); echo "Host not allowed"; exit; }

// Geliştirme modu: Tüm hostlara izin ver
$host = parse_url($src, PHP_URL_HOST);
if (!$host) { http_response_code(400); echo "Invalid host"; exit; }

$ch = curl_init($src);

// İstemciden Range geldiyse ilet
$headers = [];
if (isset($_SERVER['HTTP_RANGE'])) $headers[] = 'Range: '.$_SERVER['HTTP_RANGE'];

// User-Agent/Referer iletmek bazı panellerde gerekli
$headers[] = 'User-Agent: '.($_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0');
if (!empty($_SERVER['HTTP_REFERER'])) $headers[] = 'Referer: '.$_SERVER['HTTP_REFERER'];

curl_setopt_array($ch, [
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HEADER => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => $headers,
  CURLOPT_SSL_VERIFYPEER => false,
  CURLOPT_SSL_VERIFYHOST => 0,
]);

$resp = curl_exec($ch);
if ($resp === false) { http_response_code(502); echo 'Proxy error'; exit; }

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$h = substr($resp, 0, $header_size);
$body = substr($resp, $header_size);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

// Kaynak başlıklarından gerekli olanları geçir
$pass = [
  'Content-Type','Content-Length','Content-Range','Accept-Ranges',
  'Content-Disposition','Cache-Control','Expires','Last-Modified'
];

foreach (explode("\r\n", $h) as $line) {
  if (strpos($line, ':') !== false) {
    [$k,$v] = explode(':', $line, 2);
    $k = trim($k); $v = trim($v);
    if (in_array($k, $pass)) header("$k: $v");
  }
}

// Bazı .mkv/.mp4 yanıtları yanlış tip döndürürse düzelt
if (!headers_sent() && !preg_match('~^video/|application/vnd.apple.mpegurl|application/x-mpegURL~i', $h)) {
  if (preg_match('~\.m3u8($|\?)~i', $src)) header('Content-Type: application/vnd.apple.mpegurl');
  elseif (preg_match('~\.(mp4|m4v)($|\?)~i', $src)) header('Content-Type: video/mp4');
  elseif (preg_match('~\.mkv($|\?)~i', $src)) header('Content-Type: video/x-matroska');
}

http_response_code($code);
echo $body;
?>