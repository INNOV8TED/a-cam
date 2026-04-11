// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
window.MODELS = [
    { id: 'Veo', name: 'Veo 3', icon: '✦', color: '#4285f4', prefix: 'Cinematic video:', tags: ['photorealistic', 'cinematic'], suffix: 'Hollywood production value.' },
    { id: 'Kling', name: 'Kling 1.6', icon: '🎬', color: '#ff4444', prefix: '', tags: ['cinematic', 'dynamic'], suffix: '' },
    { id: 'Runway', name: 'Gen-3', icon: '🌊', color: '#00f2ff', prefix: '', tags: ['cinematic', 'professional'], suffix: '' },
    { id: 'Minimax', name: 'Minimax', icon: '🌪️', color: '#f59e0b', prefix: '', tags: ['cinematic', 'high-fidelity'], suffix: '' }
];

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const S_internal = {
  heroImage: null,
  heroImages: [],
  faceCloseup: null,  // High-res face for PulID identity lock
  faceLock: false,    // Use face close-up as end frame for identity preservation
  lens: '50mm Normal',
  angle: 'Eye Level',
  movement: 'Static',
  movementIntensity: 50,
  lighting: 'Natural Ambient',
  lightingIntensity: 70,
  isIndoor: true,
  timeOfDay: 12, // 0-24 hours
  sunDirection: 'east',
  dof: 'f/8.0 Sharp',  // Changed from Cinematic so background is visible
  targetModel: 'Veo',
  activeStoryboard: 0,
  activePreset: null,        // Current director preset
  aspectRatio: '16:9',
  resolution: '1080p',
  showRuleOfThirds: false,
  showSafeAreas: false,
  showCenterCrosshair: false,
  showGroundPlane: false,
  groundPlaneY: 0.85,    // Ground at 85% down from top
  horizonY: 0.35,        // Horizon at 35% down from top
  backgroundPlate: null,
  bgSourceMode: 'upload',    // 'upload' or 'imagine'
  sceneDescription: '',
  environmentPreset: null,
  subjectLayer: 'Primary subject',
  midgroundLayer: '',
  backgroundLayer: '',
  subjectPerformance: '',    // Kinetic action description
  // Transformed frames (stored after Transform to Real)
  transformedStartFrame: null,
  transformedEndFrame: null,
  // Atmosphere/Haze
  hazeAmount: 0,             // 0-100
  hazeColor: 'neutral',      // neutral, warm, cool, smoke
  activeTab: 'camera',
  // API Analysis State
  sceneAnalyzed: false,
  analysisDescription: '',
  rackFocus: 0, // -100 to 100
  shutterSpeed: 'Standard', // Fast, Standard, Slow
  filmStock: 'Clean Digital', // Clean Digital, 16mm Film, VHS, CCTV
  // Character Draggable Offsets
  charXOffset: 0,
  charXOffset: 0,
  charYOffset: 0,
  subjectAction: '',
  subjectOutfit: '',
  actionTimeline: ''
};


let renderTimeout = null;
window.S = new Proxy(S_internal, {
    set: function(target, property, value, receiver) {
        if (target[property] === value) return true;
        target[property] = value;
        
        // Track if this session has been "Populated" with work/restored data
        if (property !== '_isPopulated' && !window.__ACAM_LOADING__) {
            target._isPopulated = true;
        }

        // Auto-Save Trigger (Debounced)
        // 🔥 MULTI-TAB SAFETY: Only save if this tab has been populated (prevents empty tabs from nuking good sessions)
        if (window.Persistence && window.Persistence.saveSession && !window.__ACAM_LOADING__ && target._isPopulated) {
            if (window._saveTimeout) clearTimeout(window._saveTimeout);
            window._saveTimeout = setTimeout(() => {
                window.Persistence.saveSession(target);
            }, 1000); // 1 second debounce
        }

    if (typeof window.renderFrames === 'function') {
      if (renderTimeout) clearTimeout(renderTimeout);
      renderTimeout = setTimeout(() => {
        window.renderFrames();
        if (typeof window.generatePrompt === 'function') window.generatePrompt();
      }, 16);
    }
    return true;
  }
});
