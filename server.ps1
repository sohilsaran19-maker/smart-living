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

        # Drain request headers & capture headersText
        $contentLength = 0
        $headersText = ""
        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
            $headersText += $line + "`n"
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

        # Extract Authorization header if present
        $authHeader = ""
        $currentAuthUser = "sohil104"
        if ($headersText -match "(?i)Authorization:\s*Bearer\s+([^\r\n]+)") {
            $token = $Matches[1].Trim()
            if ($token.StartsWith("sua_jwt_token_")) {
                $currentAuthUser = $token.Substring(14)
            }
        }
        if (-not $global:userDataStore) { $global:userDataStore = @{} }
        if (-not $global:userDataStore.ContainsKey($currentAuthUser)) {
            $global:userDataStore[$currentAuthUser] = @{
                water = @{
                    daily_usage = 450.0;
                    normal_usage = 450.0;
                    household_size = 4;
                    water_source = "Municipal Pipe";
                    category = "Bathing & Cleaning";
                    history = @(440, 450, 460, 450, 455, 448, 450)
                };
                electricity = @{
                    normal_usage = 10.0;
                    history = @(9.5, 10.0, 9.8, 10.2, 9.9, 10.1, 10.0);
                    appliances = @(
                        @{ id=1; name="Air Conditioner"; watts=1500; hours_per_day=6; days_per_month=30 },
                        @{ id=2; name="Refrigerator"; watts=200; hours_per_day=24; days_per_month=30 }
                    )
                };
                lpg = @{
                    capacity_kg = 14.2;
                    current_percent = 85.0;
                    daily_consumption_pct = 2.5;
                };
                consumables = @(
                    @{ id=1; name="Detergent Powder"; quantity=2.0; unit="kg"; min_quantity=0.5; daily_usage=0.1 },
                    @{ id=2; name="Dishwashing Soap"; quantity=1.0; unit="liter"; min_quantity=0.2; daily_usage=0.05 }
                );
                has_custom_data = $false
            }
        }
        $uStore = $global:userDataStore[$currentAuthUser]

        # Dynamic Metrics Calculation Engine
        # 1. Water calculations
        $wDaily = $uStore.water.daily_usage
        $wNormal = $uStore.water.normal_usage
        $wWeekly = $wDaily * 7
        $wMonthly = $wDaily * 30
        $wPerPerson = if ($uStore.water.household_size -gt 0) { [math]::Round($wDaily / $uStore.water.household_size, 1) } else { $wDaily }
        $wPctDiff = if ($wNormal -gt 0) { [math]::Round((($wDaily - $wNormal) / $wNormal) * 100, 1) } else { 0 }
        
        $wSeverity = "NORMAL"
        if ($wPctDiff -gt 50) { $wSeverity = "CRITICAL" }
        elseif ($wPctDiff -gt 25) { $wSeverity = "HIGH" }
        elseif ($wPctDiff -gt 10) { $wSeverity = "SLIGHTLY HIGH" }

        # 2. Electricity calculations
        $eDailykWh = 0.0
        foreach ($app in $uStore.electricity.appliances) {
            $eDailykWh += ($app.watts * $app.hours_per_day) / 1000.0
        }
        $eMonthlykWh = $eDailykWh * 30
        $eMonthlyCost = $eMonthlykWh * 7.5 # Rs 7.5 per kWh
        $eNormal = $uStore.electricity.normal_usage
        $ePctDiff = if ($eNormal -gt 0) { [math]::Round((($eDailykWh - $eNormal) / $eNormal) * 100, 1) } else { 0 }
        
        $eSeverity = "NORMAL"
        if ($ePctDiff -gt 50) { $eSeverity = "CRITICAL" }
        elseif ($ePctDiff -gt 25) { $eSeverity = "HIGH" }
        elseif ($ePctDiff -gt 10) { $eSeverity = "SLIGHTLY HIGH" }

        # 3. LPG calculations
        $lpgPct = $uStore.lpg.current_percent
        $lpgDailyPct = $uStore.lpg.daily_consumption_pct
        $lpgDaysLeft = if ($lpgDailyPct -gt 0) { [math]::Round($lpgPct / $lpgDailyPct, 0) } else { 99 }
        $lpgStatus = "SAFE"
        if ($lpgDaysLeft -le 3 -or $lpgPct -le 15) { $lpgStatus = "CRITICAL" }
        elseif ($lpgDaysLeft -le 7 -or $lpgPct -le 30) { $lpgStatus = "LOW" }

        # 4. Consumables depletion calculation
        $activeConsumableAlerts = @()
        $consumablesNeedingAttention = 0
        foreach ($c in $uStore.consumables) {
            $cDaysLeft = if ($c.daily_usage -gt 0) { [math]::Round($c.quantity / $c.daily_usage, 0) } else { 99 }
            $cStatus = "SUFFICIENT"
            if ($c.quantity -le $c.min_quantity -or $cDaysLeft -le 2) {
                $cStatus = "NEED NOW"
                $consumablesNeedingAttention++
                $activeConsumableAlerts += @{
                    resource = "Consumable (" + $c.name + ")";
                    severity = "HIGH";
                    problem = $c.name + " is approaching depletion (" + $cDaysLeft + " days left)";
                    why = "Current quantity (" + $c.quantity + " " + $c.unit + ") is below minimum threshold (" + $c.min_quantity + " " + $c.unit + ")";
                    action = "Restock " + $c.name + " soon";
                    estimated_savings = "Prevents emergency buying surge cost"
                }
            } elseif ($cDaysLeft -le 5) {
                $cStatus = "NEED SOON"
                $consumablesNeedingAttention++
            }
            $c["days_left"] = $cDaysLeft
            $c["status"] = $cStatus
        }

        # 5. Smart Alert Engine Aggregation
        $allAlerts = @()
        if ($wSeverity -eq "HIGH" -or $wSeverity -eq "CRITICAL") {
            $allAlerts += @{
                resource = "Water";
                severity = $wSeverity;
                problem = "Water usage is " + $wPctDiff + "% higher than normal pattern";
                why = "Recent spike in daily consumption (" + $wDaily + " L/day vs normal " + $wNormal + " L/day)";
                action = "Inspect taps, garden valves, and check for hidden pipe leakage";
                estimated_savings = "Save ~" + [math]::Round(($wDaily - $wNormal) * 30, 0) + " Liters/month (Rs. 250)"
            }
        }
        if ($eSeverity -eq "HIGH" -or $eSeverity -eq "CRITICAL") {
            $allAlerts += @{
                resource = "Electricity";
                severity = $eSeverity;
                problem = "Electricity consumption increased by " + $ePctDiff + "% compared with normal pattern";
                why = "High continuous draw from major appliances (" + [math]::Round($eDailykWh, 1) + " kWh/day vs baseline " + $eNormal + " kWh/day)";
                action = "Adjust AC temperature to 24C and switch off standby water heater";
                estimated_savings = "Save ~Rs. " + [math]::Round(($eDailykWh - $eNormal) * 30 * 7.5, 0) + "/month"
            }
        }
        if ($lpgStatus -eq "LOW" -or $lpgStatus -eq "CRITICAL") {
            $allAlerts += @{
                resource = "LPG";
                severity = if ($lpgStatus -eq "CRITICAL") { "CRITICAL" } else { "MEDIUM" };
                problem = "LPG cylinder capacity low (" + $lpgPct + "% remaining)";
                why = "Based on daily usage rate, estimated depletion in " + $lpgDaysLeft + " days";
                action = "Book replacement LPG cylinder immediately to avoid cooking disruption";
                estimated_savings = "Avoid emergency delivery premium"
            }
        }
        $allAlerts += $activeConsumableAlerts

        # REST API HANDLERS (/api/*)
        if ($url.StartsWith("/api/")) {
            $jsonString = "{}"

            if ($url -eq "/api/health") {
                $jsonString = '{"success":true,"message":"SMART USAGE ALERT backend is running"}'
            }
            elseif ($url -eq "/api/water") {
                if ($method -eq "POST" -and $bodyText -ne "") {
                    if ($bodyText -match '"daily_usage"\s*:\s*"?(\d+\.?\d*)"?') { $uStore.water.daily_usage = [double]$Matches[1] }
                    if ($bodyText -match '"household_size"\s*:\s*"?(\d+)"?') { $uStore.water.household_size = [int]$Matches[1] }
                    if ($bodyText -match '"water_source"\s*:\s*"([^"]*)"') { $uStore.water.water_source = $Matches[1] }
                    if ($bodyText -match '"category"\s*:\s*"([^"]*)"') { $uStore.water.category = $Matches[1] }
                    $uStore.has_custom_data = $true
                }
                $wDaily = $uStore.water.daily_usage
                $wNormal = $uStore.water.normal_usage
                $wWeekly = $wDaily * 7
                $wMonthly = $wDaily * 30
                $wPerPerson = if ($uStore.water.household_size -gt 0) { [math]::Round($wDaily / $uStore.water.household_size, 1) } else { $wDaily }
                $wPctDiff = if ($wNormal -gt 0) { [math]::Round((($wDaily - $wNormal) / $wNormal) * 100, 1) } else { 0 }

                $hasDataStr = if ($uStore.has_custom_data) { "true" } else { "false" }
                $jsonString = '{"success":true,"has_data":' + $hasDataStr + ',"data":{"daily_usage":' + $wDaily + ',"normal_usage":' + $wNormal + ',"weekly_usage":' + $wWeekly + ',"monthly_usage":' + $wMonthly + ',"per_person_usage":' + $wPerPerson + ',"pct_change":' + $wPctDiff + ',"severity":"' + $wSeverity + '","household_size":' + $uStore.water.household_size + ',"water_source":"' + $uStore.water.water_source + '","category":"' + $uStore.water.category + '"}}'
            }
            elseif ($url -eq "/api/electricity") {
                if ($method -eq "POST" -and $bodyText -ne "") {
                    $appName = "Appliance"; $appWatts = 500; $appHours = 4; $appDays = 30
                    if ($bodyText -match '"name"\s*:\s*"([^"]*)"') { $appName = $Matches[1] }
                    if ($bodyText -match '"watts"\s*:\s*"?(\d+\.?\d*)"?') { $appWatts = [double]$Matches[1] }
                    if ($bodyText -match '"hours_per_day"\s*:\s*"?(\d+\.?\d*)"?') { $appHours = [double]$Matches[1] }
                    if ($bodyText -match '"days_per_month"\s*:\s*"?(\d+)"?') { $appDays = [int]$Matches[1] }
                    
                    $newApp = @{ id=($uStore.electricity.appliances.Count + 1); name=$appName; watts=$appWatts; hours_per_day=$appHours; days_per_month=$appDays }
                    $uStore.electricity.appliances += $newApp
                    $uStore.has_custom_data = $true
                }

                $eDailykWh = 0.0
                foreach ($app in $uStore.electricity.appliances) {
                    $eDailykWh += ($app.watts * $app.hours_per_day) / 1000.0
                }
                $eMonthlykWh = $eDailykWh * 30
                $eMonthlyCost = $eMonthlykWh * 7.5
                $ePctDiff = if ($uStore.electricity.normal_usage -gt 0) { [math]::Round((($eDailykWh - $uStore.electricity.normal_usage) / $uStore.electricity.normal_usage) * 100, 1) } else { 0 }

                $appJsonList = @()
                foreach ($app in $uStore.electricity.appliances) {
                    $appJsonList += '{"id":' + $app.id + ',"name":"' + $app.name + '","watts":' + $app.watts + ',"hours_per_day":' + $app.hours_per_day + ',"days_per_month":' + $app.days_per_month + '}'
                }
                $appsJson = "[" + ($appJsonList -join ",") + "]"

                $hasDataStr = if ($uStore.has_custom_data) { "true" } else { "false" }
                $jsonString = '{"success":true,"has_data":' + $hasDataStr + ',"data":{"daily_kwh":' + [math]::Round($eDailykWh, 2) + ',"monthly_kwh":' + [math]::Round($eMonthlykWh, 2) + ',"monthly_cost_rs":' + [math]::Round($eMonthlyCost, 2) + ',"pct_change":' + $ePctDiff + ',"severity":"' + $eSeverity + '","appliances":' + $appsJson + '}}'
            }
            elseif ($url -eq "/api/lpg") {
                if ($method -eq "POST" -and $bodyText -ne "") {
                    if ($bodyText -match '"current_percent"\s*:\s*"?(\d+\.?\d*)"?') { $uStore.lpg.current_percent = [double]$Matches[1] }
                    if ($bodyText -match '"daily_consumption_pct"\s*:\s*"?(\d+\.?\d*)"?') { $uStore.lpg.daily_consumption_pct = [double]$Matches[1] }
                    $uStore.has_custom_data = $true
                }
                $lpgPct = $uStore.lpg.current_percent
                $lpgDailyPct = $uStore.lpg.daily_consumption_pct
                $lpgDaysLeft = if ($lpgDailyPct -gt 0) { [math]::Round($lpgPct / $lpgDailyPct, 0) } else { 99 }

                $hasDataStr = if ($uStore.has_custom_data) { "true" } else { "false" }
                $jsonString = '{"success":true,"has_data":' + $hasDataStr + ',"data":{"current_percent":' + $lpgPct + ',"daily_consumption_pct":' + $lpgDailyPct + ',"days_remaining":' + $lpgDaysLeft + ',"status":"' + $lpgStatus + '"}}'
            }
            elseif ($url -eq "/api/consumables") {
                if ($method -eq "POST" -and $bodyText -ne "") {
                    $cName = "Consumable"; $cQty = 1.0; $cUnit = "pack"; $cMin = 0.2; $cDaily = 0.05
                    if ($bodyText -match '"name"\s*:\s*"([^"]*)"') { $cName = $Matches[1] }
                    if ($bodyText -match '"quantity"\s*:\s*"?(\d+\.?\d*)"?') { $cQty = [double]$Matches[1] }
                    if ($bodyText -match '"unit"\s*:\s*"([^"]*)"') { $cUnit = $Matches[1] }
                    if ($bodyText -match '"min_quantity"\s*:\s*"?(\d+\.?\d*)"?') { $cMin = [double]$Matches[1] }
                    if ($bodyText -match '"daily_usage"\s*:\s*"?(\d+\.?\d*)"?') { $cDaily = [double]$Matches[1] }

                    $newC = @{ id=($uStore.consumables.Count + 1); name=$cName; quantity=$cQty; unit=$cUnit; min_quantity=$cMin; daily_usage=$cDaily }
                    $uStore.consumables += $newC
                    $uStore.has_custom_data = $true
                }

                $cJsonList = @()
                foreach ($c in $uStore.consumables) {
                    $cDaysLeft = if ($c.daily_usage -gt 0) { [math]::Round($c.quantity / $c.daily_usage, 0) } else { 99 }
                    $cStatus = "SUFFICIENT"
                    if ($c.quantity -le $c.min_quantity -or $cDaysLeft -le 2) { $cStatus = "NEED NOW" }
                    elseif ($cDaysLeft -le 5) { $cStatus = "NEED SOON" }

                    $cJsonList += '{"id":' + $c.id + ',"name":"' + $c.name + '","quantity":' + $c.quantity + ',"unit":"' + $c.unit + '","min_quantity":' + $c.min_quantity + ',"daily_usage":' + $c.daily_usage + ',"days_remaining":' + $cDaysLeft + ',"status":"' + $cStatus + '"}'
                }
                $consumablesJson = "[" + ($cJsonList -join ",") + "]"

                $hasDataStr = if ($uStore.has_custom_data) { "true" } else { "false" }
                $jsonString = '{"success":true,"has_data":' + $hasDataStr + ',"data":' + $consumablesJson + '}'
            }
            elseif ($url -eq "/api/dashboard") {
                $alertJsonList = @()
                foreach ($al in $allAlerts) {
                    $alertJsonList += '{"resource":"' + $al.resource + '","severity":"' + $al.severity + '","problem":"' + $al.problem + '","why":"' + $al.why + '","action":"' + $al.action + '","estimated_savings":"' + $al.estimated_savings + '"}'
                }
                $alertsJson = "[" + ($alertJsonList -join ",") + "]"

                $hasDataStr = if ($uStore.has_custom_data) { "true" } else { "false" }
                $jsonString = '{"success":true,"user_id":"' + $currentAuthUser + '","has_data":' + $hasDataStr + ',"data":{"sustainability_score":88,"water_usage":{"current":' + $wDaily + ',"normal":' + $wNormal + ',"pct_change":' + $wPctDiff + ',"unit":"L/day"},"electricity_usage":{"current":' + [math]::Round($eDailykWh, 2) + ',"normal":' + $eNormal + ',"pct_change":' + $ePctDiff + ',"unit":"kWh/day"},"lpg_level":{"percentage":' + $lpgPct + ',"days_remaining":' + $lpgDaysLeft + ',"status":"' + $lpgStatus + '"},"consumables_needing_attention":' + $consumablesNeedingAttention + ',"active_alerts":' + $alertsJson + ',"savings":{"money_saved":1850,"water_saved":450,"electricity_saved":38,"CO2_avoided":14.5}}}'
            }
            elseif ($url -eq "/api/auth/check-userid") {
                $checkId = ""
                if ($rawUrl.Contains("userId=")) {
                    $checkId = $rawUrl.Substring($rawUrl.IndexOf("userId=") + 7).Split('&')[0]
                }
                $isTaken = $false
                if ($global:registeredUsers) {
                    foreach ($u in $global:registeredUsers) {
                        if ($u.userId.ToLower() -eq $checkId.ToLower()) { $isTaken = $true; break }
                    }
                }
                if ($isTaken -or $checkId.ToLower() -eq "sohil104" -or $checkId.ToLower() -eq "alex204") {
                    $jsonString = '{"success":true,"available":false,"message":"This User ID is already taken. Please choose another one."}'
                } else {
                    $jsonString = '{"success":true,"available":true,"message":"User ID available ✓"}'
                }
            }
            elseif ($url -eq "/api/auth/register") {
                $regSuccess = $true
                $regErr = ""
                $reqUser = $null
                
                if ($bodyText -ne "") {
                    try {
                        # Extract parameters from JSON body
                        $fullName = ""; $userId = ""; $email = ""; $password = ""; $householdSize = 4; $location = "Green Oak Eco-District"
                        if ($bodyText -match '"fullName"\s*:\s*"([^"]*)"') { $fullName = $Matches[1] }
                        if ($bodyText -match '"userId"\s*:\s*"([^"]*)"') { $userId = $Matches[1] }
                        if ($bodyText -match '"email"\s*:\s*"([^"]*)"') { $email = $Matches[1] }
                        if ($bodyText -match '"password"\s*:\s*"([^"]*)"') { $password = $Matches[1] }
                        if ($bodyText -match '"householdSize"\s*:\s*"?(\d+)"?') { $householdSize = [int]$Matches[1] }
                        if ($bodyText -match '"location"\s*:\s*"([^"]*)"') { $location = $Matches[1] }

                        if (-not $global:registeredUsers) { $global:registeredUsers = @() }

                        # Check User ID / Email uniqueness
                        foreach ($existing in $global:registeredUsers) {
                            if ($existing.userId.ToLower() -eq $userId.ToLower()) {
                                $regSuccess = $false
                                $regErr = "This User ID is already taken. Please choose another one."
                                break
                            }
                            if ($existing.email.ToLower() -eq $email.ToLower()) {
                                $regSuccess = $false
                                $regErr = "An account with this email address already exists."
                                break
                            }
                        }
                        if ($userId.ToLower() -eq "sohil104" -or $userId.ToLower() -eq "alex204") {
                            $regSuccess = $false
                            $regErr = "This User ID is already taken. Please choose another one."
                        }

                        if ($regSuccess) {
                            # Secure Hashing Simulation (SHA-256)
                            $hasher = [System.Security.Cryptography.SHA256]::Create()
                            $hashBytes = $hasher.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password + "_salt_2026"))
                            $passwordHash = [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()

                            $newUserObj = @{
                                id = ($global:registeredUsers.Count + 10);
                                userId = $userId;
                                fullName = $fullName;
                                email = $email;
                                passwordHash = $passwordHash;
                                rawPassword = $password; # internal verification
                                householdSize = $householdSize;
                                location = $location;
                                isOnboarded = $false
                            }
                            $global:registeredUsers += $newUserObj
                            $reqUser = $newUserObj

                            # Initialize fresh isolated user data store
                            $global:userDataStore[$userId] = @{
                                inventory = @();
                                water_usage = 110.0;
                                electricity_usage = 6.5;
                                lpg_level = 90;
                                alerts = @();
                                chat_history = @()
                            }
                        }
                    } catch {
                        $regSuccess = $false
                        $regErr = "Invalid registration data format."
                    }
                }

                if ($regSuccess -and $reqUser) {
                    $jsonString = '{"success":true,"message":"Account created successfully!","token":"sua_jwt_token_' + $reqUser.userId + '","user":{"id":' + $reqUser.id + ',"userId":"' + $reqUser.userId + '","fullName":"' + $reqUser.fullName + '","email":"' + $reqUser.email + '","householdSize":' + $reqUser.householdSize + ',"location":"' + $reqUser.location + '","isOnboarded":false}}'
                } else {
                    $jsonString = '{"success":false,"error":"' + $regErr + '","message":"' + $regErr + '"}'
                }
            }
            elseif ($url -eq "/api/auth/login") {
                $loginQuery = ""; $loginPw = ""
                if ($bodyText -ne "") {
                    if ($bodyText -match '"query"\s*:\s*"([^"]*)"') { $loginQuery = $Matches[1] }
                    elseif ($bodyText -match '"userIdOrEmail"\s*:\s*"([^"]*)"') { $loginQuery = $Matches[1] }
                    if ($bodyText -match '"password"\s*:\s*"([^"]*)"') { $loginPw = $Matches[1] }
                }

                $matchedUser = $null
                if ($global:registeredUsers) {
                    foreach ($u in $global:registeredUsers) {
                        if (($u.userId.ToLower() -eq $loginQuery.ToLower() -or $u.email.ToLower() -eq $loginQuery.ToLower()) -and $u.rawPassword -eq $loginPw) {
                            $matchedUser = $u
                            break
                        }
                    }
                }

                if ($matchedUser) {
                    $isOnboardedStr = if ($matchedUser.isOnboarded) { "true" } else { "false" }
                    $jsonString = '{"success":true,"message":"Logged in successfully!","token":"sua_jwt_token_' + $matchedUser.userId + '","user":{"id":' + $matchedUser.id + ',"userId":"' + $matchedUser.userId + '","fullName":"' + $matchedUser.fullName + '","email":"' + $matchedUser.email + '","householdSize":' + $matchedUser.householdSize + ',"location":"' + $matchedUser.location + '","isOnboarded":' + $isOnboardedStr + '}}'
                } elseif (($loginQuery.ToLower() -eq "sohil104" -or $loginQuery.ToLower() -eq "sohil@smartusage.io") -and $loginPw -eq "Password123!") {
                    $jsonString = '{"success":true,"message":"Logged in successfully!","token":"sua_jwt_token_sohil104","user":{"id":1,"userId":"sohil104","fullName":"Sohil Saran","email":"sohil@smartusage.io","householdSize":4,"location":"Green Oak Eco-District","isOnboarded":true}}'
                } elseif (($loginQuery.ToLower() -eq "alex204" -or $loginQuery.ToLower() -eq "alex@smartusage.io") -and $loginPw -eq "Password123!") {
                    $jsonString = '{"success":true,"message":"Logged in successfully!","token":"sua_jwt_token_alex204","user":{"id":2,"userId":"alex204","fullName":"Alex Rivera","email":"alex@smartusage.io","householdSize":2,"location":"Green Oak Eco-District","isOnboarded":true}}'
                } else {
                    $jsonString = '{"success":false,"error":"Invalid User ID or password. Please try again.","message":"Invalid User ID or password. Please try again."}'
                }
            }
            elseif ($url -eq "/api/auth/me") {
                $jsonString = '{"success":true,"user":{"id":1,"userId":"' + $currentAuthUser + '","fullName":"' + $currentAuthUser + '","email":"' + $currentAuthUser + '@smartusage.io","householdSize":4,"location":"Green Oak Eco-District","isOnboarded":true}}'
            }
            elseif ($url -eq "/api/auth/logout") {
                $jsonString = '{"success":true,"message":"Logged out successfully"}'
            }
            elseif ($url -eq "/api/dashboard") {
                $waterVal = $uStore.water_usage
                $powerVal = $uStore.electricity_usage
                $lpgVal = $uStore.lpg_level
                $invCount = $uStore.inventory.Count
                $jsonString = '{"success":true,"data":{"user_id":"' + $currentAuthUser + '","sustainability_score":88,"food_waste_risk_count":' + $invCount + ',"daily_water_usage":{"current":' + $waterVal + ',"normal":140,"pct_change":"+25.0%","unit":"L/day"},"electricity_usage":{"current":' + $powerVal + ',"normal":8.0,"pct_change":"+37.5%","unit":"kWh/day"},"lpg_level":{"percentage":' + $lpgVal + ',"days_remaining":4,"status":"Low Warning"},"active_alerts":[{"title":"High Electricity Consumption Detected","severity":"High","message":"37.5 percent above baseline (AC overuse)"}],"savings":{"money_saved":1850,"water_saved":450,"electricity_saved":38,"food_saved":2.4,"CO2_avoided":14.5}}}'
            }
            elseif ($url -eq "/api/resources") {
                $jsonString = '{"success":true,"data":[{"id":1,"resource_type":"Electricity","name":"Electricity Grid","current_usage":' + $uStore.electricity_usage + ',"normal_usage":8.0,"unit":"kWh/day"},{"id":2,"resource_type":"Water","name":"Main Water Line","current_usage":' + $uStore.water_usage + ',"normal_usage":140.0,"unit":"L/day"},{"id":3,"resource_type":"LPG","name":"LPG Cylinder","current_usage":' + $uStore.lpg_level + ',"normal_usage":100.0,"unit":"%"}]}'
            }
            elseif ($url -eq "/api/inventory") {
                if ($method -eq "POST" -and $bodyText -ne "") {
                    $newItemName = "New Item"
                    if ($bodyText -match '"food_name"\s*:\s*"([^"]*)"') { $newItemName = $Matches[1] }
                    elseif ($bodyText -match '"name"\s*:\s*"([^"]*)"') { $newItemName = $Matches[1] }
                    $newItem = @{ id=($uStore.inventory.Count + 1); food_name=$newItemName; quantity=1.0; unit="pack"; status="Fresh"; waste_risk="Low" }
                    $uStore.inventory += $newItem
                }
                
                # Build JSON array of user's inventory
                $invItems = @()
                foreach ($item in $uStore.inventory) {
                    $invItems += '{"id":' + $item.id + ',"food_name":"' + $item.food_name + '","quantity":' + $item.quantity + ',"unit":"' + $item.unit + '","status":"' + $item.status + '","waste_risk":"' + $item.waste_risk + '"}'
                }
                $invJson = "[" + ($invItems -join ",") + "]"
                $jsonString = '{"success":true,"user_id":"' + $currentAuthUser + '","data":' + $invJson + '}'
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
