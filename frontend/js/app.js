// Application Controller & View Router

let familyLinksData = [];

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}
window.showToast = showToast;

function switchTab(tabId) {
    document.querySelectorAll(".tab-pane").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add("active");

    const activeBtn = Array.from(document.querySelectorAll(".nav-btn")).find(b => b.getAttribute("onclick")?.includes(tabId));
    if (activeBtn) activeBtn.classList.add("active");

    if (tabId === "responder") {
        loadResponderQueue();
        loadFlaggedDuplicates();
    } else if (tabId === "admin") {
        loadAdminDashboard();
    }
}

function changeLanguage(lang) {
    setLanguage(lang);
    showToast(`Language switched to ${lang.toUpperCase()}`);
}

function triggerVoiceInput(targetId, statusId) {
    voiceEngine.startListening(targetId, statusId, currentLang);
}

// Family Graph Link Builder
function addFamilyLinkItem() {
    const rel = document.getElementById("famRelationSelect").value;
    const name = document.getElementById("famNameInput").value.trim();
    const phone = document.getElementById("famPhoneInput").value.trim();

    if (!name) {
        showToast("Please enter family member's name.", "error");
        return;
    }

    familyLinksData.push({ relation: rel, name: name, phone: phone });
    document.getElementById("famNameInput").value = "";
    document.getElementById("famPhoneInput").value = "";
    renderFamilyLinksList();
}

function removeFamilyLinkItem(index) {
    familyLinksData.splice(index, 1);
    renderFamilyLinksList();
}

function renderFamilyLinksList() {
    const container = document.getElementById("familyLinksList");
    if (!container) return;

    if (familyLinksData.length === 0) {
        container.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">No family relationships added yet.</span>`;
        return;
    }

    container.innerHTML = familyLinksData.map((item, idx) => `
        <div class="family-node" style="justify-content:space-between;">
            <span><strong>${item.relation}:</strong> ${item.name} ${item.phone ? `(${item.phone})` : ''}</span>
            <button type="button" onclick="removeFamilyLinkItem(${idx})" style="background:none; border:none; color:var(--accent-rose); cursor:pointer; font-weight:bold;">✕</button>
        </div>
    `).join("");
}

// Feature 1: Review Report Before Submission Modal
function openReviewModal() {
    const caseType = document.getElementById("caseType").value;
    const vulnCat = document.getElementById("vulnerabilityCategory").value;
    const fullName = document.getElementById("fullName").value;
    const rawAliases = document.getElementById("aliases").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const clothing = document.getElementById("clothingDetails").value;
    const location = document.getElementById("lastKnownLocation").value;
    const reporterName = document.getElementById("reporterName").value;
    const reporterPhone = document.getElementById("reporterPhone").value;

    const aliasesArray = rawAliases ? rawAliases.split(",").map(a => a.trim()).filter(Boolean) : [];

    const summaryHtml = `
        <p><strong>Case Category:</strong> ${caseType.toUpperCase()} (${vulnCat})</p>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Aliases / Alternate Spellings:</strong> ${aliasesArray.length ? aliasesArray.join(", ") : "None"}</p>
        <p><strong>Age / Gender:</strong> ${age} yrs | ${gender}</p>
        <p><strong>Appearance / Clothes:</strong> ${clothing}</p>
        <p><strong>Last Known Location:</strong> ${location}</p>
        <p><strong>Family Links (${familyLinksData.length}):</strong> ${familyLinksData.map(f => `${f.relation}: ${f.name}`).join("; ") || "None"}</p>
        <p><strong>Reporter:</strong> ${reporterName} (${reporterPhone})</p>
    `;

    document.getElementById("reviewSummaryContent").innerHTML = summaryHtml;
    document.getElementById("reviewModal").style.display = "flex";
}

function closeReviewModal() {
    document.getElementById("reviewModal").style.display = "none";
}

function speakReviewSummary() {
    const text = document.getElementById("reviewSummaryContent")?.innerText || "";
    voiceEngine.speakText(text, currentLang);
}

