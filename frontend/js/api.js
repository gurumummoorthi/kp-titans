// API Gateway Communication Layer
function resolveAccessToken(token, storageKey, role) {
    if (token) return token;

    const storedToken = sessionStorage.getItem(storageKey);
    if (storedToken) return storedToken;

    const enteredToken = window.prompt(`Enter ${role} access token:`);
    if (!enteredToken || !enteredToken.trim()) {
        throw new Error(`${role} access token is required.`);
    }

    const trimmedToken = enteredToken.trim();
    sessionStorage.setItem(storageKey, trimmedToken);
    return trimmedToken;
}

const API = {
    async request(endpoint, options = {}) {
        const headers = options.headers || {};
        
        headers["X-Device-ID"] = offlineManager.getDeviceId();
        if (!options.isFormData && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const config = {
            method: options.method || "GET",
            headers: headers,
            body: options.body ? (options.isFormData ? options.body : JSON.stringify(options.body)) : undefined
        };

        try {
            const res = await fetch(endpoint, config);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Server request failed");
            }
            return data;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            throw err;
        }
    },

    async reportCase(casePayload, photoFile = null) {
        const idempotencyKey = "IDEMP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        casePayload.idempotency_key = idempotencyKey;

        if (!navigator.onLine) {
            offlineManager.saveToOfflineQueue(casePayload);
            return {
                case_id: "OFFLINE-PENDING",
                case_token: "TK-LOCAL-SYNC",
                status: "Queued Locally (Auto-syncs when online)",
                offline: true
            };
        }

        const result = await this.request("/api/v1/cases/report", {
            method: "POST",
            headers: { "X-Idempotency-Key": idempotencyKey },
            body: casePayload
        });

        if (photoFile && result.case_id) {
            try {
                const formData = new FormData();
                formData.append("case_id", result.case_id);
                formData.append("file", photoFile);
                
                await this.request("/api/v1/photos/upload", {
                    method: "POST",
                    isFormData: true,
                    body: formData
                });
            } catch (pErr) {
                console.warn("Photo upload error:", pErr);
            }
        }

        return result;
    },

    async checkStatus(caseId, caseToken, secretAnswer = "") {
        return await this.request("/api/v1/cases/status-check", {
            method: "POST",
            body: { case_id: caseId, case_token: caseToken, secret_answer: secretAnswer }
        });
    },

    async getResponderReviewQueue(responderToken) {
        responderToken = resolveAccessToken(responderToken, "reuniteResponderToken", "Responder");
        return await this.request("/api/v1/responder/review-queue", {
            headers: { "X-Responder-Token": responderToken }
        });
    },

    async getFlaggedDuplicates(responderToken) {
        responderToken = resolveAccessToken(responderToken, "reuniteResponderToken", "Responder");
        return await this.request("/api/v1/responder/duplicates", {
            headers: { "X-Responder-Token": responderToken }
        });
    },

    async mergeDuplicates(duplicateRecordId, action, notes = "", responderToken) {
        responderToken = resolveAccessToken(responderToken, "reuniteResponderToken", "Responder");
        return await this.request("/api/v1/responder/merge-duplicates", {
            method: "POST",
            headers: { "X-Responder-Token": responderToken },
            body: {
                duplicate_record_id: duplicateRecordId,
                action: action,
                notes: notes
            }
        });
    },

    async verifyMatch(matchId, action, secretAnswer = "", notes = "", escalate = false, responderToken) {
        responderToken = resolveAccessToken(responderToken, "reuniteResponderToken", "Responder");
        return await this.request("/api/v1/responder/verify-match", {
            method: "POST",
            headers: { "X-Responder-Token": responderToken },
            body: {
                match_id: matchId,
                action: action,
                secret_answer_provided: secretAnswer,
                responder_notes: notes,
                escalate_to_authority: escalate
            }
        });
    },

    async getAdminDashboard(adminToken) {
        adminToken = resolveAccessToken(adminToken, "reuniteAdminToken", "Admin");
        return await this.request("/api/v1/admin/dashboard", {
            headers: { "X-Admin-Token": adminToken }
        });
    }
};
