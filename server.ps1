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

        # Drain request headers and read body if POST/PUT
        $contentLength = 0
        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
            if ($line.ToLower().StartsWith("content-length:")) {
                $contentLength = [int]($line.Split(':')[1].Trim())
            }
        }
        $bodyText = ""
        if ($contentLength -gt 0) {
            $bodyBuffer = New-Object char[] $contentLength
            $reader.ReadBlock($bodyBuffer, 0, $contentLength) | Out-Null
            $bodyText = [string]::new($bodyBuffer)
        }

        $parts = $requestLine.Split(' ')
        $method = $parts[0]
        $rawUrl = $parts[1]
        $url = $rawUrl
        if ($rawUrl.Contains('?')) {
            $url = $rawUrl.Substring(0, $rawUrl.IndexOf('?'))
        }

        Write-Host "$method $rawUrl" -ForegroundColor DarkGray

        # REST API HANDLERS (/api/*)
        if ($url.StartsWith("/api/")) {
            $jsonString = "{}"

            if ($url -eq "/api/health") {
                $jsonString = '{"success":true,"message":"SMART USAGE ALERT backend is running"}'
            }
            elseif ($url -eq "/api/auth/login") {
                $jsonString = '{"success":true,"message":"Logged in successfully!","token":"sua_demo_jwt_token_2026","user":{"id":1,"userId":"sohil104","fullName":"Sohil Saran","email":"sohil@smartusage.io","householdSize":4,"location":"Green Oak Eco-District","isOnboarded":true}}'
            }
            elseif ($url -eq "/api/auth/register") {
                $jsonString = '{"success":true,"message":"Account created successfully!","token":"sua_demo_jwt_token_2026","user":{"id":2,"userId":"newuser","fullName":"New User","email":"newuser@smartusage.io","householdSize":4,"location":"Green Oak Eco-District","isOnboarded":false}}'
            }
            elseif ($url -eq "/api/auth/check-userid") {
                $jsonString = '{"success":true,"available":true,"message":"User ID available"}'
            }
            elseif ($url -eq "/api/auth/me") {
                $jsonString = '{"success":true,"user":{"id":1,"userId":"sohil104","fullName":"Sohil Saran","email":"sohil@smartusage.io","householdSize":4,"location":"Green Oak Eco-District","isOnboarded":true}}'
            }
            elseif ($url -eq "/api/auth/logout") {
                $jsonString = '{"success":true,"message":"Logged out successfully"}'
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
            elseif ($url -eq "/api/sustainability") {
                $jsonString = '{"success":true,"data":{"score":88,"food_score":92,"water_score":85,"energy_score":84,"waste_score":90}}'
            }
            elseif ($url -eq "/api/assistant") {
                # Dynamic AI Assistant - parse user query from POST body
                $userMsg = "general"
                if ($bodyText -ne "") {
                    try {
                        if ($bodyText -match '"message"\s*:\s*"([^"]*)"') {
                            $userMsg = $Matches[1].ToLower()
                        }
                    } catch {}
                }

                # Context-aware response routing
                if ($userMsg -match "electric|power|bill|kwh|ac|air.condition") {
                    $reply = "Grok AI Electricity Analysis:\n\nYour current electricity consumption is 11.0 kWh/day, which is 37.5% above your baseline of 8.0 kWh/day.\n\nRoot Cause Breakdown:\n- Air Conditioner: 72% contribution (10.1 kWh/day, 7.2 hrs runtime)\n- Water Heater: 18% contribution (3.0 kWh/day)\n- Refrigerator: 10% contribution (2.4 kWh/day)\n\nActionable Recommendations:\n1. Set AC thermostat to 24C instead of 20C (saves Rs. 720/month)\n2. Run washing machine after 9 PM (off-peak rates)\n3. Disable standby power on entertainment systems\n\nEstimated Monthly Savings: Rs. 1,850"
                }
                elseif ($userMsg -match "water|leak|valve|liters|consumption|spike") {
                    $reply = "Grok AI Water Diagnostic:\n\nYour water consumption is 175 L/day, which is 25% above your baseline of 140 L/day.\n\nAnomaly Detected:\n- Garden Valve #2 shows continuous 0.4 L/min micro-stream\n- 89% probability of a sticky flapper valve or unclosed bidet spray\n- Spike window: 08:15 AM - 10:45 AM\n\nRecommended Action:\n1. Shut off Garden Valve #2 immediately\n2. Run 10-second Water Leak Diagnostic Test\n3. Schedule plumber inspection within 48 hours\n\nEstimated Water Savings: 450 Liters/month (Rs. 158/month)"
                }
                elseif ($userMsg -match "lpg|gas|cylinder|flame|cook") {
                    $reply = "Grok AI LPG Analysis:\n\nYour LPG cylinder is at 25% capacity. Estimated depletion in approximately 4 days.\n\nEfficiency Tips:\n1. Match flame size to pot size (saves 18% gas)\n2. Use pressure cookers for pulses and stews (saves 40%)\n3. Clean burner ports for efficient blue flames\n4. Cover pots while cooking to retain heat\n\nAction Required: Book replacement LPG cylinder now to avoid interruption.\n\nEstimated Extension: From 4 days to 6 days with optimization"
                }
                elseif ($userMsg -match "shop|buy|grocery|item|need|cart") {
                    $reply = "Grok Smart Shopping Assistant:\n\nNEED NOW (Action Required Today):\n1. LPG Gas Cylinder Refill - Critical (25% remaining)\n2. Fresh Tomatoes - High (expiring in 2 days)\n\nNEED SOON (Buy in 5-7 Days):\n- Whole Milk (running low)\n- Whole Grain Bread (running low)\n\nDON'T BUY YET (Well Stocked):\n- Brown Rice (88% full)\n- Olive Oil (75% full)\n\nEstimated Smart Cart Total: Rs. 450\nPotential Waste Prevention: Rs. 560/month"
                }
                elseif ($userMsg -match "save|money|waste|budget|cost|rupee") {
                    $reply = "Grok AI Savings Calculator:\n\nYour Monthly Waste-to-Money Breakdown:\n- Unnecessary Electricity: Rs. 720 (AC overuse)\n- Wasted Water: Rs. 158 (Garden Valve leak)\n- Food Wastage Risk: Rs. 560 (Tomatoes expiring)\n- Excess LPG: Rs. 412 (inefficient cooking)\n\nTotal Monthly Waste: Rs. 1,850\nPotential Monthly Savings: Rs. 1,850\nAnnual Projection: Rs. 22,200\nCO2 Avoided: 14.5 kg/month (174 kg/year)\n\nSustainability Score Impact: 78 -> 94 (+16 points)"
                }
                else {
                    $reply = "Grok AI Resource Strategy:\n\nI analyzed your household telemetry for your query.\n\nCurrent Status:\n- Electricity: 11.0 kWh/day (37.5% above baseline - AC overuse detected)\n- Water: 175 L/day (25% above normal - Garden Valve leak active)\n- LPG Reserve: 25% (depletion in approximately 4 days)\n- Food Risk: Fresh Tomatoes expiring in 2 days\n\nTop Priority Actions:\n1. Shut off Garden Valve #2 (saves Rs. 158/month)\n2. Set AC to 24C (saves Rs. 720/month)\n3. Book LPG refill (avoid cooking interruption)\n4. Cook tomato-based recipes today (prevent waste)\n\nTotal Potential Savings: Rs. 1,850/month and 14.5 kg CO2 avoided!"
                }

                $replyEscaped = $reply.Replace('\', '\\').Replace('"', '\"')
                $jsonString = '{"success":true,"reply":"' + $replyEscaped + '"}'
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
            $header = "HTTP/1.1 200 OK`r`nContent-Type: application/json; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, Authorization`r`nConnection: close`r`n`r`n"
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
            if ($localPath.EndsWith(".html")) { $mime = "text/html; charset=utf-8" }
            elseif ($localPath.EndsWith(".css")) { $mime = "text/css; charset=utf-8" }
            elseif ($localPath.EndsWith(".js")) { $mime = "application/javascript; charset=utf-8" }
            elseif ($localPath.EndsWith(".png")) { $mime = "image/png" }
            elseif ($localPath.EndsWith(".jpg") -or $localPath.EndsWith(".jpeg")) { $mime = "image/jpeg" }
            elseif ($localPath.EndsWith(".svg")) { $mime = "image/svg+xml" }
            elseif ($localPath.EndsWith(".ico")) { $mime = "image/x-icon" }
            elseif ($localPath.EndsWith(".json")) { $mime = "application/json" }
            elseif ($localPath.EndsWith(".woff2")) { $mime = "font/woff2" }

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
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