async function confirmAndSendReport() {
    closeReviewModal();
    const form = document.getElementById("reportForm");
    
    const caseType = document.getElementById("caseType").value;
    const vulnCat = document.getElementById("vulnerabilityCategory").value;
    const fullName = document.getElementById("fullName").value;
    const rawAliases = document.getElementById("aliases").value;
    const gender = document.getElementById("gender").value;
    const age = parseInt(document.getElementById("age").value);
    const heightCm = parseFloat(document.getElementById("heightCm").value) || null;
    const clothing = document.getElementById("clothingDetails").value;
    const marks = document.getElementById("distinguishingMarks").value;
    const location = document.getElementById("lastKnownLocation").value;
    const lat = parseFloat(document.getElementById("latitude").value);
    const lng = parseFloat(document.getElementById("longitude").value);
    const reporterName = document.getElementById("reporterName").value;
    const reporterPhone = document.getElementById("reporterPhone").value;
    const secretQ = document.getElementById("secretQuestion").value;
    const secretA = document.getElementById("secretAnswer").value;
    const photoFile = document.getElementById("photoFile").files[0];

    const aliasesArray = rawAliases ? rawAliases.split(",").map(a => a.trim()).filter(Boolean) : [];

    const payload = {
        case_type: caseType,
        vulnerability_category: vulnCat,
        full_name: fullName,
        aliases: aliasesArray,
        family_links: familyLinksData,
        gender: gender,
        age: age,
        height_cm: heightCm,
        clothing_details: clothing,
        distinguishing_marks: marks,
        last_known_location: location,
        latitude: lat,
        longitude: lng,
        incident_timestamp: new Date().toISOString(),
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        reporter_device_id: offlineManager.getDeviceId(),
        consent_given: true,
        secret_question: secretQ,
        secret_answer: secretA
    };

    try {
        const result = await API.reportCase(payload, photoFile);
        showToast(`✅ Case Report Submitted! Case ID: ${result.case_id}`, "success");
        
        // Reset family links
        familyLinksData = [];
        renderFamilyLinksList();

        // Navigate to status
        switchTab("status");
        document.getElementById("checkCaseId").value = result.case_id;
        document.getElementById("checkCaseToken").value = result.case_token;
        checkStatusAction();
    } catch (err) {
        showToast("Submission failed: " + err.message, "error");
    }
}

// Quick Mode Modal
function openQuickModal() {
    document.getElementById("quickModal").style.display = "flex";
}
function closeQuickModal() {
    document.getElementById("quickModal").style.display = "none";
}

async function submitQuickEmergency() {
    const category = document.getElementById("quickCategory").value;
    const age = parseInt(document.getElementById("quickAge").value);
    const details = document.getElementById("quickDetails").value;
    const phone = document.getElementById("quickPhone").value;

    const payload = {
        case_type: "missing",
        vulnerability_category: category,
        full_name: `EMERGENCY ${category.toUpperCase()}`,
        aliases: ["Emergency Alert"],
        family_links: [],
        gender: "Unknown",
        age: age,
        clothing_details: details,
        last_known_location: "Emergency Quick Location (Chennai)",
        latitude: 13.0694,
        longitude: 80.1948,
        incident_timestamp: new Date().toISOString(),
        reporter_name: "Emergency Reporter",
        reporter_phone: phone,
        reporter_device_id: offlineManager.getDeviceId(),
        consent_given: true
    };

    try {
        const res = await API.reportCase(payload);
        closeQuickModal();
        showToast(`🚨 Emergency Report Dispatched! Case ID: ${res.case_id}`, "success");
        switchTab("status");
        document.getElementById("checkCaseId").value = res.case_id;
        document.getElementById("checkCaseToken").value = res.case_token;
        checkStatusAction();
    } catch (err) {
        showToast("Error dispatching quick report: " + err.message, "error");
    }
}

