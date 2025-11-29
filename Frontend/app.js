// app.js - core frontend logic
const API_BASE = "http://localhost:8000/api/v1";

function setToken(token){
  localStorage.setItem("accessToken", token);
}
function getToken(){
  return localStorage.getItem("accessToken");
}
function clearToken(){
  localStorage.removeItem("accessToken");
}

async function postJSON(url, body, auth=true){
  const headers = {"Content-Type":"application/json"};
  if(auth){
    const t = getToken();
    if(t) headers["Authorization"] = "Bearer " + t;
  }
  const res = await fetch(url, {method:"POST", headers, body: JSON.stringify(body)});
  return res;
}

async function getJSON(url, auth=true){
  const headers = {};
  if(auth){
    const t = getToken();
    if(t) headers["Authorization"] = "Bearer " + t;
  }
  const res = await fetch(url, {method:"GET", headers});
  return res;
}

function showMsg(container, text, type="error"){
  const el = document.getElementById(container);
  if(!el) return;
  el.innerHTML = `<div class="msg ${type === "error" ? "error" : "success"}">${text}</div>`;
  setTimeout(()=>{ el.innerHTML = "" }, 7000);
}

/* =========================
   REGISTER PAGE
   ========================= */
async function handleRegister(e){
  e.preventDefault();
  const fullName = document.getElementById("reg_fullname").value.trim();
  const username = (document.getElementById("reg_username").value || fullName.split(" ").join("_")).trim();
  const email = document.getElementById("reg_email").value.trim();
  const password = document.getElementById("reg_password").value;
  const password2 = document.getElementById("reg_password2").value;

  if(!fullName || !email || !password){
    showMsg("reg_msg","Please fill all required fields","error"); return;
  }
  if(password !== password2){ showMsg("reg_msg","Passwords do not match","error"); return; }

  try{
    const res = await postJSON(`${API_BASE}/users/register`, { fullName, username, email, password }, false );
    const data = await res.json();
    if(!res.ok) { showMsg("reg_msg", data.message || JSON.stringify(data), "error"); return; }
    showMsg("reg_msg","Registered successfully. Redirecting to login...", "success");
    setTimeout(()=> window.location.href = "login.html", 1400);
  }catch(err){
    showMsg("reg_msg","Registration failed. Check server.", "error");
    console.error(err);
  }
}

/* =========================
   LOGIN PAGE
   ========================= */
async function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById("login_email").value.trim();
  const password = document.getElementById("login_password").value;
  if(!email || !password){ showMsg("login_msg","Enter email and password","error"); return; }

  try{
    const res = await postJSON(`${API_BASE}/users/login`, { email, password }, false);
    const data = await res.json();
    if(!res.ok){ showMsg("login_msg", data.message || "Login failed", "error"); return;}
    // assume backend returns tokens in { data: { accessToken, refreshToken, user } } or similar
    const token = data?.data?.accessToken || data?.accessToken || data?.token;
    if(token) setToken(token);
    showMsg("login_msg","Login successful. Redirecting...", "success");
    setTimeout(()=> window.location.href = "dashboard.html", 800);
  }catch(err){
    showMsg("login_msg","Login failed. Check server.", "error");
    console.error(err);
  }
}

/* =========================
   DASHBOARD - AUTH CHECK
   ========================= */
function requireAuth(){
  const token = getToken();
  if(!token){
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function doLogout(){
  // call logout endpoint (optional)
  try{
    await fetch(`${API_BASE}/users/logout`, { method: "POST", headers: { "Authorization": "Bearer " + getToken() } });
  }catch(e){}
  clearToken();
  window.location.href = "login.html";
}

/* =========================
   IMAGE PREVIEW HANDLERS 
   ========================= */
function setupImagePreview() {
    const imageUrlInput = document.getElementById('detect_imageUrl');
    const fileInput = document.getElementById('detect_file');
    const previewImg = document.getElementById('preview_img');
    const previewContainer = document.getElementById('image_preview');

    // Helper to update the preview box
    function updatePreview(source) {
        if (source) {
            previewImg.src = source;
            previewContainer.style.display = 'block';
        } else {
            previewImg.src = '';
            previewContainer.style.display = 'none';
        }
    }

    // 1. URL Input Preview: Shows image instantly when URL is pasted/typed
    imageUrlInput?.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        // Clear file input when URL is used, prioritizing URL
        if(fileInput && url) fileInput.value = ''; 
        
        // Simple validation for non-empty http/https URL
        if (url && (url.startsWith('http') || url.startsWith('https'))) {
            updatePreview(url);
        } else if (!url && !fileInput?.files?.length) {
            updatePreview(null);
        }
    });

    // 2. File Input Preview: Uses FileReader to show local file
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                updatePreview(ev.target.result); // Base64 Data URL
                // Clear URL input when file is uploaded, prioritizing file
                if(imageUrlInput) imageUrlInput.value = ''; 
            };
            reader.readAsDataURL(file);
        } else {
            // If file is cleared, hide preview
            updatePreview(null);
        }
    });
}

