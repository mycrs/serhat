<?php
/**
 * QRUZE Player Proxy
 * MKV, AVI gibi tarayıcıda desteklenmeyen formatları proxy üzerinden çalıştırır
 */

// CORS ayarları
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS request için
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// URL parametresi kontrolü
$url = $_GET['u'] ?? null;
if (!$url) {
    http_response_code(400);
    echo 'URL parametresi gerekli';
    exit;
}

// URL decode
$url = urldecode($url);

// Güvenlik kontrolü - sadece HTTP/HTTPS URL'lere izin ver
if (!preg_match('/^https?:\/\//i', $url)) {
    http_response_code(400);
    echo 'Geçersiz URL formatı';
    exit;
}

// Dosya uzantısı kontrolü
$extension = strtolower(pathinfo($url, PATHINFO_EXTENSION));
$allowedExtensions = ['mkv', 'avi', 'wmv', 'mp4', 'mov', 'flv'];

if (!in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    echo 'Desteklenmeyen dosya formatı';
    exit;
}

try {
    // Stream context oluştur
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 30,
            'user_agent' => 'QRUZE-Player/1.0'
        ]
    ]);
    
    // Dosyayı aç
    $file = fopen($url, 'rb', false, $context);
    if (!$file) {
        throw new Exception('Dosya açılamadı');
    }
    
    // Content-Type belirle
    $contentTypes = [
        'mkv' => 'video/x-matroska',
        'avi' => 'video/x-msvideo',
        'wmv' => 'video/x-ms-wmv',
        'mp4' => 'video/mp4',
        'mov' => 'video/quicktime',
        'flv' => 'video/x-flv'
    ];
    
    $contentType = $contentTypes[$extension] ?? 'application/octet-stream';
    header('Content-Type: ' . $contentType);
    
    // Range request desteği
    $range = $_SERVER['HTTP_RANGE'] ?? null;
    if ($range) {
        // Range header'ı parse et
        if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
            $start = (int)$matches[1];
            $end = $matches[2] ? (int)$matches[2] : null;
            
            // Dosya boyutunu al
            $stats = stream_get_meta_data($file);
            $filesize = $stats['size'] ?? 0;
            
            if ($end === null) {
                $end = $filesize - 1;
            }
            
            $length = $end - $start + 1;
            
            header('HTTP/1.1 206 Partial Content');
            header('Accept-Ranges: bytes');
            header("Content-Range: bytes $start-$end/$filesize");
            header("Content-Length: $length");
            
            // Dosyayı belirtilen pozisyona taşı
            fseek($file, $start);
        }
    }
    
    // Cache headers
    header('Cache-Control: public, max-age=3600');
    header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', time() + 3600));
    
    // Dosyayı stream et
    while (!feof($file)) {
        echo fread($file, 8192); // 8KB chunks
        flush();
    }
    
    fclose($file);
    
} catch (Exception $e) {
    http_response_code(500);
    echo 'Proxy hatası: ' . $e->getMessage();
}
?>