// Check Case Status
async function checkStatusAction() {
    const caseId = document.getElementById("checkCaseId").value;
    const caseToken = document.getElementById("checkCaseToken").value;
    const secretA = document.getElementById("checkSecretAnswer").value;

    const container = document.getElementById("statusResultContainer");
    container.innerHTML = `<div style="color: var(--text-muted);">Fetching case status...</div>`;

    try {
        const res = await API.checkStatus(caseId, caseToken, secretA);
        
        let matchesHtml = "";
        if (res.matches && res.matches.length > 0) {
            matchesHtml = res.matches.map(m => `
                <div class="match-card ${m.confidence_band.toLowerCase()}-band">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span class="band-pill ${m.confidence_band.toLowerCase()}">${m.confidence_band} Confidence Match (${intPercent(m.confidence_score)}%)</span>
                        <span style="font-size:12px; color:var(--text-muted);">Status: <strong>${m.status}</strong></span>
                    </div>
                    <p style="font-size:14px; margin-bottom:6px;"><strong>Explanation:</strong> ${m.explanation}</p>
                    <div style="font-size:12px; color:var(--accent-violet);">
                        Secret Question Check: ${m.secret_question_verified ? "✅ Family Secret Answer VERIFIED" : "🔒 Secret Verification Pending"}
                    </div>
                </div>
            `).join("");
        } else {
            matchesHtml = `<p style="color: var(--text-muted); font-size:14px;">No match candidates detected yet. Automated AI background matching engine is actively scanning incoming reports.</p>`;
        }

        container.innerHTML = `
            <div class="card" style="border: 1px solid var(--accent-indigo);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h3 style="font-size:18px;">Case Status: <span style="color:var(--accent-indigo);">${res.status}</span></h3>
                    <span style="font-size:12px; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:8px;">ID: ${res.case_id}</span>
                </div>
                <p><strong>Person:</strong> ${res.full_name} | <strong>Type:</strong> ${res.case_type.toUpperCase()} | <strong>Location:</strong> ${res.last_known_location}</p>
                <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">Secret Auth State: ${res.secret_verified ? "🔓 Verified Family Access" : "🔒 Unverified (Enter matching secret answer to unlock responder contact details)"}</p>
                
                <h4 style="margin-top:16px; margin-bottom:10px; font-size:15px;">Candidate Matches Found by AI:</h4>
                ${matchesHtml}
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: var(--accent-rose); font-weight:600;">Error: ${err.message}</div>`;
    }
}

function intPercent(val) {
    return Math.round(val * 100);
}

// Sub-Tab Switcher in Responder Portal
function switchResponderSubTab(subTab) {
    document.getElementById("responderSubTabQueue").style.display = subTab === "queue" ? "block" : "none";
    document.getElementById("responderSubTabDuplicates").style.display = subTab === "duplicates" ? "block" : "none";

    document.getElementById("btnSubMatchQueue").className = subTab === "queue" ? "btn-primary" : "btn-secondary";
    document.getElementById("btnSubDupQueue").className = subTab === "duplicates" ? "btn-primary" : "btn-secondary";

    if (subTab === "duplicates") {
        loadFlaggedDuplicates();
    }
}

