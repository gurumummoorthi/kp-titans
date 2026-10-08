// Offline Mode & Auto-Sync Manager
class OfflineSyncManager {
    constructor() {
        this.storageKey = "reunite_offline_queue";
        this.isOnline = navigator.onLine;
        this.initListeners();
    }

    initListeners() {
        window.addEventListener("online", () => {
            this.isOnline = true;
            this.updateUIStatus();
            this.syncQueuedCases();
        });

        window.addEventListener("offline", () => {
            this.isOnline = false;
            this.updateUIStatus();
        });
        
        // Initial check
        setTimeout(() => this.updateUIStatus(), 500);
    }

    getDeviceId() {
        let devId = localStorage.getItem("reunite_device_id");
        if (!devId) {
            devId = "DEV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
            localStorage.setItem("reunite_device_id", devId);
        }
        return devId;
    }

    saveToOfflineQueue(caseData) {
        const queue = this.getQueue();
        if (!caseData.idempotency_key) {
            caseData.idempotency_key = "OFFLINE-IDEMP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        }
        caseData.is_offline_sync = true;
        caseData.reporter_device_id = this.getDeviceId();
        
        queue.push(caseData);
        localStorage.setItem(this.storageKey, JSON.stringify(queue));
        this.updateUIStatus();
        return caseData.idempotency_key;
    }

    getQueue() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    clearQueue() {
        localStorage.removeItem(this.storageKey);
        this.updateUIStatus();
    }

    updateUIStatus() {
        const queue = this.getQueue();
        const badge = document.getElementById("netStatusBadge");
        const queueElem = document.getElementById("queuedCountBadge");
        
        if (badge) {
            if (this.isOnline) {
                badge.className = "status-badge online";
                badge.innerHTML = `<span class="dot green"></span> Status: Online`;
            } else {
                badge.className = "status-badge offline";
                badge.innerHTML = `<span class="dot red"></span> Status: Offline (Local Storage Active)`;
            }
        }
        
        if (queueElem) {
            queueElem.innerText = `Queued Offline Reports: ${queue.length}`;
        }
    }

    async syncQueuedCases() {
        const queue = this.getQueue();
        if (!queue.length || !navigator.onLine) return;

        console.log(`[OFFLINE SYNC] Auto-syncing ${queue.length} queued case reports to server...`);
        try {
            const response = await fetch("/api/v1/cases/offline-sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Device-ID": this.getDeviceId()
                },
                body: JSON.stringify({
                    device_id: this.getDeviceId(),
                    queued_cases: queue
                })
            });

            if (response.ok) {
                const res = await response.json();
                console.log("[OFFLINE SYNC SUCCESS]", res);
                this.clearQueue();
                if (window.showToast) {
                    window.showToast(`✅ Offline Mode: Auto-synced ${res.synced_count} queued case reports to API Gateway!`, "success");
                }
            }
        } catch (err) {
            console.error("[OFFLINE SYNC ERROR]", err);
        }
    }
}

const offlineManager = new OfflineSyncManager();
