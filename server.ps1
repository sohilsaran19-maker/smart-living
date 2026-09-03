$port = 8080
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "TCP Server listening on http://127.0.0.1:$port/"

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($requestLine)) {
            $client.Close()
            continue
        }

        $parts = $requestLine.Split(' ')
        $url = $parts[1]
        if ($url -eq '/') { $url = '/index.html' }
        
        # Strip query string
        if ($url.Contains('?')) { $url = $url.Substring(0, $url.IndexOf('?')) }

        $localPath = Join-Path "d:\SU alert" $url.TrimStart('/')
        
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $mime = "text/plain"
            if ($localPath.EndsWith(".html")) { $mime = "text/html" }
            elseif ($localPath.EndsWith(".css")) { $mime = "text/css" }
            elseif ($localPath.EndsWith(".js")) { $mime = "application/javascript" }
            elseif ($localPath.EndsWith(".png")) { $mime = "image/png" }

            $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $404 = "HTTP/1.1 404 Not Found`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
            $404Bytes = [System.Text.Encoding]::UTF8.GetBytes($404)
            $stream.Write($404Bytes, 0, $404Bytes.Length)
        }
        $stream.Flush()
        $client.Close()
    } catch {
        # continue loop
    }
}
