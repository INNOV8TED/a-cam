/**
 * A-CAM Session Persistence Engine
 * Handles LocalStorage for settings and IndexedDB for large image assets.
 */
window.Persistence = {
    DB_NAME: 'acam_session_db',
    STORE_NAME: 'assets',
    DB_VERSION: 1,
    _db: null,

    /**
     * Initialize IndexedDB
     */
    initDB: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = e => reject("DB Error: " + e.target.errorCode);
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
            request.onsuccess = e => {
                this._db = e.target.result;
                resolve(this._db);
            };
        });
    },

    /**
     * Save an asset (base64 or blob) to IndexedDB
     */
    saveAsset: async function(key, data) {
        console.log(`💾 Persistence: Stashing asset [${key}] (${Math.round(data.length/1024)}KB)...`);
        if (!this._db) await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction([this.STORE_NAME], "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(data, key);
            request.onsuccess = () => {
                console.log(`✅ Persistence: Asset [${key}] saved to IndexedDB.`);
                resolve();
            };
            request.onerror = (e) => {
                console.error(`❌ Persistence: Failed to save asset [${key}]:`, e);
                reject(e);
            };
        });
    },

    /**
     * Load an asset from IndexedDB
     */
    loadAsset: async function(key) {
        if (!this._db) await this.initDB();
        return new Promise((resolve) => {
            const transaction = this._db.transaction([this.STORE_NAME], "readonly");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => {
                const res = request.result;
                if (res) console.log(`📂 Persistence: Loaded asset [${key}] (${Math.round(res.length/1024)}KB)`);
                resolve(res);
            };
            request.onerror = () => {
                console.warn(`⚠️ Persistence: Failed to load asset [${key}]`);
                resolve(null);
            };
        });
    },

    /**
     * Full state synchronization
     */
    saveSession: async function(state) {
        // 1. Settings -> LocalStorage (Filter out large/non-serializable objects)
        const settings = {};
        const LARGE_ASSET_KEYS = [
            'heroImage', 'backgroundPlate', 'faceCloseup', 
            'masterCharacterSheet', 'transformedStartFrame', 'transformedEndFrame'
        ];

        for (let key in state) {
            // Skip large assets for LocalStorage (they go to IndexedDB)
            if (LARGE_ASSET_KEYS.includes(key)) continue;

            const val = state[key];
            if (val === undefined || val === null) continue;
            
            // Build the settings object for LocalStorage (lightweight only)
            if (typeof val !== 'object' || Array.isArray(val)) {
                settings[key] = val;
                continue;
            }

            // Simple objects (POJOs) under a size limit
            if (val.constructor === Object) {
                try {
                    const str = JSON.stringify(val);
                    if (str.length < 50000) settings[key] = val;
                } catch(e) {}
                continue;
            }
        }

        // Save settings fail-safely
        try {
            localStorage.setItem('acam_active_session', JSON.stringify(settings));
        } catch (e) {
            console.warn("⚠️ Persistence: LocalStorage full, saved to IndexedDB only.", e);
        }

        // 2. Large Assets -> IndexedDB (The high-fidelity backup)
        if (state.heroImage && (typeof state.heroImage === 'string' || state.heroImage instanceof HTMLImageElement)) {
            const data = state.heroImage.src || state.heroImage;
            if (typeof data === 'string' && data.startsWith('data:')) {
                await this.saveAsset('heroImage', data);
            }
        }
        
        if (state.backgroundPlate && (typeof state.backgroundPlate === 'string' || state.backgroundPlate instanceof HTMLImageElement)) {
            const data = state.backgroundPlate.src || state.backgroundPlate;
            if (typeof data === 'string' && data.startsWith('data:')) {
                await this.saveAsset('backgroundPlate', data);
            }
        }

        if (state.faceCloseup && typeof state.faceCloseup === 'string' && state.faceCloseup.startsWith('data:')) {
            await this.saveAsset('faceCloseup', state.faceCloseup);
        }

        if (state.transformedStartFrame && typeof state.transformedStartFrame === 'string' && state.transformedStartFrame.startsWith('data:')) {
            await this.saveAsset('transformedStartFrame', state.transformedStartFrame);
        }

        if (state.transformedEndFrame && typeof state.transformedEndFrame === 'string' && state.transformedEndFrame.startsWith('data:')) {
            await this.saveAsset('transformedEndFrame', state.transformedEndFrame);
        }

        if (state.masterCharacterSheet && typeof state.masterCharacterSheet === 'string' && state.masterCharacterSheet.startsWith('data:')) {
            await this.saveAsset('masterCharacterSheet', state.masterCharacterSheet);
        }
    },

    /**
     * Specialized Fast-Track save for Identity Assets (bypasses debounce)
     */
    saveIdentityImmediate: async function(state) {
        console.log("⚡ Persistence: Fast-tracking Identity save...");
        if (state.faceCloseup && typeof state.faceCloseup === 'string' && state.faceCloseup.startsWith('data:')) {
            await this.saveAsset('faceCloseup', state.faceCloseup);
        }
        if (state.masterCharacterSheet && typeof state.masterCharacterSheet === 'string' && state.masterCharacterSheet.startsWith('data:')) {
            await this.saveAsset('masterCharacterSheet', state.masterCharacterSheet);
        }
    },

    /**
     * Restore state from storage
     */
    loadSession: async function() {
        const session = { settings: null, assets: {} };
        
        try {
            const saved = localStorage.getItem('acam_active_session');
            if (saved && saved !== 'null' && saved !== 'undefined') {
                session.settings = JSON.parse(saved);
            }
        } catch(e) {
            console.error("❌ Persistence: Failed to parse session settings:", e);
        }

        try {
            session.assets.heroImage = await this.loadAsset('heroImage');
            session.assets.backgroundPlate = await this.loadAsset('backgroundPlate');
            session.assets.faceCloseup = await this.loadAsset('faceCloseup');
            session.assets.transformedStartFrame = await this.loadAsset('transformedStartFrame');
            session.assets.transformedEndFrame = await this.loadAsset('transformedEndFrame');
            session.assets.masterCharacterSheet = await this.loadAsset('masterCharacterSheet');
        } catch(e) {
            console.error("❌ Persistence: Failed to load assets from IndexedDB:", e);
        }

        return session;
    },

    /**
     * Save GCP/API configuration
     */
    saveConfig: function(config) {
        localStorage.setItem('acam_gcp_config', JSON.stringify(config));
    },

    /**
     * Load GCP/API configuration
     */
    loadConfig: function() {
        // 1. Try New Consolidated Key
        const saved = localStorage.getItem('acam_gcp_config');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }

        // 2. MIGRATION ENGINE: Fallback to Legacy Keys
        console.log("🛠️ Persistence: Attempting legacy key migration...");
        const legacy = {
            'acam_gemini_key': localStorage.getItem('acam_gemini_key'),
            'acam_fal_key': localStorage.getItem('acam_fal_key'),
            'gcpProjectId': localStorage.getItem('gcpProjectId') || localStorage.getItem('acam_gcp_project_id'),
            'gcpRegion': localStorage.getItem('gcpRegion') || localStorage.getItem('acam_gcp_region') || 'us-central1',
            'gcpAccessToken': localStorage.getItem('gcpAccessToken') || localStorage.getItem('acam_gcp_access_token')
        };

        // If we found anything useful, return it (it will be saved to the new key on first interaction)
        if (legacy.acam_gemini_key || legacy.gcpProjectId || legacy.gcpAccessToken) {
            console.log("✅ Persistence: Legacy credentials recovered.");
            return legacy;
        }

        return null;
    },

    /**
     * Clear everything
     */
    clearSession: async function() {
        localStorage.removeItem('acam_active_session');
        if (!this._db) await this.initDB();
        return new Promise((resolve) => {
            const transaction = this._db.transaction([this.STORE_NAME], "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);
            store.clear();
            transaction.oncomplete = () => resolve();
        });
    }
};
