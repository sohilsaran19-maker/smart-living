$port = 8080
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "SMART USAGE ALERT Server listening on http://127.0.0.1:$port/" -ForegroundColor Green
Write-Host "Static Files and REST API Endpoints active at /api/*" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

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
        $rawUrl = $parts[1]
        $url = $rawUrl
        if ($rawUrl.Contains('?')) {
            $url = $rawUrl.Substring(0, $rawUrl.IndexOf('?'))
        }

        # REST API HANDLERS (/api/*)
        if ($url.StartsWith("/api/")) {
            $jsonString = "{}"

            if ($url -eq "/api/health") {
                $jsonString = '{"status":"online","system":"SMART USAGE ALERT REST API","version":"1.0.0"}'
            }
            elseif ($url -eq "/api/dashboard") {
                $jsonString = '{"success":true,"data":{"sustainability_score":88,"food_waste_risk_count":1,"daily_water_usage":{"current":175,"normal":140,"pct_change":"+25.0%","unit":"L/day"},"electricity_usage":{"current":11.0,"normal":8.0,"pct_change":"+37.5%","unit":"kWh/day"},"lpg_level":{"percentage":25,"days_remaining":4,"status":"Low Warning"},"active_alerts":[{"title":"High Electricity Consumption Detected","severity":"High","message":"37.5 percent above baseline (AC overuse)"},{"title":"Water Leakage Risk Alert","severity":"Critical","message":"Garden Valve 2 leak detected"}],"savings":{"money_saved":1850,"water_saved":450,"electricity_saved":38,"food_saved":2.4,"CO2_avoided":14.5}}}'
            }
            elseif ($url -eq "/api/resources") {
                $jsonString = '{"success":true,"data":[{"id":1,"resource_type":"Electricity","name":"Electricity Grid","current_usage":11.0,"normal_usage":8.0,"unit":"kWh/day"},{"id":2,"resource_type":"Water","name":"Main Water Line","current_usage":175.0,"normal_usage":140.0,"unit":"L/day"},{"id":3,"resource_type":"LPG","name":"LPG Cylinder","current_usage":25.0,"normal_usage":100.0,"unit":"%"}]}'
            }
            elseif ($url -eq "/api/inventory") {
                $jsonString = '{"success":true,"data":[{"id":1,"food_name":"Organic Whole Milk","quantity":2.0,"unit":"Liters","status":"Fresh","waste_risk":"Fresh"},{"id":2,"food_name":"Fresh Tomatoes","quantity":1.8,"unit":"kg","status":"Expiring","waste_risk":"High"},{"id":3,"food_name":"Whole Grain Bread","quantity":1.0,"unit":"pack","status":"Use Soon","waste_risk":"Medium"}]}'
            }
            elseif ($url -eq "/api/predictions") {
                $jsonString = '{"success":true,"data":[{"resource_type":"Electricity","prediction_type":"Excess Usage","prediction_message":"Electricity usage is 37.5 percent higher than normal (11.0 kWh/day).","confidence":0.92,"recommended_action":"Set AC thermostat to 24C."},{"resource_type":"Water","prediction_type":"Anomaly","prediction_message":"Water consumption spiked by 30.8 percent. Possible Garden Valve leak.","confidence":0.89,"recommended_action":"Shut off Garden Valve 2."},{"resource_type":"LPG","prediction_type":"Depletion","prediction_message":"LPG at 25 percent. Will run out in 4 days.","confidence":0.95,"recommended_action":"Book replacement LPG cylinder."},{"resource_type":"Food","prediction_type":"Waste","prediction_message":"Fresh Tomatoes (1.8 kg) expire in 2 days.","confidence":0.94,"recommended_action":"Cook Veggie Medley Stir-Fry."}]}'
            }
            elseif ($url -eq "/api/analysis/root-cause") {
                $jsonString = '{"success":true,"data":{"resource":"Electricity","total_excess_detected":"37.5 percent above baseline","primary_cause":"Air Conditioner extended operation","ranked_causes":[{"cause":"Air Conditioner Usage","confidence":"72 percent","impact":"10.1 kWh/day (7.2 hrs)"},{"cause":"Water Heater / Geyser","confidence":"18 percent","impact":"3.0 kWh/day (1.5 hrs)"},{"cause":"Smart Refrigerator","confidence":"10 percent","impact":"2.4 kWh/day"}],"recommended_action":"Increase AC target temperature from 20C to 24C."}}'
            }
            elseif ($url -eq "/api/shopping/recommendations") {
                $jsonString = '{"success":true,"data":{"need_now":[{"name":"LPG Gas Cylinder Refill","priority":"Critical"},{"name":"Fresh Tomatoes","priority":"High"}],"need_soon":[{"name":"Whole Milk","priority":"Medium"},{"name":"Whole Grain Bread","priority":"Medium"}],"dont_buy_yet":[{"name":"Brown Rice","priority":"Low"},{"name":"Olive Oil","priority":"Low"}]}}'
            }
            elseif ($url -eq "/api/savings") {
                $jsonString = '{"success":true,"data":{"unnecessary_electricity_cost":720,"wasted_water_cost":158,"wasted_food_cost":560,"excess_lpg_cost":412,"total_monthly_waste":1850,"potential_monthly_savings":1850,"formatted_savings":"Rs. 1,850","co2_avoided_kg":14.5}}'
            }
            elseif ($url -eq "/api/simulator") {
                $jsonString = '{"success":true,"estimated_monthly_impact":{"electricity_saved_kwh":12.6,"water_saved_liters":210,"food_saved_kg":0.75,"money_saved_rupees":1850,"formatted_money_saved":"Rs. 1,850","co2_avoided_kg":14.5,"new_sustainability_score":94}}'
            }
            elseif ($url -eq "/api/assistant") {
                $jsonString = '{"success":true,"reply":"SMART USAGE ALERT AI Assistant:\n\nYour household telemetry:\n- Electricity: 11.0 kWh/day (37.5 percent high due to AC overuse)\n- Water: 175 L/day (25 percent high due to Garden Valve leak)\n- LPG Reserve: 25 percent (depletion in ~4 days)\n\nGrok Action Tip: Adjusting AC to 24C and shutting off Garden Valve 2 saves Rs. 1,850/month and 14.5 kg CO2!"}'
            }
            elseif ($url -eq "/api/benchmark") {
                $jsonString = '{"success":true,"benchmark_group":"Simulated 4-Person Eco-District Households","metrics":{"water":{"your_household":"175 L/day","neighborhood_avg":"140 L/day","comparison":"+25.0 percent Higher"},"electricity":{"your_household":"11.0 kWh/day","neighborhood_avg":"8.0 kWh/day","comparison":"+37.5 percent Higher"},"food_waste":{"your_household":"0.4 kg/week","neighborhood_avg":"1.2 kg/week","comparison":"66.7 percent Lower (Top Eco Performer)"}}}'
            }
            elseif ($url -eq "/api/demo/run") {
                $jsonString = '{"success":true,"scenario_name":"Hackathon Anomaly Detection Demo","total_steps":12,"summary_impact":{"water_saved":"450 Liters/month","electricity_saved":"38 kWh/month","money_saved":"Rs. 1,850/month","co2_avoided":"14.5 kg","sustainability_score_improvement":"+16 Points (78 to 94)"}}'
            }
            else {
                $jsonString = '{"success":true,"message":"SMART USAGE ALERT REST API Active"}'
            }

            $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
            $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Flush()
            $client.Close()
            continue
        }

        # STATIC FILE SERVING
        if ($url -eq '/') { $url = '/index.html' }
        $localPath = Join-Path $PSScriptRoot $url.TrimStart('/')
        
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