/* =========================
   CHART.JS RENDERING
   ========================= */
let confidenceChart = null; // Variable to hold the Chart.js instance

function getChartColors(index) {
    const colors = [
        'rgba(34, 211, 238, 1)',  // cyan (Highest)
        'rgba(59, 130, 246, 1)',  // blue
        'rgba(74, 222, 128, 1)',  // green
        'rgba(250, 202, 25, 1)',  // yellow
        'rgba(248, 113, 113, 1)',  // red (Lowest)
    ];
    // Return a color from the array, cycling through it
    return colors[index % colors.length];
}

function renderAiAnalysisChart(aiResults) {
    const ctx = document.getElementById('aiConfidenceChart');
    const placeholder = document.getElementById('chart_placeholder');
    
    if (aiResults.length === 0) {
        ctx.style.display = 'none';
        placeholder.style.display = 'block';
        if (confidenceChart) confidenceChart.destroy();
        return;
    }
    
    ctx.style.display = 'block';
    placeholder.style.display = 'none';

    // Prepare data for Chart.js
    const labels = aiResults.map(r => r.label);
    const data = aiResults.map(r => (r.score * 100).toFixed(2));
    const backgroundColors = aiResults.map((_, i) => getChartColors(i));

    if (confidenceChart) {
        confidenceChart.destroy(); // Destroy previous chart instance
    }
    
    confidenceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confidence Score (%)',
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: '#040813', // Matches background
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-secondary)',
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}


/* =========================
   AI DETECTION (supports file or image URL)
   ========================= */
async function handleDetect(e){
  e.preventDefault();
  const detectBtn = document.getElementById("detectBtn");
  detectBtn.classList.add("loading");
  detectBtn.disabled = true; // Disable button while loading
  
  const imageUrl = document.getElementById("detect_imageUrl").value.trim();
  const fileInput = document.getElementById("detect_file");
  const backendUrl = `${API_BASE}/ai/detect`;

  showMsg("dash_msg","Running detection...", "success");

  try{
    let res;
    // 💡 FIX: This is the correct file upload path using FormData
    if(fileInput && fileInput.files && fileInput.files.length > 0){
      const form = new FormData();
      form.append("image", fileInput.files[0]);
      res = await fetch(backendUrl, {
        method: "POST",
        // IMPORTANT: Do NOT set Content-Type header when using FormData, browser does it automatically
        headers: { "Authorization": "Bearer " + getToken() },
        body: form
      });
    } else if(imageUrl){
      // send as JSON with imageUrl
      res = await postJSON(backendUrl, { imageUrl }, true);
    } else {
      showMsg("dash_msg","Provide an image file or camera stream URL", "error");
      detectBtn.classList.remove("loading");
      detectBtn.disabled = false;
      return;
    }

    const data = await res.json();
    if(!res.ok || data.success === false){
      showMsg("dash_msg", data.message || "AI detection failed: Check backend logs.", "error");
      detectBtn.classList.remove("loading");
      detectBtn.disabled = false;
      return;
    }

    // --- START OF DISPLAY LOGIC ---
    
    const aiResultArray = data.data?.aiResult || [];
    const eventData = data.data?.event || {};

    const out = document.getElementById("detect_result");
    out.innerHTML = ''; // Clear previous content

    // 💡 NEW: Render Chart
    renderAiAnalysisChart(aiResultArray);

    if(aiResultArray.length > 0) {
        const topResult = aiResultArray[0];
        const label = topResult.label;
        const scorePercent = (topResult.score * 100).toFixed(2);
        
        let infectionStatus = '🟢 Healthy';
        let statusColor = 'var(--accent-green)';
        if (scorePercent >= 70) {
            infectionStatus = '🔴 High Risk';
            statusColor = 'var(--danger)';
        } else if (scorePercent >= 30) {
            infectionStatus = '🟡 Monitor';
            statusColor = 'var(--warning)';
        }

        out.innerHTML = `
            <h4 style="font-size: 18px; margin-bottom: 8px;">Top Diagnosis Result</h4>
            
            <div style="padding: 12px; border: 1px solid ${statusColor}; border-radius: 8px; background: rgba(255, 255, 255, 0.05);">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">Predicted Condition:</div>
                <div style="font-size: 20px; font-weight: 700; color: ${statusColor}; margin-bottom: 12px;">
                    ${label}
                </div>
                
                <div class="row" style="gap: 20px; font-size: 14px;">
                    <div>
                        <div class="small">Confidence Score:</div>
                        <strong style="color: ${statusColor};">${scorePercent}%</strong>
                    </div>
                    <div>
                        <div class="small">Infection Status:</div>
                        <strong style="color: ${statusColor};">${infectionStatus}</strong>
                    </div>
                </div>
            </div>
        `;
    } else {
        renderAiAnalysisChart([]); // Clear the chart
        out.innerHTML = `<div class="msg error">No valid AI diagnosis results returned.</div>`;
    }

    // Populate quick record form fields from the 'event' data
    // Assuming 'record_plantId' exists in dashboard.html now
    if(document.getElementById("record_plantId") && eventData.plantID) document.getElementById("record_plantId").value = eventData.plantID;
    if(eventData.infectionLevel !== undefined) {
        document.getElementById("record_infection").value = (eventData.infectionLevel * 100).toFixed(0); 
    }
    if(eventData.pesticideAmount !== undefined) {
        document.getElementById("record_amount").value = eventData.pesticideAmount;
    }
    if(aiResultArray.length > 0) {
        document.getElementById("record_disease").value = aiResultArray[0].label;
    }

    // --- END OF DISPLAY LOGIC ---
    
    showMsg("dash_msg", "Detection finished. Result logged to ledger.", "success");
    detectBtn.classList.remove("loading");
    detectBtn.disabled = false;
    
  }catch(err){
    console.error(err);
    showMsg("dash_msg","AI detection failed (network/server)", "error");
    detectBtn.classList.remove("loading");
    detectBtn.disabled = false;
  }
}
/* =========================
   RECORD SPRAY EVENT
   ========================= */