// Load Human Responder Review Queue
async function loadResponderQueue() {
    const container = document.getElementById("responderQueueContainer");
    container.innerHTML = `<div style="color: var(--text-muted);">Loading prioritized review queue...</div>`;

    try {
        const queue = await API.getResponderReviewQueue();
        if (!queue || queue.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align:center; padding:30px;">No pending matches currently in review queue.</p>`;
            return;
        }

        container.innerHTML = queue.map(item => {
            const m = item.missing_person;
            const f = item.found_person;
            const contribs = item.field_contributions || {};

            const mAliasesPills = (m.aliases || []).map(a => `<span class="alias-pill">${a}</span>`).join("");
            const fAliasesPills = (f.aliases || []).map(a => `<span class="alias-pill">${a}</span>`).join("");

            const mFamNodes = (m.family_links || []).map(l => `<div class="family-node"><strong>${l.relation}:</strong> ${l.name}</div>`).join("");
            const fFamNodes = (f.family_links || []).map(l => `<div class="family-node"><strong>${l.relation}:</strong> ${l.name}</div>`).join("");

            const contribBadges = Object.keys(contribs).map(k => `
                <div class="contrib-badge">
                    <div class="contrib-key">${k}</div>
                    <div class="contrib-val">${contribs[k]}</div>
                </div>
            `).join("");

            return `
                <div class="match-card ${item.confidence_band.toLowerCase()}-band">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <span class="band-pill ${item.confidence_band.toLowerCase()}">${item.confidence_band} Match (${intPercent(item.confidence_score)}%)</span>
                            <span style="margin-left:10px; font-size:13px; font-weight:700; color:var(--accent-violet);">
                                🎯 Priority Rank Score: ${item.priority_score} ${m.vulnerability_category === 'Child' ? ' (📌 CHILD VULNERABILITY PINNED TOP)' : ''}
                            </span>
                        </div>
                        <span style="font-size:12px; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:8px;">Match #${item.match_id}</span>
                    </div>

                    <!-- Feature 9: Uncertainty Disclaimer -->
                    <div class="uncertainty-disclaimer" style="margin-top:10px;">
                        <span>⚠️ <strong>AI Identity Suggestion Only:</strong> Image similarity and field scores are potential clues, never identity proof. Final confirmation requires two-side human responder check and secret answer verification.</span>
                    </div>

                    <!-- Feature 9: Field Contribution Breakdown -->
                    <div style="margin-bottom:12px;">
                        <h5 style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">AI Identity Resolver Field Contributions:</h5>
                        <div class="contrib-grid">${contribBadges}</div>
                    </div>

                    <div class="side-by-side">
                        <div class="person-box">
                            <h4 style="color:var(--accent-rose);">Missing Person (${m.case_id})</h4>
                            <p><strong>Name:</strong> ${m.name} (${m.age} yrs, ${m.vulnerability_category})</p>
                            <div class="alias-tag-container">${mAliasesPills}</div>
                            <p style="margin-top:6px;"><strong>Clothing:</strong> ${m.clothing}</p>
                            <p><strong>Location:</strong> ${m.location}</p>
                            
                            <!-- Family Graph Tree -->
                            <div class="family-graph-box">
                                <strong style="font-size:11px; color:var(--accent-violet);">Family Relationships Graph:</strong>
                                ${mFamNodes || '<div style="font-size:11px; color:var(--text-muted);">No graph data</div>'}
                            </div>

                            <p style="margin-top:8px;"><strong>Reporter Contact:</strong> <code>${m.reporter_phone}</code></p>
                            
                            <!-- Non-App Contact Buttons -->
                            <div class="contact-actions">
                                <a href="sms:${m.reporter_phone}" class="btn-contact sms">📱 SMS</a>
                                <a href="https://wa.me/${m.reporter_phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-contact whatsapp">💬 WhatsApp</a>
                                <a href="tel:${m.reporter_phone}" class="btn-contact call">📞 Call</a>
                            </div>

                            <div class="photo-container">
                                <img src="${m.photo_url || '/api/v1/photos/sample.jpg'}" class="photo-img" alt="Missing Photo">
                                <div class="blur-overlay">🔒 Blur-by-default preview</div>
                            </div>
                        </div>

                        <div class="person-box">
                            <h4 style="color:var(--accent-emerald);">Found Person (${f.case_id})</h4>
                            <p><strong>Name:</strong> ${f.name} (${f.age} yrs)</p>
                            <div class="alias-tag-container">${fAliasesPills}</div>
                            <p style="margin-top:6px;"><strong>Clothing:</strong> ${f.clothing}</p>
                            <p><strong>Location:</strong> ${f.location}</p>

                            <!-- Family Graph Tree -->
                            <div class="family-graph-box">
                                <strong style="font-size:11px; color:var(--accent-emerald);">Family Relationships Graph:</strong>
                                ${fFamNodes || '<div style="font-size:11px; color:var(--text-muted);">No graph data</div>'}
                            </div>

                            <p style="margin-top:8px;"><strong>Responder Contact:</strong> <code>${f.reporter_phone}</code></p>
                            
                            <!-- Non-App Contact Buttons -->
                            <div class="contact-actions">
                                <a href="sms:${f.reporter_phone}" class="btn-contact sms">📱 SMS</a>
                                <a href="https://wa.me/${f.reporter_phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-contact whatsapp">💬 WhatsApp</a>
                                <a href="tel:${f.reporter_phone}" class="btn-contact call">📞 Call</a>
                            </div>

                            <div class="photo-container">
                                <img src="${f.photo_url || '/api/v1/photos/sample.jpg'}" class="photo-img" alt="Found Photo">
                                <div class="blur-overlay">🔒 Blur-by-default preview</div>
                            </div>
                        </div>
                    </div>

                    <p style="font-size:13px; margin: 10px 0;"><strong>AI Explanation:</strong> ${item.explanation}</p>
                    <p style="font-size:13px; color: var(--accent-violet);"><strong>Family Secret Question:</strong> ${item.secret_question || 'None set'}</p>

                    <!-- Two-Side Confirmation Action Form -->
                    <div style="background: rgba(15,23,42,0.8); padding:12px; border-radius:8px; margin-top:12px; display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
                        <input type="password" id="secretAns_${item.match_id}" placeholder="Verify Secret Answer" style="max-width:200px;">
                        <input type="text" id="notes_${item.match_id}" placeholder="Responder decision notes..." style="flex:1;">
                        
                        <button class="btn-primary" style="background: linear-gradient(135deg, #10B981, #059669);" onclick="processVerification(${item.match_id}, 'Approved')">
                            ✅ Approve Match & Reunite
                        </button>
                        <button class="btn-secondary" onclick="processVerification(${item.match_id}, 'Rejected')">
                            ✕ Reject
                        </button>
                        <button class="btn-secondary" style="border-color:#F43F5E; color:#F43F5E;" onclick="processVerification(${item.match_id}, 'Approved', true)">
                            🚨 Escalate to Police/NGO
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (err) {
        container.innerHTML = `<div style="color: var(--accent-rose);">Error loading queue: ${err.message}</div>`;
    }
}

// Feature 8: Load Flagged Duplicates Queue
async function loadFlaggedDuplicates() {
    const container = document.getElementById("responderDuplicatesContainer");
    if (!container) return;
    container.innerHTML = `<div style="color: var(--text-muted);">Loading flagged duplicate reports...</div>`;

    try {
        const duplicates = await API.getFlaggedDuplicates();
        if (!duplicates || duplicates.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align:center; padding:30px;">No pending duplicate reports flagged.</p>`;
            return;
        }

        container.innerHTML = duplicates.map(dup => `
            <div class="match-card medium-band">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="band-pill medium">👯 Flagged Duplicate Pair (Similarity: ${intPercent(dup.similarity_score)}%)</span>
                    <span style="font-size:12px; color:var(--text-muted);">Record #${dup.duplicate_record_id}</span>
                </div>
                <p style="font-size:13px; margin-bottom:12px;"><strong>Matching Factors:</strong> ${dup.matching_factors}</p>

                <div class="side-by-side">
                    <div class="person-box">
                        <h4 style="color:var(--accent-indigo);">Primary Case (${dup.case_a.case_id})</h4>
                        <p><strong>Name:</strong> ${dup.case_a.name} (${dup.case_a.age} yrs)</p>
                        <p><strong>Aliases:</strong> ${dup.case_a.aliases.join(", ") || 'None'}</p>
                        <p><strong>Location:</strong> ${dup.case_a.location}</p>
                        <p><strong>Clothing:</strong> ${dup.case_a.clothing}</p>
                    </div>

                    <div class="person-box">
                        <h4 style="color:var(--accent-rose);">Candidate Duplicate Case (${dup.case_b.case_id})</h4>
                        <p><strong>Name:</strong> ${dup.case_b.name} (${dup.case_b.age} yrs)</p>
                        <p><strong>Aliases:</strong> ${dup.case_b.aliases.join(", ") || 'None'}</p>
                        <p><strong>Location:</strong> ${dup.case_b.location}</p>
                        <p><strong>Clothing:</strong> ${dup.case_b.clothing}</p>
                    </div>
                </div>

                <div style="background: rgba(15,23,42,0.8); padding:12px; border-radius:8px; margin-top:12px; display:flex; gap:12px; align-items:center;">
                    <input type="text" id="dupNotes_${dup.duplicate_record_id}" placeholder="Merge audit notes..." style="flex:1;">
                    <button class="btn-primary" style="background: linear-gradient(135deg, #8B5CF6, #6366F1);" onclick="processMergeDuplicate(${dup.duplicate_record_id}, 'Merged')">
                        🔗 Merge Duplicates (Audit Retained)
                    </button>
                    <button class="btn-secondary" onclick="processMergeDuplicate(${dup.duplicate_record_id}, 'Dismissed')">
                        ✕ Dismiss Flag
                    </button>
                </div>
            </div>
        `).join("");

    } catch (err) {
        container.innerHTML = `<div style="color: var(--accent-rose);">Error loading duplicates: ${err.message}</div>`;
    }
}

async function processMergeDuplicate(recordId, action) {
    const notes = document.getElementById(`dupNotes_${recordId}`)?.value || "";
    try {
        const res = await API.mergeDuplicates(recordId, action, notes);
        showToast(`Duplicate record #${res.duplicate_record_id} set to ${res.action}`, "success");
        loadFlaggedDuplicates();
    } catch (err) {
        showToast("Error processing duplicate merge: " + err.message, "error");
    }
}

async function processVerification(matchId, action, escalate = false) {
    const secretAns = document.getElementById(`secretAns_${matchId}`)?.value || "";
    const notes = document.getElementById(`notes_${matchId}`)?.value || "";

    try {
        const res = await API.verifyMatch(matchId, action, secretAns, notes, escalate);
        showToast(`Verification decision logged: ${res.action} (Secret Verified: ${res.secret_verified ? 'YES' : 'NO'})`, "success");
        loadResponderQueue();
    } catch (err) {
        showToast("Error processing verification: " + err.message, "error");
    }
}

// Load Admin Dashboard Metrics & Heatmap
async function loadAdminDashboard() {
    try {
        const dash = await API.getAdminDashboard();
        
        document.getElementById("metricTotal").innerText = dash.summary.total_cases;
        document.getElementById("metricSearching").innerText = dash.summary.searching;
        document.getElementById("metricMatches").innerText = dash.summary.possible_matches;
        document.getElementById("metricReunited").innerText = dash.summary.reunited;
        document.getElementById("metricAccuracy").innerText = dash.summary.match_accuracy_percent + "%";

        const shelterGrid = document.getElementById("shelterListGrid");
        shelterGrid.innerHTML = dash.shelters.map(s => `
            <div class="metric-card" style="text-align:left;">
                <h4 style="color:var(--accent-indigo); font-size:15px;">${s.name}</h4>
                <p style="font-size:13px; color:var(--text-muted);">${s.location}</p>
                <div style="margin-top:8px; font-weight:600; font-size:13px;">
                    Occupancy: ${s.current_occupancy} / ${s.capacity} beds (${Math.round(s.current_occupancy/s.capacity*100)}%)
                </div>
                <div class="contact-actions" style="margin-top:6px;">
                    <a href="tel:${s.contact_phone}" class="btn-contact call">📞 Emergency Call: ${s.contact_phone}</a>
                </div>
            </div>
        `).join("");

        const auditContainer = document.getElementById("auditLogTableContainer");
        auditContainer.innerHTML = `
            <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; color:#CBD5E1;">
                <thead>
                    <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted);">
                        <th style="padding:8px;">ID</th>
                        <th style="padding:8px;">Device ID</th>
                        <th style="padding:8px;">Action</th>
                        <th style="padding:8px;">Details</th>
                        <th style="padding:8px;">Spam / Fraud Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${dash.audit_logs.map(l => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                            <td style="padding:8px;">${l.id}</td>
                            <td style="padding:8px;"><code>${l.device_id}</code></td>
                            <td style="padding:8px; font-weight:600; color:var(--accent-indigo);">${l.action}</td>
                            <td style="padding:8px;">${l.details}</td>
                            <td style="padding:8px;">
                                <span class="band-pill ${l.spam_score > 0.5 ? 'high' : 'medium'}" style="font-size:10px;">
                                    ${l.spam_score}
                                </span>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        renderHeatmapCanvas(dash.heatmap);

    } catch (err) {
        showToast("Error loading admin dashboard: " + err.message, "error");
    }
}

// Interactive Geospatial Canvas Heatmap
function renderHeatmapCanvas(heatmapPoints) {
    const canvas = document.getElementById("heatmapCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    heatmapPoints.forEach((pt, i) => {
        const nx = ((pt.lng - 80.18) / (80.30 - 80.18)) * canvas.width;
        const ny = canvas.height - (((pt.lat - 13.02) / (13.10 - 13.02)) * canvas.height);

        const x = Math.max(40, Math.min(canvas.width - 40, nx));
        const y = Math.max(40, Math.min(canvas.height - 40, ny));

        const radGrad = ctx.createRadialGradient(x, y, 4, x, y, 35);
        if (pt.type === "missing") {
            radGrad.addColorStop(0, "rgba(244, 63, 94, 0.8)");
            radGrad.addColorStop(1, "rgba(244, 63, 94, 0.0)");
        } else {
            radGrad.addColorStop(0, "rgba(16, 185, 129, 0.8)");
            radGrad.addColorStop(1, "rgba(16, 185, 129, 0.0)");
        }

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = pt.type === "missing" ? "#F43F5E" : "#10B981";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "11px Inter";
        ctx.fillText(`${pt.case_id} (${pt.type})`, x + 10, y + 4);
    });
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    switchTab("report");
});