async function handleRecordSpray(e){
  e.preventDefault();
  const plantId = document.getElementById("record_plantId").value.trim() || null;
  const diseaseDetected = document.getElementById("record_disease").value.trim();
  const infectionLevel = Number(document.getElementById("record_infection").value) || 0;
  const pesticideAmount = Number(document.getElementById("record_amount").value);

  if(!diseaseDetected || !pesticideAmount){
    showMsg("dash_msg","Provide disease and pesticide amount", "error"); return;
  }

  try{
    const res = await postJSON(`${API_BASE}/spray/add`, { plantId, diseaseDetected, infectionLevel, pesticideAmount }, true);
    const data = await res.json();
    if(!res.ok){ showMsg("dash_msg", data.message || "Record failed", "error"); return; }
    showMsg("dash_msg","Spray recorded", "success");
    // refresh spray history
    loadSprayHistory();
    loadRewards();
  }catch(err){
    console.error(err);
    showMsg("dash_msg","Failed to record", "error");
  }
}

/* =========================
   LOAD SPRAY HISTORY / REWARDS / LEDGER
   ========================= */
async function loadSprayHistory(){
  try{
    const res = await getJSON(`${API_BASE}/spray/my`, true);
    const data = await res.json();
    const arr = data.data || data || [];
    const container = document.getElementById("spray_history");
    if(!container) return;
    if(!Array.isArray(arr) || arr.length === 0){
      container.innerHTML = `<div class="card small">No spray records yet.</div>`;
      return;
    }
    let html = `<table class="table"><thead><tr><th>Date</th><th>Disease</th><th>Pesticide (ml)</th><th>Compliance</th><th>Reward</th></tr></thead><tbody>`;
    arr.forEach(s => {
      const d = new Date(s.createdAt || s.timestamp || s.date || Date.now()).toLocaleString();
      html += `<tr>
        <td>${d}</td>
        <td>${s.diseaseDetected || "-"}</td>
        <td>${s.pesticideAmount ?? s.pesticideAmount ?? "-"}</td>
        <td>${s.compliance ? "Yes" : "No"}</td>
        <td>${s.rewardTokens ?? s.rewardTokens ?? 0}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  }catch(err){
    console.error(err);
  }
}

async function loadRewards(){
  try{
    const res = await getJSON(`${API_BASE}/spray/rewards`, true);
    const data = await res.json();
    const total = (data.data && data.data.totalRewards) || data.totalRewards || (data?.data?._id && data?.data?.totalRewards) || 0;
    const el = document.getElementById("reward_total");
    if(el) el.innerText = total;
  }catch(err){
    console.error(err);
  }
}

async function loadLedger(){
  try{
    const res = await getJSON(`${API_BASE}/blockchain/ledger`, true);
    const data = await res.json();
    const arr = data.data || data || [];
    const el = document.getElementById("ledger_area");
    if(!el) return;
    el.innerHTML = `<pre style="white-space:pre-wrap">${JSON.stringify(arr, null, 2)}</pre>`;
  }catch(err){ console.error(err); }
}

/* =========================
   Init for dashboard page
   ========================= */
function dashboardInit(){
  if(!requireAuth()) return;
  document.getElementById("logoutBtn")?.addEventListener("click", doLogout);
  document.getElementById("detectForm")?.addEventListener("submit", handleDetect);
  document.getElementById("recordForm")?.addEventListener("submit", handleRecordSpray);
  
  // Initialize the image preview functionality
  setupImagePreview();

  loadSprayHistory();
  loadRewards();
  loadLedger();
}

/* =========================
   Wire forms if present
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  if(document.getElementById("registerForm")){
    document.getElementById("registerForm").addEventListener("submit", handleRegister);
  }
  if(document.getElementById("loginForm")){
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
  }
  if(document.getElementById("dashboard-root")){
    dashboardInit();
  }
});