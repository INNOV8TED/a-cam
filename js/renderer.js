
// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT PRESETS
// ═══════════════════════════════════════════════════════════════════════════
// Movement slider behavior configuration
// 'bidirectional' = joystick style (50 = center, 0 = left/down, 100 = right/up)
// 'linear' = standard 0-100 intensity
const MOVEMENT_CONFIG = {
  'Static': { type: 'linear', label: 'Intensity' },
  'Dolly Push In': { type: 'linear', label: 'Push distance' },
  'Dolly Pull Out': { type: 'linear', label: 'Pull distance' },
  'Dolly Zoom': { type: 'linear', label: 'Effect intensity' },
  'Pan Left/Right': { type: 'bidirectional', label: '← Left | Right →' },
  'Tilt Up/Down': { type: 'bidirectional', label: '↓ Down | Up ↑' },
  'Orbital Arc': { type: 'bidirectional', label: '← CCW | CW →' },
  'Tracking Shot': { type: 'bidirectional', label: '← Left | Right →' },
  'Crane Up': { type: 'linear', label: 'Height' },
  'Handheld': { type: 'linear', label: 'Shake intensity' },
  'Zoom In': { type: 'linear', label: 'Zoom amount' },
  'Snorricam': { type: 'linear', label: 'BG shake intensity' },
  'Dutch Roll': { type: 'bidirectional', label: '↶ CCW | CW ↷' }
};

const ENVIRONMENT_PRESETS = {
  'City Street Day': {
    description: 'Busy urban street at midday',
    midground: 'sidewalk with pedestrians, parked vehicles, storefronts',
    background: 'office buildings, city skyline, clear sky',
    lighting: 'Natural Ambient',
    timeOfDay: 12,
    isIndoor: false,
    plateUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&q=80'
  },
  'City Street Night': {
    description: 'Urban street at night with neon',
    midground: 'wet asphalt, car headlights, illuminated storefronts',
    background: 'buildings with lit windows, distant city lights',
    lighting: 'Hard Shadow Noir',
    timeOfDay: 22,
    isIndoor: false,
    plateUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1280&q=80'
  },
  'Office Interior': {
    description: 'Modern office with large windows',
    midground: 'desks, office chairs, computer monitors',
    background: 'floor-to-ceiling windows, city view beyond',
    lighting: 'Studio Key',
    isIndoor: true,
    plateUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&q=80'
  },
  'Living Room': {
    description: 'Contemporary living room',
    midground: 'sofa, coffee table, indoor plants',
    background: 'bookshelves, artwork, large windows',
    lighting: 'Natural Ambient',
    isIndoor: true,
    plateUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1280&q=80'
  },
  'Park / Nature': {
    description: 'Urban park or natural setting',
    midground: 'grass, park benches, walking paths',
    background: 'trees, distant hills, open sky',
    lighting: 'Natural Ambient',
    timeOfDay: 15,
    isIndoor: false,
    plateUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80'
  },
  'Golden Hour': {
    description: 'Outdoor scene at sunset',
    midground: 'long shadows, warm highlights',
    background: 'distant landscape, orange-pink sky',
    lighting: 'Natural Ambient',
    timeOfDay: 17.5,
    isIndoor: false,
    plateUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1280&q=80'
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// CINEMATOGRAPHY DATA
// ═══════════════════════════════════════════════════════════════════════════
const LENS_DATA = {
  '8mm Fisheye': { keywords: ['fisheye', 'action cam', 'extreme distortion', 'GoPro', 'barrel distortion'], type: 'fisheye', distortion: 0.4 },
  '12mm GoPro': { keywords: ['action cam', 'GoPro', 'POV', 'barrel distortion', 'extreme wide'], type: 'fisheye', distortion: 0.25 },
  '15mm Ultra Wide': { keywords: ['ultra wide angle', 'extreme perspective', 'environmental'] },
  '24mm Wide': { keywords: ['wide angle', 'establishing shot', 'environmental context'] },
  '35mm Standard': { keywords: ['35mm', 'natural perspective', 'documentary feel'] },
  '35mm Anamorphic': { keywords: ['anamorphic', 'cinematic', 'oval bokeh', 'lens flare', 'widescreen'], type: 'anamorphic', squeeze: 1.33 },
  '50mm Normal': { keywords: ['50mm', 'human eye perspective', 'natural'] },
  '50mm Anamorphic': { keywords: ['anamorphic', 'cinematic', 'oval bokeh', 'lens flare', 'portrait'], type: 'anamorphic', squeeze: 1.33 },
  '85mm f/1.4 Bokeh': { keywords: ['85mm', 'shallow DOF', 'portrait compression', 'bokeh'] },
  '135mm Telephoto': { keywords: ['telephoto compression', 'isolated subject', 'compressed background'] }
};

const ANGLE_DATA = {
  'Eye Level': { keywords: ['eye level', 'neutral perspective'] },
  'Low Angle Hero': { keywords: ['low angle', 'hero shot', 'empowering'] },
  'High Angle': { keywords: ['high angle', 'diminishing', 'overview'] },
  'Dutch Tilt': { keywords: ['dutch angle', 'tension', 'unease'] },
  "Bird's Eye": { keywords: ['birds eye', 'top down', 'overhead'] },
  "Worm's Eye": { keywords: ['worms eye', 'extreme low', 'dramatic'] }
};

const MOVEMENT_DATA = {
  'Static': { keywords: ['static shot', 'locked camera'] },
  'Dolly Push In': { keywords: ['dolly in', 'push in', 'approaching'] },
  'Dolly Pull Out': { keywords: ['dolly out', 'pull back', 'reveal'] },
  'Dolly Zoom': { keywords: ['dolly zoom', 'vertigo effect', 'background distortion'] },
  'Pan Left/Right': { keywords: ['pan', 'horizontal sweep'] },
  'Tilt Up/Down': { keywords: ['tilt', 'vertical movement'] },
  'Orbital Arc': { keywords: ['orbital', 'arc shot', 'circling'] },
  'Tracking Shot': { keywords: ['tracking', 'lateral movement', 'side track'] },
  'Crane Up': { keywords: ['crane up', 'ascending', 'rising'] },
  'Handheld': { keywords: ['handheld', 'documentary', 'organic shake'] },
  'Zoom In': { keywords: ['zoom in', 'push zoom', 'intensifying'] },
  'Snorricam': { keywords: ['body cam', 'POV', 'subjective', 'paranoid', 'Requiem'] },
  'Dutch Roll': { keywords: ['dutch angle', 'roll', 'disorientation', 'noir', 'expressionist'] }
};

const LIGHTING_DATA = {
  'Natural Ambient': { keywords: ['natural light', 'ambient', 'soft'], indoor: true, outdoor: true },
  'Soft Diffused': { keywords: ['soft light', 'diffused', 'flattering', 'overcast'], indoor: true, outdoor: true },
  'Hard Shadow Noir': { keywords: ['hard shadows', 'noir', 'high contrast', 'dramatic'], indoor: true, outdoor: true },
  'Backlit Silhouette': { keywords: ['backlit', 'silhouette', 'rim', 'halo'], indoor: true, outdoor: true },
  'Volumetric Fog': { keywords: ['volumetric', 'fog', 'god rays', 'atmospheric'], indoor: true, outdoor: true },
  'Studio Key': { keywords: ['studio lighting', 'key light', 'three-point', 'controlled'], indoor: true, outdoor: false },
  'Neon Rim Light': { keywords: ['neon', 'rim light', 'cyberpunk', 'edge lighting', 'night'], indoor: true, outdoor: false },
  'Practical Lights': { keywords: ['practical lights', 'motivated', 'in-frame sources', 'lamps'], indoor: true, outdoor: false }
};

const DOF_DATA = {
  'f/1.4 Razor Thin': { keywords: ['f/1.4', 'razor thin DOF', 'extreme bokeh'] },
  'f/2.0 Shallow': { keywords: ['f/2.0', 'shallow DOF', 'soft background'] },
  'f/2.8 Cinematic': { keywords: ['f/2.8', 'cinematic DOF', 'balanced blur'] },
  'f/4.0 Balanced': { keywords: ['f/4.0', 'balanced DOF', 'moderate depth'] },
  'f/5.6 Deep': { keywords: ['f/5.6', 'deep focus', 'background visible'] },
  'f/8.0 Sharp': { keywords: ['f/8.0', 'sharp', 'detailed'] },
  'f/11 Deep Focus': { keywords: ['f/11', 'deep focus', 'everything sharp'] }
};

// Studio background removal - simple saturation/brightness based
function removeStudioBackground(charCtx, charCanvas) {
  const charData = charCtx.getImageData(0, 0, charCanvas.width, charCanvas.height);
  const px = charData.data;
  const cw = charCanvas.width;
  const ch = charCanvas.height;
  
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4;
      const r = px[i], g = px[i+1], b = px[i+2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const brightness = (r + g + b) / 3;
      
      // Studio Gray: Low saturation, medium-high brightness
      // Tighter thresholds to avoid removing clothing
      if (saturation < 0.12 && brightness > 100 && brightness < 200) {
        // Full transparent for definite studio gray BG
        px[i+3] = 0;
      } else if (saturation < 0.18 && brightness > 90 && brightness < 210) {
        // Partial transparency for edge blending
        const satFactor = saturation / 0.18;
        px[i+3] = Math.floor(satFactor * 255);
      }
    }
  }
  charCtx.putImageData(charData, 0, 0);
}

/**
 * Advanced Lens Distortion: Warps the background for fisheye effects
 */
function drawWarpedBackground(ctx, img, x, y, w, h, distortion) {
  if (!img) return;
  if (distortion === 0) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  
  // 1. Create a workspace for the warp
  const workspace = document.createElement('canvas');
  workspace.width = w; workspace.height = h;
  const wctx = workspace.getContext('2d');
  wctx.drawImage(img, 0, 0, w, h);
  
  const srcData = wctx.getImageData(0, 0, w, h).data;
  const target = wctx.createImageData(w, h);
  const targetData = target.data;
  
  // 2. Perform the spherical warp
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const nx = (2 * dx / w) - 1;
      const ny = (2 * dy / h) - 1;
      const r = Math.sqrt(nx * nx + ny * ny);
      
      let f = 1;
      // Barrel Distortion Formula
      if (r < 1.0) f = 1.0 + distortion * (r * r - 1.0);
      
      const sx = Math.floor(((nx / f + 1) * w) / 2);
      const sy = Math.floor(((ny / f + 1) * h) / 2);
      
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        const si = (sy * w + sx) * 4;
        const di = (dy * w + dx) * 4;
        targetData[di] = srcData[si];
        targetData[di+1] = srcData[si+1];
        targetData[di+2] = srcData[si+2];
        targetData[di+3] = srcData[si+3];
      }
    }
  }
  
  wctx.putImageData(target, 0, 0);
  ctx.drawImage(workspace, x, y, w, h);
}

// Time of day calculations - continuous 0-24 hours
function getTimeData(hour) {
  // Returns: { name, colorTemp, sunAngle, intensity, keywords, overlayColor, overlayAlpha }
  
  if (hour >= 0 && hour < 5) {
    // Night / Midnight
    return { name: 'Night', colorTemp: 4000, sunAngle: -45, intensity: 0.15, 
             keywords: ['night', 'moonlit', 'dark blue ambient'],
             overlayColor: '#0f0c29', overlayAlpha: 0.5, blendMode: 'overlay' };
  } else if (hour >= 5 && hour < 6) {
    // Blue Hour (dawn)
    const t = (hour - 5);
    return { name: 'Blue Hour', colorTemp: 4000 + t * 1000, sunAngle: -10 + t * 15, intensity: 0.3 + t * 0.2,
             keywords: ['blue hour', 'pre-dawn', 'twilight', 'cool blue'],
             overlayColor: '#2c3e50', overlayAlpha: 0.35, blendMode: 'overlay' };
  } else if (hour >= 6 && hour < 8) {
    // Golden Hour (sunrise)
    const t = (hour - 6) / 2;
    return { name: 'Golden Hour', colorTemp: 2700 + t * 1000, sunAngle: 5 + t * 20, intensity: 0.5 + t * 0.3,
             keywords: ['golden hour', 'sunrise', 'warm golden light', 'magic hour', 'long shadows'],
             overlayColor: '#f7971e', overlayAlpha: 0.25, blendMode: 'soft-light' };
  } else if (hour >= 8 && hour < 10) {
    // Morning
    const t = (hour - 8) / 2;
    return { name: 'Morning', colorTemp: 3700 + t * 800, sunAngle: 25 + t * 20, intensity: 0.8 + t * 0.1,
             keywords: ['morning light', 'bright', 'fresh'],
             overlayColor: '#fff5e6', overlayAlpha: 0.1, blendMode: 'overlay' };
  } else if (hour >= 10 && hour < 14) {
    // Midday
    return { name: 'Midday', colorTemp: 5500, sunAngle: 70 + Math.sin((hour - 10) / 4 * Math.PI) * 20, intensity: 1.0,
             keywords: ['midday', 'overhead sun', 'neutral daylight', 'bright'],
             overlayColor: null, overlayAlpha: 0, blendMode: null };
  } else if (hour >= 14 && hour < 16) {
    // Afternoon
    const t = (hour - 14) / 2;
    return { name: 'Afternoon', colorTemp: 5500 - t * 500, sunAngle: 60 - t * 15, intensity: 0.95 - t * 0.1,
             keywords: ['afternoon light', 'warm'],
             overlayColor: '#fff5e6', overlayAlpha: 0.1, blendMode: 'overlay' };
  } else if (hour >= 16 && hour < 18) {
    // Golden Hour (sunset approaching)
    const t = (hour - 16) / 2;
    return { name: 'Golden Hour', colorTemp: 5000 - t * 2300, sunAngle: 45 - t * 25, intensity: 0.85 - t * 0.25,
             keywords: ['golden hour', 'warm golden light', 'magic hour', 'long shadows'],
             overlayColor: '#f7971e', overlayAlpha: 0.2 + t * 0.1, blendMode: 'soft-light' };
  } else if (hour >= 18 && hour < 19) {
    // Sunset
    const t = hour - 18;
    return { name: 'Sunset', colorTemp: 2700 - t * 400, sunAngle: 20 - t * 15, intensity: 0.6 - t * 0.2,
             keywords: ['sunset', 'orange sky', 'dramatic', 'warm'],
             overlayColor: '#ff6b35', overlayAlpha: 0.25 + t * 0.1, blendMode: 'soft-light' };
  } else if (hour >= 19 && hour < 20) {
    // Blue Hour (dusk)
    const t = hour - 19;
    return { name: 'Blue Hour', colorTemp: 2300 + t * 1700, sunAngle: 5 - t * 15, intensity: 0.4 - t * 0.15,
             keywords: ['blue hour', 'dusk', 'twilight', 'cool blue'],
             overlayColor: '#2c3e50', overlayAlpha: 0.3 + t * 0.1, blendMode: 'overlay' };
  } else {
    // Night
    return { name: 'Night', colorTemp: 4000, sunAngle: -30, intensity: 0.15,
             keywords: ['night', 'dark', 'moonlit', 'artificial light'],
             overlayColor: '#0f0c29', overlayAlpha: 0.45, blendMode: 'overlay' };
  }
}

const ASPECT_RATIOS = {
  '2.39:1': { ratio: 2.39, keywords: 'Aspect Ratio 2.39:1, anamorphic widescreen, cinematic letterbox' },
  '1.85:1': { ratio: 1.85, keywords: 'Aspect Ratio 1.85:1, flat widescreen, theatrical framing' },
  '16:9': { ratio: 16/9, keywords: 'Aspect Ratio 16:9, widescreen, HD standard' },
  '4:3': { ratio: 4/3, keywords: 'Aspect Ratio 4:3, classic television, vintage framing' },
  '1:1': { ratio: 1, keywords: 'Aspect Ratio 1:1, square framing, centralized composition' },
  '9:16': { ratio: 9/16, keywords: 'Aspect Ratio 9:16, vertical portrait mode, mobile-first framing' }
};

const RESOLUTIONS = {
  '720p': { width: 1280, height: 720, label: '720p Draft' },
  '1080p': { width: 1920, height: 1080, label: '1080p HD' },
  '2K': { width: 2560, height: 1440, label: '2K QHD' },
  '4K': { width: 3840, height: 2160, label: '4K UHD' }
};

// Director config is managed in api.js

// ═══════════════════════════════════════════════════════════════════════════
// DIRECTOR PRESETS — Iconic Camera Moves
// ═══════════════════════════════════════════════════════════════════════════
const DIRECTOR_PRESETS = {
  'The Jaws': {
    desc: 'Dolly Zoom (Vertigo)',
    lens: '35mm Standard',
    lensEnd: '85mm f/1.4 Bokeh',
    angle: 'Eye Level',
    movement: 'Dolly Zoom',
    movementIntensity: 85,
    dof: 'f/2.8 Controlled',
    shutterSpeed: 'Standard',
    filmStock: '16mm Film',
    icon: '🦈'
  },
  'The Bay': {
    desc: 'Low Hero Orbit',
    lens: '24mm Wide',
    angle: 'Low Angle Hero',
    movement: 'Orbital Arc',
    movementIntensity: 80,
    dof: 'f/4.0 Balanced',
    shutterSpeed: 'Fast',
    filmStock: 'Clean Digital',
    icon: '🚁'
  },
  'The Wes': {
    desc: 'Planar Slide',
    lens: '35mm Standard',
    angle: 'Eye Level',
    movement: 'Tracking Shot',
    movementIntensity: 70,
    dof: 'f/5.6 Deep',
    lighting: 'Natural Ambient',
    shutterSpeed: 'Standard',
    filmStock: 'Clean Digital',
    icon: '🎭'
  },
  'The Hitchcock': {
    desc: 'High Suspense',
    lens: '24mm Wide',
    angle: 'High Angle',
    movement: 'Dolly Push In',
    movementIntensity: 75,
    dof: 'f/2.8 Controlled',
    lighting: 'Hard Shadow Noir',
    shutterSpeed: 'Standard',
    filmStock: '16mm Film',
    icon: '🔪'
  },
  'The Snyder': {
    desc: 'Action Snap',
    lens: '50mm Normal',
    angle: 'Low Angle Hero',
    movement: 'Zoom In',
    movementIntensity: 90,
    dof: 'f/2.0 Smooth',
    shutterSpeed: 'Fast',
    filmStock: 'Clean Digital',
    icon: '⚡'
  },
  'The Fincher': {
    desc: 'Clinical Reveal',
    lens: '35mm Standard',
    angle: 'Eye Level',
    movement: 'Tilt Up/Down',
    movementIntensity: 60,
    dof: 'f/4.0 Balanced',
    lighting: 'Hard Shadow Noir',
    shutterSpeed: 'Standard',
    filmStock: 'Clean Digital',
    icon: '🎬'
  }
};


// ═══════════════════════════════════════════════════════════════════════════
// CONTROL UPDATES
// ═══════════════════════════════════════════════════════════════════════════
function updateLens() {
  S.lens = document.getElementById('lensSelect').value;
  document.getElementById('lensValue').textContent = S.lens.split(' ')[0];
  updateAll();
}

function updateAngle() {
  S.angle = document.getElementById('angleSelect').value;
  document.getElementById('angleValue').textContent = S.angle.replace(' Hero','').split(' ')[0];
  updateAll();
}

function updateFaceLock() {
  const checkbox = document.getElementById('faceLockToggle');
  const toggle = checkbox.closest('.face-lock-toggle');
  
  // Check if face close-up is available
  if (!S.faceCloseup) {
    checkbox.checked = false;
    S.faceLock = false;
    toggle.classList.add('disabled');
    toggle.title = 'Upload a Face Close-Up image first';
    showToast("⚠️ Upload a Face Close-Up to enable Face Lock", 2000);
    return;
  }
  
  toggle.classList.remove('disabled');
  S.faceLock = checkbox.checked;
  
  if (S.faceLock) {
    showToast("🎯 Face Lock ON: High-res face will be used as end frame", 2000);
    console.log("🎯 Face Lock enabled - face close-up will be sent as end frame");
  } else {
    console.log("🎯 Face Lock disabled");
  }
}

function updateMovement() {
  S.movement = document.getElementById('movementSelect').value;
  document.getElementById('movementValue').textContent = S.movement.split(' ')[0];
  
  // Reset slider based on movement type
  const config = MOVEMENT_CONFIG[S.movement] || { type: 'linear' };
  const slider = document.getElementById('movementIntensity');
  
  if (config.type === 'bidirectional') {
    // Joystick: start at center (50)
    slider.value = 50;
    S.movementIntensity = 50;
    slider.title = config.label || '← Left | Center | Right →';
  } else {
    // Linear: start at reasonable default
    slider.value = S.movement === 'Static' ? 0 : 70;
    S.movementIntensity = S.movement === 'Static' ? 0 : 70;
    slider.title = config.label || 'Intensity';
  }
  
  updateAll();
}

function updateLighting() {
  S.lighting = document.getElementById('lightingSelect').value;
  document.getElementById('lightingValue').textContent = S.lighting.split(' ')[0];
  updateAll();
}

function updateLightingIntensity() {
  S.lightingIntensity = +document.getElementById('lightingIntensity').value;
  document.getElementById('lightingIntensityValue').textContent = S.lightingIntensity + '%';
  renderFrames();
  generatePrompt();
}

function updateDOF() {
  S.dof = document.getElementById('dofSelect').value;
  document.getElementById('dofValue').textContent = S.dof.split(' ')[0];
  updateAll();
}

function setShutterSpeed(speed) {
  S.shutterSpeed = speed;
  document.getElementById('shutterValue').textContent = speed;
  // Update chip active states
  document.querySelectorAll('.shutter-chip').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'shutter' + speed);
  });
  updateAll();
}

function updateFilmStock() {
  S.filmStock = document.getElementById('filmStockSelect').value;
  document.getElementById('filmStockValue').textContent = S.filmStock;
  updateAll();
}

function updateHaze() {
  S.hazeAmount = +document.getElementById('hazeSlider').value;
  document.getElementById('hazeValue').textContent = S.hazeAmount + '%';
  // Update chip active states
  document.querySelectorAll('#hazeClear, #hazeMist, #hazeFog, #hazeSmoke').forEach(c => c.classList.remove('active'));
  renderFrames();
  generatePrompt();
}

function setHazePreset(preset) {
  const presets = {
    'clear': { amount: 0, color: 'neutral' },
    'mist': { amount: 25, color: 'cool' },
    'fog': { amount: 50, color: 'neutral' },
    'smoke': { amount: 70, color: 'warm' }
  };
  const p = presets[preset] || presets.clear;
  S.hazeAmount = p.amount;
  S.hazeColor = p.color;
  document.getElementById('hazeSlider').value = p.amount;
  document.getElementById('hazeValue').textContent = p.amount + '%';
  // Update chip active states
  document.querySelectorAll('#hazeClear, #hazeMist, #hazeFog, #hazeSmoke').forEach(c => c.classList.remove('active'));
  document.getElementById('haze' + preset.charAt(0).toUpperCase() + preset.slice(1)).classList.add('active');
  renderFrames();
  generatePrompt();
}

function setEnvironmentMode(mode) {
  S.isIndoor = (mode === 'indoor');
  document.getElementById('modeIndoor').classList.toggle('active', S.isIndoor);
  document.getElementById('modeOutdoor').classList.toggle('active', !S.isIndoor);
  document.getElementById('timeGroup').classList.toggle('disabled', S.isIndoor);
  document.getElementById('sunDirectionGroup').classList.toggle('disabled', S.isIndoor);
  updateAll();
}

function updateTimeOfDay() {
  S.timeOfDay = +document.getElementById('timeSlider').value;
  const timeData = getTimeData(S.timeOfDay);
  
  // Format time display
  const hours = Math.floor(S.timeOfDay);
  const mins = (S.timeOfDay % 1) * 60;
  document.getElementById('timeValue').textContent = `${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0').slice(0,2)}`;
  
  // Update sun info
  document.getElementById('sunPosition').textContent = `☀ ${timeData.name}`;
  document.getElementById('colorTemp').textContent = `${timeData.colorTemp}K`;
  
  renderFrames();
  generatePrompt();
}

function setSunDirection(dir) {
  S.sunDirection = dir;
  document.getElementById('sunEast').classList.toggle('active', dir === 'east');
  document.getElementById('sunWest').classList.toggle('active', dir === 'west');
  renderFrames();
  generatePrompt();
}

function updateAll() {
  S.movementIntensity = +document.getElementById('movementIntensity').value;
  S.lightingIntensity = +document.getElementById('lightingIntensity').value;
  renderStoryboard();
  renderFrames();
  generatePrompt();
}

// Legacy function - kept for compatibility but Director Presets now use applyDirectorPreset()
function selectStoryboard(idx) {
  // No longer used - Director Presets handle this via applyDirectorPreset()
  console.log('selectStoryboard is deprecated, use applyDirectorPreset() instead');
}

function selectModel(model) {
  S.targetModel = model;
  renderModelBadges();
  generatePrompt();
  
  // Trigger Fal render if api.js is loaded
  if (typeof renderToFal === 'function') {
    renderToFal(model);
  }
}

function renderModelBadges() {
  const badges = document.getElementById('modelBadges');
  const icons = {
    'Kling': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4V20M4 12H12M12 4L4 12L12 20M20 4L12 12L20 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'Runway': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'Veo': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5"/><path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };

  badges.innerHTML = Object.keys(MODELS).map(m => `
    <div class="model-badge ${S.targetModel === m ? 'active' : ''}" 
         id="btn-${m.toLowerCase()}"
         onclick="selectModel('${m}')">
      <span class="model-icon">${icons[m] || ''}</span>
      <span class="model-name">${m}</span>
      <span class="model-spinner"></span>
    </div>
  `).join('');
}


// ═══════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════
const PRESETS = {
  hero: { lens: '85mm f/1.4 Bokeh', angle: 'Low Angle Hero', movement: 'Orbital Arc', lighting: 'Natural Ambient', dof: 'f/1.4 Razor Thin', timeOfDay: 17.5, isIndoor: false },
  cinematic: { lens: '35mm Standard', angle: 'Eye Level', movement: 'Dolly Push In', lighting: 'Natural Ambient', dof: 'f/2.8 Cinematic', timeOfDay: 12, isIndoor: false },
  dramatic: { lens: '24mm Wide', angle: 'Dutch Tilt', movement: 'Crane Up', lighting: 'Hard Shadow Noir', dof: 'f/4.0 Balanced', timeOfDay: 22, isIndoor: false },
  intimate: { lens: '85mm f/1.4 Bokeh', angle: 'Eye Level', movement: 'Static', lighting: 'Soft Diffused', dof: 'f/2.0 Shallow', timeOfDay: 9, isIndoor: true },
  action: { lens: '24mm Wide', angle: 'Low Angle Hero', movement: 'Handheld', lighting: 'Natural Ambient', dof: 'f/5.6 Deep', timeOfDay: 12, isIndoor: false },
  noir: { lens: '50mm Normal', angle: 'High Angle', movement: 'Static', lighting: 'Hard Shadow Noir', dof: 'f/2.8 Cinematic', timeOfDay: 23, isIndoor: false }
};

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  
  // Apply standard controls
  ['lens', 'angle', 'movement', 'lighting', 'dof'].forEach(key => {
    if (p[key]) {
      S[key] = p[key];
      const select = document.getElementById(key + 'Select');
      const value = document.getElementById(key + 'Value');
      if (select) select.value = p[key];
      if (value) value.textContent = p[key].split(' ')[0];
    }
  });
  
  // Apply time of day
  if (p.timeOfDay !== undefined) {
    S.timeOfDay = p.timeOfDay;
    document.getElementById('timeSlider').value = p.timeOfDay;
    updateTimeOfDay();
  }
  
  // Apply environment mode
  if (p.isIndoor !== undefined) {
    setEnvironmentMode(p.isIndoor ? 'indoor' : 'outdoor');
  }
  
  updateAll();
  showToast(`Applied: ${name}`);
}


// ═══════════════════════════════════════════════════════════════════════════
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════
function getIntensityWord(val) {
  if (val < 25) return 'subtle';
  if (val < 50) return 'moderate';
  if (val < 75) return 'dynamic';
  return 'intense';
}

function generatePrompt() {
  if (!S.heroImage) return;
  
  const model = MODELS[S.targetModel];
  const lens = LENS_DATA[S.lens] || LENS_DATA['35mm Standard'];
  const angle = ANGLE_DATA[S.angle] || ANGLE_DATA['Eye Level'];
  const lighting = LIGHTING_DATA[S.lighting] || LIGHTING_DATA['Natural Ambient'];
  const dof = DOF_DATA[S.dof] || DOF_DATA['f/2.8 Cinematic'];
  const aspectRatio = ASPECT_RATIOS[S.aspectRatio] || ASPECT_RATIOS['16:9'];
  const resolution = RESOLUTIONS[S.resolution] || RESOLUTIONS['1080p'];
  
  // Get time data from continuous slider
  const timeData = getTimeData(S.timeOfDay);
  
  const intensity = getIntensityWord(S.movementIntensity);
  
  // Use AI analysis if available
  let sceneDesc = S.analysisDescription || 'Central subject with professional composition.';
  
  // Build keywords
  const keywords = [
    ...lens.keywords.slice(0, 2),
    ...angle.keywords.slice(0, 2),
    ...dof.keywords.slice(0, 1),
    ...lighting.keywords.slice(0, 2),
    ...(model && model.tags ? model.tags : [])
  ];
  
  // Add special lens type keywords
  if (lens.type === 'fisheye') {
    keywords.push('barrel distortion', 'extreme POV', 'action cam perspective');
  } else if (lens.type === 'anamorphic') {
    keywords.push('anamorphic bokeh', 'horizontal lens flare', 'cinema widescreen', 'oval highlights');
  }
  
  // Add atmospheric haze keywords
  if (S.hazeAmount > 0) {
    if (S.hazeAmount < 30) {
      keywords.push('light atmospheric haze', 'subtle fog');
    } else if (S.hazeAmount < 60) {
      keywords.push('volumetric fog', 'misty atmosphere', 'z-depth haze');
    } else {
      keywords.push('dense fog', 'heavy atmosphere', 'obscured background', 'mystery');
    }
    if (S.hazeColor === 'warm') keywords.push('warm smoke', 'golden haze');
    if (S.hazeColor === 'cool') keywords.push('cool mist', 'morning fog');
  }
  
  // Add Snorricam/Dutch Roll keywords
  if (S.movement === 'Snorricam') {
    keywords.push('body mounted camera', 'subjective POV', 'paranoid tension', 'Requiem style');
  } else if (S.movement === 'Dutch Roll') {
    keywords.push('dutch angle', 'canted frame', 'expressionist', 'disorienting');
  }
  
  // Add time-based keywords only for outdoor
  if (!S.isIndoor) {
    keywords.push(...timeData.keywords.slice(0, 2));
    if (S.sunDirection === 'east' && timeData.name !== 'Midday' && timeData.name !== 'Night') {
      keywords.push('morning light');
    } else if (S.sunDirection === 'west' && timeData.name !== 'Midday' && timeData.name !== 'Night') {
      keywords.push('evening light');
    }
  }
  
  // === THE 90% RULE: Performance Kinetic Metadata ===
  let performanceKinetics = '';
  if (S.subjectPerformance && S.subjectPerformance.trim()) {
    const perf = S.subjectPerformance.toLowerCase();
    performanceKinetics = S.subjectPerformance.trim();
    
    // Add physics descriptors based on action keywords
    if (perf.includes('run') || perf.includes('sprint')) {
      performanceKinetics += ', hair trailing, muscles tensed, motion blur on limbs, high-shutter speed tracking';
    }
    if (perf.includes('walk') || perf.includes('stride')) {
      performanceKinetics += ', natural gait, subtle motion blur, rhythmic movement';
    }
    if (perf.includes('jump') || perf.includes('leap')) {
      performanceKinetics += ', airborne moment, gravity defying pose, dynamic tension';
    }
    if (perf.includes('fall') || perf.includes('collapse')) {
      performanceKinetics += ', descending motion, loss of control, impact anticipation';
    }
    if (perf.includes('fight') || perf.includes('punch') || perf.includes('kick')) {
      performanceKinetics += ', explosive force, impact frame, kinetic energy transfer';
    }
    if (perf.includes('terror') || perf.includes('fear') || perf.includes('panic')) {
      performanceKinetics += ', dilated pupils, tense body language, survival instinct';
    }
    if (perf.includes('anger') || perf.includes('rage')) {
      performanceKinetics += ', aggressive posture, intense expression, coiled energy';
    }
    if (perf.includes('cry') || perf.includes('sob') || perf.includes('tears')) {
      performanceKinetics += ', glistening eyes, emotional vulnerability, trembling';
    }
  }
  
  // Build lighting/time description
  let lightingDesc = S.lighting;
  if (!S.isIndoor && S.lightingIntensity > 30) {
    lightingDesc += `, ${timeData.name.toLowerCase()}`;
    if (timeData.colorTemp < 4000) {
      lightingDesc += ' (warm ' + timeData.colorTemp + 'K)';
    } else if (timeData.colorTemp > 5500) {
      lightingDesc += ' (cool ' + timeData.colorTemp + 'K)';
    }
  }
  
  const parts = [
    model.prefix,
    aspectRatio.keywords + '.',
    sceneDesc,
    performanceKinetics ? `Subject action: ${performanceKinetics}.` : '',
    `${S.lens} lens, ${S.dof.split(' ')[0]} aperture.`,
    `${S.angle} shot${S.movement !== 'Static' ? `, ${intensity} ${S.movement.toLowerCase()}` : ''}.`,
    `${lightingDesc}${S.isIndoor ? ' interior' : ' exterior'}.`,
    keywords.slice(0, 10).join(', ') + '.',
    `${resolution.label} render.`,
    model.suffix
  ].filter(Boolean);
  
  const promptBox = document.getElementById('promptBox');
  promptBox.textContent = parts.join(' ');
  promptBox.classList.toggle('has-analysis', S.sceneAnalyzed);
}


// ═══════════════════════════════════════════════════════════════════════════
// API INTEGRATION - GENERATE SCENE FROM TEXT
// ═══════════════════════════════════════════════════════════════════════════
async function generateSceneFromText() {
  if (!S.heroImage) { showToast('Upload hero image first'); return; }
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.textContent = '✦ Resizing...';

  try {
    // 🔧 Force 512px downscale to stay under Vercel's 4.5MB Edge limit
    const canvas = document.createElement('canvas');
    const MAX_DIM = 512;
    let w = S.heroImage.width, h = S.heroImage.height;
    if (w > h) { if (w > MAX_DIM) { h *= MAX_DIM / w; w = MAX_DIM; } }
    else { if (h > MAX_DIM) { w *= MAX_DIM / h; h = MAX_DIM; } }
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(S.heroImage, 0, 0, w, h);
    
    const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.5);
    const desc = document.getElementById('sceneDescInput').value || 'Cinematic composition';

    btn.textContent = '✦ Analyzing Scene...';
    updateAPIStatus('connecting');

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // FIX: Passing movement and angle so backend doesn't look for 'S'
      body: JSON.stringify({ 
        imageBase64: optimizedBase64, 
        cinematographyContext: desc,
        movement: S.movement,
        angle: S.angle,
        performance: S.subjectPerformance || ''
      })
    });

    const data = await response.json();
    if (data.description) {
      S.sceneAnalyzed = true;
      S.analysisDescription = data.description;
      document.getElementById('promptBox').textContent = data.description;
      document.getElementById('promptBox').classList.add('has-analysis');
      
      // 🧠 SMART SYNC: Identify subject and kill the "MiguelMX" ghost
      try {
        // Regex looks for text between "shot of " and the first comma
        const identified = data.description.match(/shot of (.*?),/)[1];
        if (identified) {
          const subjectName = identified.trim();
          S.subjectLayer = subjectName; // Update internal state
          const inputEl = document.getElementById('subjectInput');
          if (inputEl) inputEl.value = subjectName; // Update UI input
        }
      } catch (e) {
        console.log("Could not auto-extract subject name, keeping generic.");
      }

      showToast('✓ Director Brain Active');
      updateAPIStatus('connected');
      renderStoryboard();
      renderFrames();
    } else {
      throw new Error(data.error || 'Server error');
    }
  } catch (err) {
    updateAPIStatus('error');
    showToast(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = '✦ Generate Plate';
  }
}

function updateAPIStatus(status) {
  const indicator = document.getElementById('apiStatus');
  indicator.className = 'api-status ' + status;
  
  switch(status) {
    case 'connecting':
      indicator.textContent = '● CONNECTING...';
      break;
    case 'connected':
      indicator.textContent = '● GEMINI ACTIVE';
      break;
    case 'error':
      indicator.textContent = '● ERROR';
      break;
    default:
      indicator.textContent = '○ OFFLINE';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE TAB FUNCTIONS (VERTEX AI OUTPAINTING & ANCHORING)
// ═══════════════════════════════════════════════════════════════════════════

// 1. Send to Vertex AI for genuine generative outpainting with dynamic masking
async function generateExpandedBackground(base64Image) {
  showToast('Preparing Spatial Assets for AI...');
  
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { 
      img.onload = resolve; 
      img.onerror = reject;
      img.src = base64Image; 
    });
    
// 🔥 SUPER-PADDING & SMART DOWNSCALE
    const MAX_SIZE = 1280; // Slightly increased to maintain quality with the massive new canvas
    const longestSide = Math.max(img.width, img.height);
    
    // Multiply by 1.5 to guarantee massive generation space on ALL 4 sides
    let size = Math.floor(longestSide * 1.5);
    let scale = 1.0;
    
    if (size > MAX_SIZE) {
      scale = MAX_SIZE / size;
      size = MAX_SIZE;
    }
    
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = (size - drawW) / 2;
    const dy = (size - drawH) / 2;
    
    // Canvas A: The Padded Base Image (Original centered on massive black dome)
    const paddedCanvas = document.createElement('canvas');
    paddedCanvas.width = size; paddedCanvas.height = size;
    const pCtx = paddedCanvas.getContext('2d');
    pCtx.fillStyle = '#000000';
    pCtx.fillRect(0, 0, size, size);
    pCtx.drawImage(img, dx, dy, drawW, drawH);
    
    // Canvas B: The Outpaint Mask 
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = size; maskCanvas.height = size;
    const mCtx = maskCanvas.getContext('2d');
    
    // White = \"Generate new environment here\" (The entire padded area)
    mCtx.fillStyle = '#FFFFFF'; 
    mCtx.fillRect(0, 0, size, size);
    
    // Black = \"Keep the original pixels\" (The central protected area)
    mCtx.fillStyle = '#000000';
    
    // Pro-VFX Trick: Shrink the black protection box by a few pixels (Dilation/Overlap)
    // This overlap allows the AI to blend the seam seamlessly.
    const overlapPx = 8; // Adjust this if seams are visible (4-12px is common)
    const protectW = Math.max(0, drawW - (2 * overlapPx));
    const protectH = Math.max(0, drawH - (2 * overlapPx));
    const protectX = dx + overlapPx;
    const protectY = dy + overlapPx;
    
    mCtx.fillRect(protectX, protectY, protectW, protectH);
    
    // Extract both as compressed JPEGs (0.8 quality for efficiency)
    const paddedBase64 = paddedCanvas.toDataURL('image/jpeg', 0.8);
    const maskBase64 = maskCanvas.toDataURL('image/jpeg', 0.8);

    showToast('Expanding Environment Dome (Vertex AI)...');
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageBase64: paddedBase64,  // The new 1:1 padded dome
        maskBase64: maskBase64,     // The new protection mask
        cinematographyContext: document.getElementById('sceneDescInput')?.value || 'Professional cinematic environment',
        analyzeType: 'outpaint' 
      })
    });
    
    const data = await response.json();
    if (data.outpaintedImage) {
      return "data:image/jpeg;base64," + data.outpaintedImage;
    }
  } catch (e) { 
    console.error('Outpainting error:', e);
  }
  return null;
}

// 2. Handle upload, trigger outpaint, then analyze the final composite
function handleBgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = async function() {
      S.backgroundPlateOriginal = img;
      S.backgroundPlate = img;
      
      // Update UI
      document.getElementById('bgPlateImage').src = evt.target.result;
      document.getElementById('bgPlateImage').style.display = 'block';
      document.getElementById('bgUploadZone').classList.add('has-image');
      document.getElementById('bgActionRow').style.display = 'flex'; // Show action buttons
      
      S.environmentPreset = null;
      renderEnvPresets();
      renderFrames();
      generatePrompt();
      showToast('🔍 Analyzing scene layers...');
      
      // Analyze for depth layers using new background_layers type
      try {
        console.log('📷 Background analysis: Sending image to API...');
        console.log('📷 Image size:', evt.target.result.length, 'chars');
        
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: evt.target.result,
            analyzeType: 'background_layers'
          })
        });
        
        console.log('📷 API response status:', response.status);
        const result = await response.json();
        // console.log('📷 Background analysis result:', result);
        
        // Populate Location Description automatically from analysis
        if (result.description || result.location) {
          const locationVal = result.description || result.location;
          const locInput = document.getElementById('sceneDescInput');
          if (locInput) {
            locInput.value = locationVal; 
            updateSceneDescription(); // Sync to state
          }
        }
        
        // Accept layer data regardless of 'analyzed' flag (fallback values are still useful)
        if (result.foreground || result.midground || result.background) {
          // Update horizon and ground plane
          if (result.horizonY) {
            S.horizonY = parseFloat(result.horizonY);
          }
          if (result.groundY) {
            S.groundPlaneY = parseFloat(result.groundY);
          }
          
          // Populate the three layer text boxes
          if (result.foreground) {
            const fgInput = document.getElementById('subjectInput');
            if (fgInput) fgInput.value = result.foreground;
            S.foregroundLayer = result.foreground;
          }
          if (result.midground) {
            const mgInput = document.getElementById('midgroundInput');
            if (mgInput) mgInput.value = result.midground;
            S.midgroundLayer = result.midground;
          }
          if (result.background) {
            const bgInput = document.getElementById('backgroundInput');
            if (bgInput) bgInput.value = result.background;
            S.backgroundLayer = result.background;
          }
          
          // Update lighting
          if (result.lightingDir && result.lightingDir !== 'ambient') {
            S.sunDirection = result.lightingDir === 'left' ? 'west' : 'east';
          }
          if (result.timeOfDay) {
            S.sceneTimeOfDay = result.timeOfDay;
          }
          
          renderFrames();
          generatePrompt();
          showToast('✓ AI ANALYZED: Scene layers mapped');
        } else {
          showToast('Background loaded - click Analyze & Outpaint for best results');
        }
      } catch (err) {
        console.error('❌ Background analysis error:', err);
        console.error('❌ Error message:', err.message);
        showToast('Background loaded - manual layer input available');
      }
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function updateSceneDescription() {
  S.sceneDescription = document.getElementById('sceneDescInput').value;
}

function updatePerformance() {
  const perfInput = document.getElementById('performanceInput') || document.getElementById('subjectAction');
  if (perfInput) {
    S.subjectPerformance = perfInput.value;
    generatePrompt();
  }
}

function setBgSource(mode) {
  S.bgSourceMode = mode;
  document.getElementById('srcUpload').classList.toggle('active', mode === 'upload');
  document.getElementById('srcImagine').classList.toggle('active', mode === 'imagine');
  document.getElementById('uploadModePanel').style.display = mode === 'upload' ? 'block' : 'none';
  document.getElementById('imagineModePanel').style.display = mode === 'imagine' ? 'block' : 'none';
}

async function analyzeAndOutpaint() {
  if (!S.backgroundPlate) {
    showToast('Upload a background first');
    return;
  }
  
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.textContent = '◎ Processing...';
  
  // Show progress overlay
  showProgress('OUTPAINTING BACKGROUND', 'Preparing image...', 10);
  
  try {
    // 0. PRE-SCALE TO BYPASS VERCEL LIMIT
    updateProgress('Scaling image...', 20);
    const MAX_DIM = 800; 
    let scale = 1;
    if (S.backgroundPlate.width > MAX_DIM || S.backgroundPlate.height > MAX_DIM) {
        scale = Math.min(MAX_DIM / S.backgroundPlate.width, MAX_DIM / S.backgroundPlate.height);
    }
    const scaledW = Math.floor(S.backgroundPlate.width * scale);
    const scaledH = Math.floor(S.backgroundPlate.height * scale);

    const scaledBgCanvas = document.createElement('canvas');
    scaledBgCanvas.width = scaledW;
    scaledBgCanvas.height = scaledH;
    scaledBgCanvas.getContext('2d').drawImage(S.backgroundPlate, 0, 0, scaledW, scaledH);

    // 1. MODERATE EXPANSION
    updateProgress('Creating extension canvas...', 30);
    const extendRatio = 0.25; // uniform, moderate expansion

    const extW = (scaledW * (1 + extendRatio * 2)) | 0;
    const extH = (scaledH * (1 + extendRatio * 2)) | 0;
    const offsetX = ((extW - scaledW) / 2) | 0;
    const offsetY = ((extH - scaledH) / 2) | 0;
    
    // Create padded image
    const paddedCanvas = document.createElement('canvas');
    paddedCanvas.width = extW;
    paddedCanvas.height = extH;
    const pCtx = paddedCanvas.getContext('2d');
    pCtx.fillStyle = '#808080'; // neutral gray fill
    pCtx.fillRect(0, 0, extW, extH);
    pCtx.drawImage(scaledBgCanvas, offsetX, offsetY);
    
    // Create simple mask - white = fill, black = keep
    updateProgress('Building outpaint mask...', 40);
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = extW;
    maskCanvas.height = extH;
    const maskCtx = maskCanvas.getContext('2d');
    
    // White background (areas to generate)
    maskCtx.fillStyle = '#ffffff';
    maskCtx.fillRect(0, 0, extW, extH);
    
    // Black center (original image to keep) - with small inset for blending
    const inset = 8;
    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(offsetX + inset, offsetY + inset, scaledW - inset * 2, scaledH - inset * 2);
    
    const imageBase64 = paddedCanvas.toDataURL('image/png');
    const maskBase64 = maskCanvas.toDataURL('image/png');
    
    updateProgress('Calling Vertex AI...', 50);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        maskBase64,
        analyzeType: 'outpaint',
        cinematographyContext: S.sceneDescription || 'cinematic environment'
      })
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "AI Analysis Failed");
    }
    
    updateProgress('Processing AI response...', 70);
    const result = await response.json();
    
    if (result.outpaintedImage && isValidOutpaint(result.outpaintedImage)) {
      updateProgress('Loading outpainted image...', 85);
      const img = new Image();
      img.onload = async function() {
        S.backgroundPlate = img;
        document.getElementById('bgPlateImage').src = result.outpaintedImage.startsWith('data:') 
          ? result.outpaintedImage 
          : `data:image/png;base64,${result.outpaintedImage}`;
        
        // NOW analyze the outpainted image to get depth layers
        updateProgress('Analyzing scene depth...', 90);
        try {
          const analysisRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: img.src,
              analyzeType: 'background'
            })
          });
          const analysis = await analysisRes.json();
          if (analysis.analyzed) {
            // Fill in depth layers
            if (analysis.horizonY) S.horizonY = parseFloat(analysis.horizonY);
            if (analysis.groundY) S.groundPlaneY = parseFloat(analysis.groundY);
            if (analysis.midground) {
              S.midgroundLayer = analysis.midground;
              document.getElementById('midgroundInput').value = analysis.midground;
            }
            if (analysis.background) {
              S.backgroundLayer = analysis.background;
              document.getElementById('backgroundInput').value = analysis.background;
            }
            if (analysis.description && !analysis.description.includes('{')) {
              S.sceneDescription = analysis.description;
              document.getElementById('sceneDescInput').value = analysis.description;
            }
            if (analysis.lightingDir && analysis.lightingDir !== 'ambient') {
              S.sunDirection = analysis.lightingDir === 'left' ? 'west' : 'east';
            }
            if (analysis.environment === 'interior' || analysis.environment === 'studio') {
              setEnvironmentMode('indoor');
            } else {
              setEnvironmentMode('outdoor');
            }
          }
        } catch (analysisErr) {
          console.log('Depth analysis skipped:', analysisErr.message);
        }
        
        updateProgress('Complete!', 100);
        renderFrames();
        generatePrompt();
        hideProgress();
        showToast('✓ Background outpainted & analyzed!');
      };
      img.src = result.outpaintedImage.startsWith('data:') 
        ? result.outpaintedImage 
        : `data:image/png;base64,${result.outpaintedImage}`;
    } else {
      updateProgress('Using mirror fallback...', 80);
      const extendedBg = await extendBackgroundWithMirror(S.backgroundPlate, 0.5);
      S.backgroundPlate = extendedBg;
      renderFrames();
      hideProgress();
      showToast('Used mirror extension (AI unavailable)');
    }
  } catch (err) {
    console.error('Outpaint error:', err);
    hideProgress();
    showToast('Outpaint failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '◎ Analyze & Outpaint';
  }
}

function updateDepthLayers() {
  S.subjectLayer = document.getElementById('subjectInput').value;
  S.midgroundLayer = document.getElementById('midgroundInput').value;
  S.backgroundLayer = document.getElementById('backgroundInput').value;
  generatePrompt();
}

function applyEnvironmentPreset(name) {
  const preset = ENVIRONMENT_PRESETS[name];
  if (!preset) return;
  
  S.environmentPreset = name;
  S.sceneDescription = preset.description;
  S.midgroundLayer = preset.midground;
  S.backgroundLayer = preset.background;
  
  document.getElementById('sceneDescInput').value = preset.description;
  document.getElementById('midgroundInput').value = preset.midground;
  document.getElementById('backgroundInput').value = preset.background;
  
  if (preset.lighting) {
    S.lighting = preset.lighting;
    document.getElementById('lightingSelect').value = preset.lighting;
    document.getElementById('lightingValue').textContent = preset.lighting.split(' ')[0];
  }
  if (preset.timeOfDay !== undefined) {
    S.timeOfDay = preset.timeOfDay;
    document.getElementById('timeSlider').value = preset.timeOfDay;
    updateTimeOfDay();
  }
  if (preset.isIndoor !== undefined) {
    setEnvironmentMode(preset.isIndoor ? 'indoor' : 'outdoor');
  }
  
  // Load preset background plate if available
  if (preset.plateUrl) {
    showToast(`Loading ${name} background...`);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async function() {
      // Extend background with mirrored edges for rotations
      const extendedBg = await extendBackgroundWithMirror(img, 0.5);
      S.backgroundPlate = extendedBg;
      S.backgroundPlateOriginal = img;
      
      document.getElementById('bgPlateImage').src = img.src;
      document.getElementById('bgPlateImage').style.display = 'block';
      document.getElementById('bgUploadZone').classList.add('has-image');
      renderFrames();
      generatePrompt();
      showToast(`Applied: ${name}`);
    };
    img.onerror = function() {
      S.backgroundPlate = null;
      document.getElementById('bgPlateImage').style.display = 'none';
      document.getElementById('bgUploadZone').classList.remove('has-image');
      renderFrames();
      generatePrompt();
      showToast(`${name} (no background)`);
    };
    img.src = preset.plateUrl;
  } else {
    S.backgroundPlate = null;
    document.getElementById('bgPlateImage').style.display = 'none';
    document.getElementById('bgUploadZone').classList.remove('has-image');
    renderFrames();
    generatePrompt();
    showToast(`Applied: ${name}`);
  }
  
  renderEnvPresets();
  renderStoryboard();
}

function renderEnvPresets() {
  const container = document.getElementById('envPresets');
  if (!container) return;
  
  container.innerHTML = Object.entries(ENVIRONMENT_PRESETS).map(([name, data]) => `
    <div class="env-preset ${S.environmentPreset === name ? 'active' : ''}" onclick="applyEnvironmentPreset('${name}')">
      <div class="env-preset-name">${name}</div>
      <div class="env-preset-desc">${data.description.substring(0, 40)}...</div>
    </div>
  `).join('');
}


// ═══════════════════════════════════════════════════════════════════════════
// FRAME SETTINGS
// ═══════════════════════════════════════════════════════════════════════════
function setAspectRatio(ratio) {
  S.aspectRatio = ratio;
  document.getElementById('ratioValue').textContent = ratio;
  document.getElementById('outputRatio').textContent = ratio;
  renderRatioChips();
  renderStoryboard();
  renderFrames();
  generatePrompt();
  showToast(`Aspect ratio: ${ratio}`);
}

function setResolution(res) {
  S.resolution = res;
  document.getElementById('resValue').textContent = res;
  
  ['720p', '1080p', '2K', '4K'].forEach(r => {
    const id = 'res' + r.replace('p', '');
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', r === res);
  });
  
  const resData = RESOLUTIONS[res];
  if (resData) {
    document.getElementById('outputRes').textContent = `${resData.width}×${resData.height}`;
  }
  
  generatePrompt();
  showToast(`Resolution: ${RESOLUTIONS[res].label}`);
}

function toggleOverlay(key) {
  S[key] = !S[key];
  
  // Reveal sliders only when the Ground Plane guide is active
  if (key === 'showGroundPlane') {
    const pControls = document.getElementById('perspectiveControls');
    if (pControls) pControls.style.display = S.showGroundPlane ? 'block' : 'none';
    
    if (S.showGroundPlane) {
      document.getElementById('horizonSlider').value = Math.round(S.horizonY * 100);
      document.getElementById('horizonValueDisplay').textContent = Math.round(S.horizonY * 100) + '%';
      document.getElementById('groundSlider').value = Math.round(S.groundPlaneY * 100);
      document.getElementById('groundValueDisplay').textContent = Math.round(S.groundPlaneY * 100) + '%';
    }
  }
  
  renderStoryboard();
  renderFrames();
}

function updatePerspective(key, val) {
  const decimal = val / 100;
  S[key] = decimal;
  
  if (key === 'horizonY') {
    document.getElementById('horizonValueDisplay').textContent = val + '%';
  } else {
    document.getElementById('groundValueDisplay').textContent = val + '%';
  }
  
  renderFrames();   // Redraws the composite using the new anchor
  generatePrompt(); // Updates technical metadata
}

function renderRatioChips() {
  const container = document.getElementById('ratioChips');
  container.innerHTML = Object.keys(ASPECT_RATIOS).map(r => `
    <button class="chip ${S.aspectRatio === r ? 'active' : ''}" onclick="setAspectRatio('${r}')">${r}</button>
  `).join('');
}


// ═══════════════════════════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════════════════════════
function switchControlTab(tab) {
  S.activeTab = tab;
  
  document.querySelectorAll('.control-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === tab);
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const tabContent = document.getElementById(tab + 'Tab');
  if (tabContent) tabContent.classList.add('active');
}


// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════
function openInModel() {
  const model = MODELS[S.targetModel];
  if (model && model.url) {
    window.open(model.url, '_blank');
    showToast(`Opening ${S.targetModel}...`);
  }
}

function copyPrompt() {
  const text = document.getElementById('promptBox').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Prompt copied!');
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORM TO REAL — Master Keyframe Rendering (Naturalistic Engine)
// ═══════════════════════════════════════════════════════════════════════════
async function transformToReal() {
  if (!S.heroImage || !S.backgroundPlate) {
    showToast('Upload both subject and background first');
    return;
  }

  const btns = document.querySelectorAll('.btn-transform');
  btns.forEach(b => { b.disabled = true; b.textContent = '◎ Observing Scene...'; });
  showProgress('TRANSFORM TO REAL', 'Analyzing environmental data...', 10);

  try {
    const startCanvas = document.getElementById('startCanvas');
    const endCanvas = document.getElementById('endCanvas');

    // 1. THE NATURAL LANGUAGE WEAVER
    // We translate technical settings into real-world phenomena
    
    // Time & Sun Quality
    const timeValue = parseInt(S.timeOfDay);
    let timeDescription = "high noon with neutral, overhead sun";
    if (timeValue <= 7 || timeValue >= 19) timeDescription = "the blue hour, just before darkness with cool, ambient light";
    else if (timeValue <= 10) timeDescription = "early morning with long, soft shadows and crisp air";
    else if (timeValue >= 16) timeDescription = "the golden hour, with warm, low-angle sunlight hitting the textures";

    // Atmosphere & Air
    let airQuality = "crystal clear visibility";
    if (S.hazeAmount > 60) airQuality = "thick, heavy fog obscuring the distance";
    else if (S.hazeAmount > 20) airQuality = "a light morning mist hanging in the air";

    // Optics (Translating lens choice into "Visual Feel")
    const lensSize = parseInt(S.lens) || 50;
    let opticalFeel = "a natural eye-level perspective";
    if (lensSize <= 24) opticalFeel = "a vast, wide-angle view showing the entire environment";
    else if (lensSize >= 85) opticalFeel = "a highly focused view with a beautiful, soft-blurred background";

    // 2. BUILD THE PAYLOAD
    const payload = {
      startFrame: startCanvas.toDataURL('image/jpeg', 0.95), // Higher quality capture
      endFrame: endCanvas.toDataURL('image/jpeg', 0.95),
      
      // We pass the "Natural" descriptions to the API
      environmentalDirectives: {
        lighting: `${S.lighting} style, specifically during ${timeDescription}`,
        atmosphere: `The scene has ${airQuality}.`,
        optics: `Captured with ${opticalFeel} and ${S.dof > 50 ? 'heavy depth of field' : 'deep focus'}.`,
        sun: `Sunlight direction is coming from the ${S.sunDirection || 'standard'} position.`
      },

      // Grounding Data
      geometry: {
        feetY: S.groundPlaneY,
        horizonY: S.horizonY,
        characterScale: S.charScale || 0.85
      },

      resolution: S.resolution || '1080p',
      sceneDescription: S.sceneDescription || 'A photorealistic environment.',
      performance: S.subjectPerformance || ''
    };

    updateProgress('Transmitting to Vertex Master...', 40);

    const response = await fetch('/api/render-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API failed: ${response.status}`);
    
    const result = await response.json();
    
    if (result.success && result.startFrame) {
      updateProgress('Developing high-res frames...', 80);
      
      const loadRenderedFrame = (dataUrl, canvas) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext('2d');
            // We ensure the canvas handles the high-res data correctly
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = reject;
          img.src = dataUrl.startsWith('data:') ? dataUrl : `data:image/jpeg;base64,${dataUrl}`;
        });
      };

      await Promise.all([
        loadRenderedFrame(result.startFrame, startCanvas),
        loadRenderedFrame(result.endFrame, endCanvas)
      ]);

      S.transformedStartFrame = result.startFrame;
      S.transformedEndFrame = result.endFrame;
      
      updateProgress('Master Rendering Complete', 100);
      hideProgress();
      showToast('✓ High-Resolution Masters Created');
    }

  } catch (err) {
    console.error('Transform error:', err);
    hideProgress();
    showToast('Transform failed: ' + err.message);
  } finally {
    btns.forEach(b => { b.disabled = false; b.textContent = '✦ Transform to Real'; });
  }
}

async function saveStoryboard() {
  if (!S.heroImage) {
    showToast('No image to save');
    return;
  }
  
  showProgress('GENERATING CONTACT SHEET', 'Rendering high-fidelity frames...', 10);
  
  let sceneDesc = S.sceneDescription || document.getElementById('sceneDescInput')?.value || 'Cinematic scene';
  sceneDesc = sceneDesc.substring(0, 60);
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    
    // DYNAMIC RATIO MATH
    const ratioParts = S.aspectRatio.split(':');
    const ratioMultiplier = parseInt(ratioParts[1]) / parseInt(ratioParts[0]);
    const frameW = 640;
    const frameH = Math.floor(frameW * ratioMultiplier);
    
    canvas.height = Math.max(600, frameH + 240); 
    const ctx = canvas.getContext('2d');
    
    // Clean Architectural Background
    ctx.fillStyle = '#f2f0e9'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (typeof addPaperTexture === 'function') addPaperTexture(ctx, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 24px Space Grotesk'; 
    ctx.fillText('A-CAM DIRECTOR CONTACT SHEET', 100, 60);
    ctx.font = '300 14px Space Grotesk';
    ctx.fillStyle = '#666';
    ctx.fillText(`SCENE ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 1250, 60);
    
    const frame1X = 100;
    const frame2X = 860;
    const frameY = 130;
    
    updateProgress('Processing frames...', 40);
    const startCanvas = document.getElementById('startCanvas');
    const endCanvas = document.getElementById('endCanvas');

    // Frame 1
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.fillText('FRAME 01 / START', frame1X, frameY - 15);
    ctx.drawImage(startCanvas, frame1X, frameY, frameW, frameH);
    addCinematicOverlay(ctx, frame1X, frameY, frameW, frameH);

    // Frame 2
    ctx.fillText('FRAME 02 / END', frame2X, frameY - 15);
    ctx.drawImage(endCanvas, frame2X, frameY, frameW, frameH);
    addCinematicOverlay(ctx, frame2X, frameY, frameW, frameH);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(frame1X, frameY, frameW, frameH);
    ctx.strokeRect(frame2X, frameY, frameW, frameH);
    
    // Arrow
    updateProgress('Finalizing markers...', 70);
    const arrowX1 = frame1X + frameW + 25;
    const arrowX2 = frame2X - 25;
    const arrowY = frameY + (frameH / 2);
    
    ctx.strokeStyle = '#c33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowX1, arrowY);
    ctx.lineTo(arrowX2, arrowY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(arrowX2, arrowY);
    ctx.lineTo(arrowX2 - 10, arrowY - 5);
    ctx.lineTo(arrowX2 - 10, arrowY + 5);
    ctx.fillStyle = '#c33';
    ctx.fill();
    
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(S.movement.toUpperCase(), (arrowX1 + arrowX2) / 2, arrowY + 25);
    ctx.textAlign = 'left';

    // Footer
    const footerY = canvas.height - 50;
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillText('TECHNICAL SPECIFICATIONS:', 100, footerY - 20);
    
    ctx.font = '400 10px JetBrains Mono';
    ctx.fillStyle = '#666';
    ctx.fillText(`LENS: ${S.lens} | ANGLE: ${S.angle} | LIGHTING: ${S.lighting}`, 100, footerY);
    ctx.fillText(`ASPECT: ${S.aspectRatio} | RES: ${S.resolution} | FPS: 24`, 100, footerY + 15);
    
    ctx.textAlign = 'right';
    ctx.fillText(`© ${new Date().getFullYear()} IN-NO-V8 DIRECTOR`, 1500, footerY + 15);
    
    const link = document.createElement('a');
    link.download = `acam-contact-sheet-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    updateProgress('Complete!', 100);
    setTimeout(hideProgress, 500);
    showToast('Contact sheet exported!');
  } catch (err) {
    hideProgress();
    showToast('Export failed');
  }
}

// ... end of your saveStoryboard function ...

function addCinematicOverlay(ctx, x, y, w, h) {
    ctx.save();
    // Subtle darkening vignette for depth
    const grad = ctx.createRadialGradient(x+w/2, y+h/2, 0, x+w/2, y+h/2, w);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    
    // Professional "Safe Area" corner markers
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    const dotS = 2;
    const pad = 10;
    ctx.fillRect(x+pad, y+pad, dotS, dotS); // TL
    ctx.fillRect(x+w-pad, y+pad, dotS, dotS); // TR
    ctx.fillRect(x+pad, y+h-pad, dotS, dotS); // BL
    ctx.fillRect(x+w-pad, y+h-pad, dotS, dotS); // BR
    ctx.restore();
}

// Draw storyboard arrow between frames
function drawStoryboardArrow(ctx, x1, y, x2, movement) {
  const midX = (x1 + x2) / 2;
  
  ctx.save();
  ctx.strokeStyle = '#c33';
  ctx.fillStyle = '#c33';
  ctx.lineWidth = 3;
  
  // Arrow line
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  
  // Arrow head
  const headSize = 15;
  let direction = 1; // pointing right
  if (movement.includes('Pull Out')) direction = -1;
  
  ctx.beginPath();
  if (direction > 0) {
    ctx.moveTo(x2, y);
    ctx.lineTo(x2 - headSize, y - headSize/2);
    ctx.lineTo(x2 - headSize, y + headSize/2);
  } else {
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 + headSize, y - headSize/2);
    ctx.lineTo(x1 + headSize, y + headSize/2);
  }
  ctx.closePath();
  ctx.fill();
  
  // Movement label
  ctx.font = 'bold 14px JetBrains Mono';
  ctx.textAlign = 'center';
  const label = movement.toUpperCase().replace('DOLLY ', '');
  ctx.fillText(`◀ ${label}`, midX, y + 35);
  ctx.textAlign = 'left';
  
  ctx.restore();
}

// Get time period name
function getTimeName(hour) {
  if (hour < 5) return 'Night';
  if (hour < 6) return 'Blue Hour';
  if (hour < 8) return 'Golden Hour';
  if (hour < 10) return 'Morning';
  if (hour < 14) return 'Midday';
  if (hour < 16) return 'Afternoon';
  if (hour < 18) return 'Golden Hour';
  if (hour < 19) return 'Sunset';
  if (hour < 20) return 'Blue Hour';
  return 'Night';
}

// Render a frame composite and return as base64 data URL
async function renderFrameForStoryboard(frameType) {
  return new Promise((resolve) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1280;
    tempCanvas.height = 720;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    // Calculate settings for this frame
    const settings = { frameType };
    const intensity = S.movementIntensity / 100;
    
    if (frameType === 'end') {
      switch(S.movement) {
        case 'Dolly Push In':
        case 'Zoom In':
          settings.zoomLevel = 1.0 + (0.3 * intensity); // Constrained zoom
          break;
        case 'Dolly Pull Out':
          settings.zoomLevel = 1.0 - (0.25 * intensity);
          break;
      }
    }
    
    // Render the frame using existing logic
    const { w, h } = { w: 1280, h: 720 };
    const canvasRatio = w / h;
    
    // Clear
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, w, h);
    
    // Character dimensions with aspect-ratio-aware scaling
    const imgRatio = S.heroImage.width / S.heroImage.height;
    let charScale;
    if (canvasRatio >= 2.0) {
      charScale = 0.65;
    } else if (canvasRatio >= 1.7) {
      charScale = 0.72;
    } else if (canvasRatio >= 1.3) {
      charScale = 0.78;
    } else {
      charScale = 0.82;
    }
    
    let charH = h * charScale;
    let charW = charH * imgRatio;
    if (charW > w * 0.9) {
      charW = w * 0.9;
      charH = charW / imgRatio;
    }
    
    const feetX = w / 2;
    const groundY = Math.min(S.groundPlaneY || 0.88, 0.92);
    let feetY = h * groundY;
    
    // Ensure headroom
    const headY = feetY - charH;
    if (headY < h * 0.08) {
      feetY = charH + h * 0.08;
    }
    
    const charX = feetX - charW / 2;
    const charY = feetY - charH;
    
    // Scene scale
    let sceneScale = settings.zoomLevel || 1.0;
    
    ctx.save();
    if (sceneScale !== 1.0) {
      ctx.translate(feetX, feetY);
      ctx.scale(sceneScale, sceneScale);
      ctx.translate(-feetX, -feetY);
    }
    
// Draw background
    if (S.backgroundPlate) {
      const bgRatio = S.backgroundPlate.width / S.backgroundPlate.height;
      let bgW, bgH;
      if (bgRatio > w/h) {
        bgH = h * 1.4;
        bgW = bgH * bgRatio;
      } else {
        bgW = w * 1.4;
        bgH = bgW / bgRatio;
      }
      
      // 🔥 OPTICAL LENS ENGINE
      const currentLens = parseInt(settings.lens || S.lens || '50'); 
      let opticalZoom = 1.0;
      if (currentLens <= 15) { opticalZoom = 0.65; }
      else if (currentLens <= 24) { opticalZoom = 0.80; }
      else if (currentLens <= 35) { opticalZoom = 0.90; }
      else if (currentLens === 50) { opticalZoom = 1.00; }
      else if (currentLens <= 85) { opticalZoom = 1.25; }
      else if (currentLens <= 105) { opticalZoom = 1.45; }
      else if (currentLens >= 135) { opticalZoom = 1.70; }
      
      const finalBgScale = sceneScale * opticalZoom;
      const scaledBgW = bgW * finalBgScale;
      const scaledBgH = bgH * finalBgScale;
      
      const bgX = feetX - (scaledBgW / 2);
      const trueBgGroundY = scaledBgH * (S.groundPlaneY || 0.85);
      const bgY = feetY - trueBgGroundY;
      
      ctx.drawImage(S.backgroundPlate, bgX, bgY, scaledBgW, scaledBgH);
    }
    
    // Apply time/lighting grading
    applyTimeOfDayGrade(ctx, w, h, S.timeOfDay, S.isIndoor, S.sunDirection);
    applyLightingOverlay(ctx, w, h, S.lighting, S.lightingIntensity);
    
    // Draw character with BG removal
    const charCanvas = document.createElement('canvas');
    charCanvas.width = Math.ceil(charW);
    charCanvas.height = Math.ceil(charH);
    const charCtx = charCanvas.getContext('2d', { willReadFrequently: true });
    charCtx.drawImage(S.heroImage, 0, 0, charW, charH);
    
    // Smart background removal
    removeStudioBackground(charCtx, charCanvas);
    
    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.filter = 'blur(15px)';
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(feetX, feetY + 5, charW * 0.4, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw character
    ctx.drawImage(charCanvas, charX, charY);
    ctx.restore();
    
    resolve(tempCanvas.toDataURL('image/jpeg', 0.85));
  });
}

// Draw movement arrow between frames
function drawMovementArrow(ctx, x, y, size, movement) {
  ctx.save();
  ctx.fillStyle = '#c33';
  ctx.strokeStyle = '#c33';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  switch(movement) {
    case 'Dolly Push In':
    case 'Zoom In':
      // Arrow pointing right (into frame)
      ctx.moveTo(x, y - size/2);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size/2);
      break;
    case 'Dolly Pull Out':
      // Arrow pointing left (out of frame)
      ctx.moveTo(x + size, y - size/2);
      ctx.lineTo(x, y);
      ctx.lineTo(x + size, y + size/2);
      break;
    case 'Crane Up':
      // Arrow pointing up
      ctx.moveTo(x - size/2 + 10, y + size/2);
      ctx.lineTo(x + 10, y - size/2);
      ctx.lineTo(x + size/2 + 10, y + size/2);
      break;
    default:
      // Simple right arrow
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x + size - 5, y - 5);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size - 5, y + 5);
  }
  ctx.stroke();
  ctx.restore();
}

// Load image as promise
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC COMPOSITING (SHADOWS, LIGHTING & VFX)
// ═══════════════════════════════════════════════════════════════════════════

function drawAnamorphicFlare(ctx, settings, w, h) {
    const lens = LENS_DATA[settings.lens || S.lens] || {};
    if (lens.type !== 'anamorphic') return;

    const time = settings.timeOfDay ?? S.timeOfDay;
    const isIndoor = settings.isIndoor ?? S.isIndoor;
    if (isIndoor) return; // Flares are generally outdoor sun-driven in our current model

    // Calculate Sun Horizontal Position
    const sunDir = settings.sunDirection || S.sunDirection;
    let sunX = (sunDir === 'east') ? w * 0.15 : w * 0.85;
    
    // Altitude based on time (High at 12pm, Low at 6am/6pm)
    const altitude = 1.0 - Math.abs(time - 12) / 6; 
    if (altitude < 0) return; // Sun is below horizon

    const sunY = h * (0.5 - (altitude * 0.4));
    const flareOpacity = 0.25 * altitude;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    
    // The "Streak": A long, horizontal blue-tinted light
    const gradient = ctx.createLinearGradient(0, sunY, w, sunY);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.35, 'rgba(60, 100, 255, 0)');
    gradient.addColorStop(0.5, `rgba(100, 180, 255, ${flareOpacity})`);
    gradient.addColorStop(0.65, 'rgba(60, 100, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, sunY - 2, w, 4); // Core streak

    // Secondary soft glow
    const radial = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.4);
    radial.addColorStop(0, `rgba(120, 200, 255, ${flareOpacity * 0.4})`);
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
}

// Creates a Day-for-Night cinematic grade for the background plate
function getEnvironmentFilter(timeOfDay, isIndoor, baseBlur) {
    let filterStr = baseBlur > 0 ? `blur(${baseBlur}px)` : ''; 

    if (isIndoor) return filterStr === '' ? 'none' : filterStr;

    // --- TIME OF DAY BACKGROUND GRADING ---
    if (timeOfDay >= 8 && timeOfDay <= 16) {
        // Midday: Normal
        filterStr += ' brightness(1.0) contrast(1.0)';
    } else if (timeOfDay >= 6 && timeOfDay <= 18) {
        // Sunrise/Sunset: Warm, slightly contrasty
        filterStr += ' brightness(0.85) contrast(1.1) sepia(0.3) saturate(1.2)';
    } else {
        // Night: Drop exposure significantly, but BOOST contrast.
        // This crushes shadows to black, but leaves the brightest pixels intact to simulate glowing lights.
        filterStr += ' brightness(0.4) contrast(1.6) saturate(0.4) sepia(0.2) hue-rotate(180deg)';
    }
    
    return filterStr.trim() === '' ? 'none' : filterStr;
}

// === SEAMLESS OPTICAL DEPTH ENGINE (Master Version) ===
// Ensured to stay level to the frame even with Dutch Tilt/Roll
function drawBackgroundWithSimpleDOF(ctx, bgImage, x, y, w, h, groundY, maxBlur, timeFilter, dutchAngle = 0) {
  if (maxBlur <= 1) {
    ctx.save();
    ctx.filter = timeFilter || 'none';
    ctx.drawImage(bgImage, x, y, w, h);
    ctx.restore();
    return;
  }
  
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  
  // 1. Sharp Layer (Base) - Stays in the tilted context
  ctx.save();
  const groundBlur = maxBlur * 0.15; 
  ctx.filter = (timeFilter !== 'none') ? `${timeFilter} blur(${groundBlur}px)` : `blur(${groundBlur}px)`;
  ctx.drawImage(bgImage, x, y, w, h);
  ctx.restore();
  
  // 2. Blurred Layer Buffer (Offscreen)
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = canvasW; 
  blurCanvas.height = canvasH;
  const bCtx = blurCanvas.getContext('2d');
  
  // We MUST match the tilt for the image so it aligns with the base layer
  bCtx.save();
  const matrix = ctx.getTransform();
  bCtx.setTransform(matrix);
  bCtx.filter = (timeFilter !== 'none') ? `${timeFilter} blur(${maxBlur}px)` : `blur(${maxBlur}px)`;
  bCtx.drawImage(bgImage, x, y, w, h);
  
  // 3. APPLY LEVEL MASK (Reset to Screen Identity)
  bCtx.setTransform(1, 0, 0, 1, 0, 0); // Hard reset to screen space
  bCtx.globalCompositeOperation = 'destination-in';
  
  // Create a perfectly vertical gradient (locked to monitor frame)
  const grad = bCtx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, 'rgba(0,0,0,1)'); // Top is blurry
  grad.addColorStop(Math.max(0, groundY - 0.45), 'rgba(0,0,0,1)'); 
  grad.addColorStop(groundY, 'rgba(0,0,0,0)'); // groundY is the sharp focal point
  grad.addColorStop(1, 'rgba(0,0,0,0.15)'); // Bottom slightly blurry
  
  bCtx.fillStyle = grad;
  bCtx.fillRect(0, 0, canvasW, canvasH);
  bCtx.restore();
  
  // 4. COMPOSITE BACK TO MAIN CONTEXT
  // We draw the level buffer onto the main context by temporarily leveling the context too
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.drawImage(blurCanvas, 0, 0);
  ctx.restore();
}

function getFeetAnchor(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;
    
    // Only scan the bottom 40% of the image to save performance
    const scanStart = Math.floor(h * 0.6);
    const imageData = ctx.getImageData(0, scanStart, w, h - scanStart);
    const data = imageData.data;
    
    let lowestY = 0;
    let sumX = 0;
    let count = 0;
    
    // Scan from bottom to top
    for (let y = h - scanStart - 1; y >= 0; y--) {
        let rowSumX = 0;
        let rowCount = 0;
        
        for (let x = 0; x < w; x++) {
            const alpha = data[(y * w + x) * 4 + 3];
            if (alpha > 80) { // Threshold for solid pixel
                rowSumX += x;
                rowCount++;
            }
        }
        
        // If we find a row with enough pixels, it's likely the feet/ground contact
        if (rowCount > (w * 0.02)) { // At least 2% of width
            lowestY = y + scanStart;
            sumX = rowSumX;
            count = rowCount;
            break; // Found the bottom-most solid row
        }
    }
    
    if (count > 0) {
        return { x: sumX / count, y: lowestY };
    }
    return { x: w / 2, y: h * 0.92 }; // Fallback
}

function drawCharacterWithShadow(ctx, img, x, y, width, height, timeOfDay, lightingStyle = '', sunDirection = 'east') {
    // 1. DYNAMIC FOOT ANCHORING
    // Programmatically detect the feet to account for unpredictable padding in AI images
    const anchor = getFeetAnchor(img);
    const footX = anchor ? anchor.x : width / 2;
    const footY = anchor ? anchor.y : height * 0.92;
    
    // 2. Calculate Proportional Shadow Physics
    let shadowBlur = height * 0.04; 
    let shadowOpacity = 0.7; 
    let lightAngle = 0;   
    let shadowLength = 0; 
    
    let charFilter = 'none';

    // --- TIME OF DAY LOGIC ---
    if (timeOfDay >= 8 && timeOfDay <= 16) {
        lightAngle = (timeOfDay - 12) / 6; 
        shadowLength = Math.abs(lightAngle); 
        charFilter = 'brightness(1.0) contrast(1.0)';
    } else if (timeOfDay >= 6 && timeOfDay <= 18) {
        lightAngle = (timeOfDay - 12) / 6; 
        shadowLength = Math.abs(lightAngle); 
        charFilter = 'brightness(0.95) contrast(1.1) sepia(0.4) hue-rotate(-10deg) saturate(1.3)'; 
    } else {
        lightAngle = 0.3;
        shadowLength = 0.7;
        shadowOpacity = 0.4; 
        charFilter = 'brightness(0.55) contrast(1.1) saturate(0.5)'; 
    }

    // --- LIGHTING STYLE OVERRIDES ---
    if (lightingStyle.includes('Hard Shadow') || lightingStyle.includes('Noir')) {
        shadowOpacity = Math.min(1.0, shadowOpacity + 0.3); 
        shadowBlur = height * 0.01;
        charFilter += ' grayscale(0.6) contrast(1.4)';
    } else if (lightingStyle.includes('Soft Diffused')) {
        shadowOpacity = Math.max(0.2, shadowOpacity - 0.2); 
        shadowBlur = height * 0.08;
        charFilter += ' contrast(0.9) brightness(1.1)';
    } else if (lightingStyle.includes('Backlit')) {
        lightAngle = 0;
        shadowLength = 1.2; 
        shadowOpacity = 0.9;
        charFilter += ' brightness(0.4) contrast(1.3)';
    }

    const skewX = lightAngle * -1.2; 
    const scaleY = -0.15 - (shadowLength * 0.85); 

    // 2.5 THE CONTACT SHADOW (Grounding layer/Ambient Occlusion)
    // This is a dark, soft oval right at the feet that stays put regardless of light angle.
    // It prevents the "floating" look.
    ctx.save();
    ctx.translate(x + footX, y + footY);
    // 🔥 REFINED: Narrower (shoulder-width) and flatter grounding patch
    const contactBlur = height * 0.012;
    const contactOpacity = 0.65;
    ctx.filter = `blur(${contactBlur}px) opacity(${contactOpacity})`;
    ctx.fillStyle = '#000000';
    
    // Draw a small squashed circle (ellipse) at the feet
    // Radius reduced from 0.25 to 0.18 for better foot-lock feel
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.18, height * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. THE DIRECTIONAL CAST SHADOW
    ctx.save();
    // Translation point is the exact detected center of the feet
    // Since skew/scale happen around the translation origin, the shadow base stays locked to the feet.
    ctx.translate(x + footX, y + footY);
    ctx.transform(1, 0, skewX, scaleY, 0, 0);
    
    ctx.filter = `brightness(0) blur(${shadowBlur}px) opacity(${shadowOpacity})`;
    // Shift image drawing so our anchor point is (0,0) during rotation/skew
    ctx.drawImage(img, -footX, -footY, width, height);
    ctx.restore();
    
    // 4. DRAW THE BASE CHARACTER
    ctx.save();
    ctx.filter = charFilter;
    ctx.drawImage(img, x, y, width, height);
    ctx.restore();
}

// Draw cropped portion of image to simulate camera movement
function drawCroppedFrame(ctx, img, x, y, w, h, position, zoomFactor) {
  const cropW = img.width / zoomFactor;
  const cropH = img.height / zoomFactor;
  
  let sx, sy;
  switch(position) {
    case 'center':
      sx = (img.width - cropW) / 2;
      sy = (img.height - cropH) / 2;
      break;
    case 'bottom':
      sx = (img.width - cropW) / 2;
      sy = img.height - cropH;
      break;
    case 'top':
      sx = (img.width - cropW) / 2;
      sy = 0;
      break;
    case 'left':
      sx = 0;
      sy = (img.height - cropH) / 2;
      break;
    case 'right':
      sx = img.width - cropW;
      sy = (img.height - cropH) / 2;
      break;
    default:
      sx = (img.width - cropW) / 2;
      sy = (img.height - cropH) / 2;
  }
  
  ctx.drawImage(img, sx, sy, cropW, cropH, x, y, w, h);
}

// Draw hand-drawn style arrow INSIDE the frame
function drawInFrameArrow(ctx, frameX, frameY, frameW, frameH, arrowType) {
  ctx.save();
  
  // Hand-drawn red ink style
  ctx.strokeStyle = '#c33';
  ctx.fillStyle = '#c33';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const centerX = frameX + frameW / 2;
  const centerY = frameY + frameH / 2;
  const bottomY = frameY + frameH - 30;
  
  switch(arrowType) {
    case 'pullout':
      // Arrow pointing TOWARD viewer (out of frame) at bottom
      // Indicates camera is pulling back toward us
      drawHandDrawnArrow(ctx, centerX, bottomY - 60, centerX, bottomY + 10, 'down');
      // Small "camera" icon or label
      ctx.font = 'bold italic 10px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('← CAM', centerX, bottomY + 25);
      break;
      
    case 'pushin':
      // Arrow pointing INTO the frame (toward subject)
      drawHandDrawnArrow(ctx, centerX, bottomY + 10, centerX, centerY + 40, 'up');
      ctx.font = 'bold italic 10px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('CAM →', centerX, bottomY + 25);
      break;
      
    case 'craneup':
      // Vertical arrow going up
      const rightX = frameX + frameW - 40;
      drawHandDrawnArrow(ctx, rightX, bottomY, rightX, frameY + 50, 'up');
      ctx.save();
      ctx.translate(rightX + 15, centerY);
      ctx.rotate(-Math.PI/2);
      ctx.font = 'bold italic 9px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('CRANE ↑', 0, 0);
      ctx.restore();
      break;
      
    case 'pan':
      // Horizontal arrow
      drawHandDrawnArrow(ctx, frameX + 50, bottomY - 20, frameX + frameW - 50, bottomY - 20, 'right');
      ctx.font = 'bold italic 10px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('PAN →', centerX, bottomY + 10);
      break;
      
    case 'tracking':
      // Dashed tracking lines
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(frameX + 50, bottomY - 10);
      ctx.lineTo(frameX + frameW - 50, bottomY - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold italic 10px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('TRACK →', centerX, bottomY + 15);
      break;
  }
  
  ctx.restore();
}

// Draw a hand-drawn style arrow with wobble
function drawHandDrawnArrow(ctx, x1, y1, x2, y2, direction) {
  // Slightly wobbly line for hand-drawn feel
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  
  // Add slight curve/wobble
  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 6;
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 6;
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();
  
  // Arrowhead
  const headLen = 15;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI/5), y2 - headLen * Math.sin(angle - Math.PI/5));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI/5), y2 - headLen * Math.sin(angle + Math.PI/5));
  ctx.stroke();
}

function getFrame1Description(movement) {
  const descs = {
    'Static': 'Hold',
    'Dolly Push In': 'Wide establishing',
    'Dolly Pull Out': 'Close on subject',
    'Dolly Zoom': 'Normal perspective',
    'Pan Left/Right': 'Pan start',
    'Tilt Up/Down': 'Tilt start',
    'Orbital Arc': 'Arc start',
    'Tracking': 'Track start',
    'Crane Up': 'Low angle',
    'Handheld': 'Handheld energy',
    'Zoom In': 'Wide shot'
  };
  return descs[movement] || '';
}

function getFrame2Description(movement) {
  const descs = {
    'Static': 'Hold',
    'Dolly Push In': 'Push in - close-up',
    'Dolly Pull Out': 'Pull out - wide reveal',
    'Dolly Zoom': 'Vertigo effect',
    'Pan Left/Right': 'Pan end',
    'Tilt Up/Down': 'Tilt end',
    'Orbital Arc': 'Arc end',
    'Tracking': 'Track end',
    'Crane Up': 'High angle - bird\'s eye',
    'Handheld': 'Handheld energy',
    'Zoom In': 'Zoom - close-up'
  };
  return descs[movement] || '';
}

function addPaperTexture(ctx, w, h) {
  // Subtle paper grain
  ctx.save();
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const gray = Math.floor(Math.random() * 100);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

async function drawImageToFrame(ctx, imageSrc, x, y, w, h) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = imageSrc;
  });
}

function drawSketchFrame(ctx, img, x, y, w, h, frameType) {
  // Create sketch effect from source image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  // Calculate scaling (fit full character)
  const imgRatio = img.width / img.height;
  const frameRatio = w / h;
  let drawW, drawH, dx, dy;
  
  const scale = frameType === 'start' ? 0.85 : (S.movement.includes('Push') || S.movement.includes('Zoom') ? 1.2 : 0.7);
  
  if (imgRatio < frameRatio) {
    drawH = h * scale;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * scale;
    drawH = drawW / imgRatio;
  }
  dx = (w - drawW) / 2;
  dy = h - drawH - 10;
  
  // Fill with paper color
  tCtx.fillStyle = '#f5f3ef';
  tCtx.fillRect(0, 0, w, h);
  
  // Draw and process image
  tCtx.drawImage(img, dx, dy, drawW, drawH);
  
  // Convert to pencil sketch
  const imageData = tCtx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  
  for (let py = 1; py < h - 1; py++) {
    for (let px = 1; px < w - 1; px++) {
      const i = (py * w + px) * 4;
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
      
      // Check for gray background
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const bright = (r + g + b) / 3;
      
      if (sat < 0.12 && bright > 80 && bright < 200) {
        // Gray bg - make paper color
        pixels[i] = 245; pixels[i+1] = 243; pixels[i+2] = 239;
        continue;
      }
      
      // Edge detection for sketch lines
      const getL = (ox, oy) => {
        const idx = ((py + oy) * w + (px + ox)) * 4;
        return (pixels[idx] * 0.299 + pixels[idx+1] * 0.587 + pixels[idx+2] * 0.114);
      };
      
      const gx = -getL(-1,-1) + getL(1,-1) - 2*getL(-1,0) + 2*getL(1,0) - getL(-1,1) + getL(1,1);
      const gy = -getL(-1,-1) - 2*getL(0,-1) - getL(1,-1) + getL(-1,1) + 2*getL(0,1) + getL(1,1);
      const edge = Math.sqrt(gx*gx + gy*gy);
      
      if (edge > 30) {
        // Dark pencil line
        const intensity = Math.max(20, 80 - edge * 0.5);
        pixels[i] = pixels[i+1] = pixels[i+2] = Math.floor(intensity);
      } else if (edge > 15) {
        // Light sketch line
        const intensity = Math.max(120, 200 - edge * 2);
        pixels[i] = pixels[i+1] = pixels[i+2] = Math.floor(intensity);
      } else {
        // Paper color with slight shading
        const shade = Math.min(245, 230 + (bright / 255) * 15);
        pixels[i] = shade; pixels[i+1] = shade - 2; pixels[i+2] = shade - 6;
      }
    }
  }
  
  tCtx.putImageData(imageData, 0, 0);
  
  // Draw to main canvas
  ctx.drawImage(tempCanvas, x, y);
  
  // Add motion lines for end frame if needed
  if (frameType === 'end' && S.movement !== 'Static') {
    addMotionLines(ctx, x, y, w, h, S.movement);
  }
}

function saveSketchStoryboard() {
  // 1. Start Progress Bar
  showProgress('GENERATING SKETCH STORYBOARD', 'Processing layout...', 20);

  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 600; // Reduced from 700 to remove bottom gap
  const ctx = canvas.getContext('2d');
  
  // Cream paper background
  ctx.fillStyle = '#f8f6f1';
  ctx.fillRect(0, 0, 1600, 600);
  addPaperTexture(ctx, 1600, 600);
  
  const frameW = 640, frameH = 360;
  const frame1X = 100, frame2X = 860, frameY = 120;
  
  // Header strip
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 1600, 60);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px JetBrains Mono';
  ctx.fillText('A-CAM STORYBOARD (Sketch Mode)', 100, 38);
  
  updateProgress('Drawing frames...', 50);
  drawSketchFrame(ctx, S.heroImage, frame1X, frameY, frameW, frameH, 'start');
  drawSketchFrame(ctx, S.heroImage, frame2X, frameY, frameW, frameH, 'end');
  
  // Outer frame strokes
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(frame1X, frameY, frameW, frameH);
  ctx.strokeRect(frame2X, frameY, frameW, frameH);
  
  // 2. FIXED ARROW: Always 1 -> 2 (Left to Right)
  updateProgress('Adding movement markers...', 80);
  const arrowX1 = frame1X + frameW + 20;
  const arrowX2 = frame2X - 20;
  const arrowY = frameY + frameH / 2;
  
  ctx.strokeStyle = '#c33';
  ctx.fillStyle = '#c33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(arrowX1, arrowY);
  ctx.lineTo(arrowX2, arrowY); 
  ctx.stroke();
  
  // Arrowhead pointing right
  ctx.beginPath();
  ctx.moveTo(arrowX2, arrowY);
  ctx.lineTo(arrowX2 - 15, arrowY - 7);
  ctx.lineTo(arrowX2 - 15, arrowY + 7);
  ctx.fill();

  // Movement Label
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText(S.movement.toUpperCase(), (arrowX1 + arrowX2) / 2, arrowY + 30);
  ctx.textAlign = 'left';

  // Frame labels
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText('FRAME 1', frame1X, frameY - 15);
  ctx.fillText('FRAME 2', frame2X, frameY - 15);
  
  ctx.font = 'italic 10px Georgia';
  ctx.fillStyle = '#666';
  ctx.fillText(getFrame1Description(S.movement), frame1X + 70, frameY - 15);
  ctx.fillText(getFrame2Description(S.movement), frame2X + 70, frameY - 15);
  
  // 3. TIGHTER FOOTER
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 540, 1600, 60);
  ctx.fillStyle = '#888';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('A-CAM by IN-NO-V8 | Sketch Fallback Mode', 100, 575);
  
  const link = document.createElement('a');
  link.download = `storyboard-sketch-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  // 4. End Progress
  updateProgress('Complete!', 100);
  setTimeout(hideProgress, 500);
  showToast('Storyboard saved (sketch mode)');
}

// === INDIVIDUAL FRAME EXPORTS (For AI Video Systems) ===

function exportStartFrame() {
  if (!S.heroImage) {
    showToast('Upload an image first');
    return;
  }
  exportSingleFrame('start');
}

function exportEndFrame() {
  if (!S.heroImage) {
    showToast('Upload an image first');
    return;
  }
  exportSingleFrame('end');
}

function downloadBackground() {
  if (!S.backgroundPlate) {
    showToast('No background to download');
    return;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = S.backgroundPlate.width;
  canvas.height = S.backgroundPlate.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(S.backgroundPlate, 0, 0);
  
  const link = document.createElement('a');
  link.download = `a-cam-background-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
  
  showToast(`Background exported at ${canvas.width}×${canvas.height}`);
}

function exportSingleFrame(frameType) {
  const transformedFrame = frameType === 'start' ? S.transformedStartFrame : S.transformedEndFrame;
  
  if (transformedFrame) {
    const link = document.createElement('a');
    link.download = `a-cam-${frameType}-frame-${S.aspectRatio.replace(':','-')}-${Date.now()}.png`;
    link.href = transformedFrame.startsWith('data:') ? transformedFrame : `data:image/jpeg;base64,${transformedFrame}`;
    link.click();
    showToast(`${frameType === 'start' ? 'Start' : 'End'} frame exported (AI Rendered)`);
    return;
  }

  const resData = RESOLUTIONS[S.resolution] || RESOLUTIONS['1080p'];
  const aspectData = ASPECT_RATIOS[S.aspectRatio] || ASPECT_RATIOS['16:9'];
  
  let exportW, exportH;
  if (aspectData.ratio >= 1) {
    exportW = resData.width;
    exportH = Math.round(resData.width / aspectData.ratio);
  } else {
    exportH = resData.height;
    exportW = Math.round(resData.height * aspectData.ratio);
  }
  
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = exportW;
  exportCanvas.height = exportH;
  
  const frameSettings = { ...S, frameType: frameType };
  
  if (frameType === 'end') {
    // 🔥 SYNC: Defined as frameSettings to match local scope
    const intensity = S.movementIntensity / 100;

    switch(S.movement) {
      case 'Dolly Push In':
        frameSettings.bgScale = 1.0 + (0.15 * intensity); 
        frameSettings.charScale = 1.0 + (0.45 * intensity);
        break;
      case 'Dolly Pull Out':
        frameSettings.bgScale = 1.0 - (0.15 * intensity);
        frameSettings.charScale = 1.0 - (0.45 * intensity); 
        break;
      case 'Pan Left/Right':
        frameSettings.bgPanOffset = 0.15 * intensity;
        break;
      case 'Tilt Up/Down':
        frameSettings.bgTiltOffset = 0.12 * intensity;
        break;
      case 'Crane Up':
        frameSettings.bgTiltOffset = 0.25 * intensity;
        frameSettings.charScale = 1.0; 
        break;
      case 'Zoom In':
        frameSettings.bgScale = 1.0 + (0.40 * intensity);
        frameSettings.charScale = 1.0 + (0.40 * intensity);
        break;
      case 'Dolly Zoom':
        frameSettings.bgScale = 1.0 + (0.60 * intensity);
        frameSettings.charScale = 1.0; 
        break;
      case 'Dutch Roll':
        frameSettings.dutchAngle = 25 * intensity;
        frameSettings.skewX = 0.1 * intensity;
        break;
    }

    if (S.angle === 'Dutch Tilt') {
        frameSettings.dutchAngle = (frameSettings.dutchAngle || 0) + 25; // Constant tilt
    }
  }
  
  renderExportFrame(exportCanvas, S.heroImage, frameSettings);
  
  const link = document.createElement('a');
  link.download = `a-cam-${frameType}-frame-${S.aspectRatio.replace(':','-')}-${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png', 1.0);
  link.click();
  
  showToast(`${frameType === 'start' ? 'Start' : 'End'} frame exported at ${exportW}×${exportH}`);
}

function renderExportFrame(canvas, img, settings) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const w = canvas.width;
  const h = canvas.height;
  const canvasRatio = w / h;
  
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, w, h);
  
  // Support skipCharacter mode for video production (background only)
  const skipCharacter = settings.skipCharacter || !img;
  
  // Use placeholder dimensions if no character image
  const imgRatio = img ? (img.width / img.height) : 0.5;
  let charScale = canvasRatio >= 1.7 ? 0.72 : 0.82;
  
  let charH = h * charScale;
  let charW = charH * imgRatio;
  
  const feetX = w / 2;
  const groundY = Math.min(settings.groundPlaneY || S.groundPlaneY || 0.88, 0.92);
  let feetY = h * groundY;
  
  const headY = feetY - charH;
  if (headY < h * 0.08) feetY = charH + h * 0.08;
  
  // 🔥 THE FIX: Match motion inputs exactly with Preview Engine
  const moveX = (settings.bgPanOffset || 0) * w;
  const moveY = (settings.bgTiltOffset || 0) * h;
  const bgZoomScale = settings.bgScale || 1.0;
  const charZoomScale = settings.charScale || 1.0;

  // 🔥 NEW: Head & Shoulders Focus for Dolly/Zoom
  let adjustedFeetY = feetY;
  if (charZoomScale > 1.0) {
    const shiftFactor = (charZoomScale - 1.0) * 0.5;
    adjustedFeetY += (charH * shiftFactor);
  } else if (charZoomScale < 1.0) {
    // 🔥 NEW: Center compensation for Dolly Pull Out
    const liftFactor = (1.0 - charZoomScale) * 0.45;
    adjustedFeetY -= (charH * liftFactor);
  }

  ctx.save(); 
  
  if (settings.dutchAngle && settings.dutchAngle !== 0) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(settings.dutchAngle * Math.PI / 180);
    if (settings.skewX) ctx.transform(1, 0, settings.skewX, 1, 0, 0);
    ctx.translate(-w / 2, -h / 2);
  }

  if (S.backgroundPlate) {
    const bgRatio = S.backgroundPlate.width / S.backgroundPlate.height;
    const lensName = settings.lens || S.lens || '35mm Standard';
    const currentLens = parseInt(lensName) || 35;
    
    let opticalZoom = 1.0;
    let opticalBlur = 0;
    if (currentLens <= 10) opticalZoom = 0.55;
    else if (currentLens <= 15) opticalZoom = 0.70;
    else if (currentLens <= 24) opticalZoom = 0.82;
    else if (currentLens <= 35) opticalZoom = 0.92;
    else if (currentLens <= 50) opticalZoom = 1.0;
    else if (currentLens <= 85) { opticalZoom = 1.35; opticalBlur = 4; }
    else if (currentLens >= 135) { opticalZoom = 1.65; opticalBlur = 8; }

    // 🔥 FIX: No more zoomCompensation - allows true Dolly Pulls
    const baseOverscan = 1.6;
    const angleMagnitude = Math.abs(settings.dutchAngle || 0);
    const smoothTiltBuffer = 1.0 + (Math.min(45, angleMagnitude) / 45) * 0.4;
    const overscan = baseOverscan * smoothTiltBuffer;

    let bgW, bgH;
    if (bgRatio > canvasRatio) {
      bgH = h * overscan; bgW = bgH * bgRatio;
    } else {
      bgW = w * overscan; bgH = bgW / bgRatio;
    }
    
    const finalBgScale = bgZoomScale * opticalZoom;
    const scaledBgW = bgW * finalBgScale;
    const scaledBgH = bgH * finalBgScale;
    
    let totalBlur = (getBlurAmount(settings.dof || S.dof) * 1.5) + opticalBlur;
    let fgBlur = 0;
    
    // Dynamic Rack Focus Logic: Proportional across frames
    let currentRack = settings.currentRack;
    if (currentRack === undefined && S.rackFocus !== 0) {
      const rackVal = S.rackFocus / 100.0;
      currentRack = (settings.frameType === 'end') ? rackVal : -rackVal;
    }

    if (currentRack !== undefined) {
      if (currentRack > 0) {
        totalBlur = Math.max(totalBlur, currentRack * 20); // Pull to FG
      } else {
        totalBlur = Math.max(0, totalBlur + (currentRack * totalBlur)); // Pull to BG
        fgBlur = Math.abs(currentRack) * 8.5; // 🔥 NEW: Lowered for visibility
      }
    }
    settings.calculatedFgBlur = fgBlur;
    
    ctx.save();
    ctx.filter = getEnvironmentFilter(settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, totalBlur);
    
    const bgGroundX = scaledBgW / 2;
    const bgGroundY = scaledBgH * (settings.groundPlaneY || S.groundPlaneY || 0.85);
    
    const curAngle = settings.angle || S.angle;
    let angleShiftY = 0;
    if (curAngle === "Worm's Eye") angleShiftY = scaledBgH * 0.25;
    else if (curAngle === "High Angle") angleShiftY = -scaledBgH * 0.12;
    
    const bgX = feetX - bgGroundX + moveX;
    const bgY = adjustedFeetY - bgGroundY + moveY + angleShiftY;
    
    const lensData = LENS_DATA[lensName] || {};
    const distortionAmount = (lensData.type === 'fisheye') ? (lensData.distortion || 0.4) : 0;
    
    // 🔥 NEW: Anamorphic Squeeze Support
    const squeeze = lensData.squeeze || 1.0;
    const finalW = scaledBgW * squeeze;
    const finalX = bgX - (finalW - scaledBgW) / 2;

    drawWarpedBackground(ctx, S.backgroundPlate, finalX, bgY, finalW, scaledBgH, distortionAmount);
    
    ctx.restore(); // Restore environment filter ctx.save() from 2582
  }

  const finalCharW = charW * charZoomScale;
  const finalCharH = charH * charZoomScale;
  
  // Only draw character if not in skipCharacter mode (for video production)
  if (!skipCharacter && img) {
    const charCanvas = document.createElement('canvas');
    charCanvas.width = Math.ceil(finalCharW);
    charCanvas.height = Math.ceil(finalCharH);
    const charCtx = charCanvas.getContext('2d', { willReadFrequently: true });
    charCtx.drawImage(img, 0, 0, finalCharW, finalCharH);
    removeStudioBackground(charCtx, charCanvas);
    
    // Parallax logic synced with Preview (1.4x X, 1.0x Y)
    const finalCharX = feetX - (finalCharW / 2) + (moveX * 1.4);
    const finalCharY = adjustedFeetY - finalCharH + moveY;
    
    // Apply Shutter Speed Effect (Slow Shutter = Motion Blur Trail)
    const shutter = settings.shutterSpeed || S.shutterSpeed;
    if (shutter === 'Slow' && settings.frameType === 'end') {
        const blurCount = 5;
        const blurStepX = moveX * 0.05;
        const blurStepY = moveY * 0.05;
        ctx.save();
        ctx.globalAlpha = 0.2;
        for (let i = 1; i <= blurCount; i++) {
            drawCharacterWithShadow(ctx, charCanvas, finalCharX - (blurStepX * i), finalCharY - (blurStepY * i), finalCharW, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
        }
        ctx.restore();
    }

    // Apply FG Blur from Rack Focus
    if (settings.calculatedFgBlur && settings.calculatedFgBlur > 0) {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = finalCharW;
        blurCanvas.height = finalCharH;
        const bctx = blurCanvas.getContext('2d');
        bctx.filter = `blur(${settings.calculatedFgBlur}px)`;
        bctx.drawImage(charCanvas, 0, 0);
        drawCharacterWithShadow(ctx, blurCanvas, finalCharX, finalCharY, finalCharW, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
    } else {
        drawCharacterWithShadow(ctx, charCanvas, finalCharX, finalCharY, finalCharW, finalCharH, settings.timeOfDay ?? S.timeOfDay, settings.lighting || S.lighting);
    }
  }

  ctx.restore(); 
  
  if (S.hazeAmount > 0) {
    let distanceFactor = 1.0;
    if (settings.frameType === 'end' && S.movement === 'Dolly Pull Out') {
      distanceFactor = 1.0 + (S.movementIntensity / 100) * 0.5;
    }
    applyAtmosphericHaze(ctx, w, h, S.hazeAmount, S.hazeColor, distanceFactor);
  }
  
  // 🔥 NEW: OPTICS ENGINE (Lens Flare)
  drawAnamorphicFlare(ctx, settings, w, h);
  
  // Anime Speed Lines (Restore aggressive look)
  if (settings.frameType === 'end' && 
      (S.movement === 'Dolly Push In' || S.movement === 'Dolly Zoom' || S.movement === 'Zoom In' || S.movement === 'Dolly Pull Out') && 
      S.movementIntensity >= 70) {
      
      const centerX = w / 2;
      const centerY = h / 2;
      ctx.save();
      ctx.globalAlpha = 0.25; // 🔥 NEW: Lowered to 0.25 (Subtle)
      ctx.strokeStyle = '#ffffff';
      
      const lineCount = S.movementIntensity > 90 ? 55 : 35; // 🔥 NEW: Lowered density
      for (let i = 0; i < lineCount; i++) {
        ctx.lineWidth = Math.random() * 2 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = (Math.random() * 0.3 + 0.5) * (h/2); // 🔥 NEW: Starting further out
        const outerRadius = Math.max(w, h); 
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
      }
      ctx.restore();
  }
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  applyTimeOfDayGrade(ctx, w, h, settings.timeOfDay ?? S.timeOfDay, settings.isIndoor ?? S.isIndoor, settings.sunDirection ?? S.sunDirection);
  applyLightingOverlay(ctx, w, h, settings.lighting || S.lighting, settings.lightingIntensity ?? S.lightingIntensity);
  
  if (S.showVignette) applyVignette(ctx, 0, 0, w, h, 65);

  // 6. APPLY FILM STOCK EFFECTS (Grain, Scanlines, Tints)
  applyFilmEffects(ctx, w, h, settings.filmStock || S.filmStock);
}

function applyFilmEffects(ctx, w, h, stock) {
  if (!stock || stock === 'Clean Digital') return;

  ctx.save();
  
  if (stock === '16mm Film') {
    // 16mm: Warm tint + Texture
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 200, 150, 0.15)';
    ctx.fillRect(0, 0, w, h);
    
    // Add Grain
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const s = Math.random() * 2;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(x, y, s, s);
    }
  } else if (stock === 'VHS') {
    // VHS: Scanlines + Slight color shift
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < h; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    
    // Color Bleed (slight red shift)
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.fillRect(2, 0, w, h);
  } else if (stock === 'CCTV') {
    // CCTV: Greenish Tint + Low Res Scanlines
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(100, 255, 150, 0.3)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < h; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

function resetAll() {
  if (confirm('Reset all settings?')) location.reload();
}

function showInfo() {
  alert('A-CAM by IN-NO-V8\n\nVisual Director for AI Video\nVersion 3.0\n\n• Gemini-powered scene analysis\n• Real-time background removal\n• Scene compositing with DOF\n• Time/lighting visualization');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showProgress(title, status = 'Initializing...', percent = 0) {
  const overlay = document.getElementById('progressOverlay');
  document.getElementById('progressTitle').textContent = title;
  document.getElementById('progressStatus').textContent = status;
  document.getElementById('progressFill').style.width = percent + '%';
  overlay.classList.add('active');
}

function updateProgress(status, percent) {
  document.getElementById('progressStatus').textContent = status;
  document.getElementById('progressFill').style.width = percent + '%';
}

function hideProgress() {
  document.getElementById('progressOverlay').classList.remove('active');
}


window.updateRackFocus = function() {
  S.rackFocus = parseInt(document.getElementById('rackFocusSlider').value);
  const val = S.rackFocus;
  let text = '0 (Static)';
  if (val < 0) text = String(Math.abs(val)) + ' (Pull to BG)';
  if (val > 0) text = String(val) + ' (Pull to FG)';
  document.getElementById('rackFocusValue').textContent = text;
};

// ═══════════════════════════════════════════════════════════════════════════
// PREVIZ VIDEO ENGINE (LOCAL)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generates a 5-second local MP4/WebM previz of the camera movement
 */
async function renderPrevizVideo() {
  if (!S.heroImage || !S.backgroundPlate) {
    showToast("Upload both subject and background first");
    return;
  }

  const duration = 5; // seconds
  const fps = 24;
  const totalFrames = duration * fps;
  
  // Use a reasonable previz resolution (720p base)
  const aspectData = ASPECT_RATIOS[S.aspectRatio] || ASPECT_RATIOS['16:9'];
  let exportW, exportH;
  if (aspectData.ratio >= 1) {
    exportW = 1280;
    exportH = Math.round(1280 / aspectData.ratio);
  } else {
    exportH = 1280;
    exportW = Math.round(1280 * aspectData.ratio);
  }

  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = exportW;
  captureCanvas.height = exportH;

  // Use the premium render progress UI from api.js if available
  if (window.showRenderProgress) {
    window.showRenderProgress('LOCAL PREVIZ BAKE');
  } else {
    showProgress('RENDERING PREVIZ', 'Initializing Engine...', 0);
  }

  const stream = captureCanvas.captureStream(fps);
  
  // Detect best supported mimeType
  const mimeTypes = [
    'video/mp4;codecs=h264', 
    'video/webm;codecs=vp9', 
    'video/webm;codecs=vp8', 
    'video/webm'
  ];
  const selectedMimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  
  const recorder = new MediaRecorder(stream, { 
    mimeType: selectedMimeType,
    videoBitsPerSecond: 5000000 // 5Mbps for clear previz
  });
  
  const chunks = [];
  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: selectedMimeType });
    const videoUrl = URL.createObjectURL(blob);
    
    if (window.handleRenderSuccess) {
      window.handleRenderSuccess(videoUrl);
    } else {
      const win = window.open(videoUrl, '_blank');
      if (win) win.focus();
      hideProgress();
    }
  };

  recorder.start();

  const intensity = (S.movementIntensity) / 100;
  const rackVal = S.rackFocus / 100.0;

  // Targets for interpolation (matching exportSingleFrame logic)
  let targetBgScale = 1.0;
  let targetCharScale = 1.0;
  let targetBgPanOffset = 0;
  let targetBgTiltOffset = 0;
  let targetDutchAngle = 0;
  let targetSkewX = 0;

  switch(S.movement) {
    case 'Dolly Push In':
      targetBgScale = 1.0 + (0.15 * intensity); 
      targetCharScale = 1.0 + (0.45 * intensity);
      break;
    case 'Dolly Pull Out':
      targetBgScale = 1.0 - (0.15 * intensity);
      targetCharScale = 1.0 - (0.45 * intensity); 
      break;
    case 'Pan Left/Right':
      targetBgPanOffset = 0.15 * intensity;
      break;
    case 'Tilt Up/Down':
      targetBgTiltOffset = 0.12 * intensity;
      break;
    case 'Crane Up':
      targetBgTiltOffset = 0.25 * intensity;
      break;
    case 'Zoom In':
      targetBgScale = 1.0 + (0.40 * intensity);
      targetCharScale = 1.0 + (0.40 * intensity);
      break;
    case 'Dolly Zoom':
      targetBgScale = 1.0 + (0.60 * intensity);
      break;
    case 'Dutch Roll':
      targetDutchAngle = 25 * intensity;
      targetSkewX = 0.1 * intensity;
      break;
  }

  if (S.angle === 'Dutch Tilt') {
    targetDutchAngle = (targetDutchAngle || 0) + 25;
  }

  // Animation Loop
  for (let i = 0; i < totalFrames; i++) {
    const t = i / (totalFrames - 1);
    
    // Smooth stepping (Ease In Out) for more cinematic previz
    const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const frameSettings = { 
      ...S, 
      frameType: t > 0.5 ? 'end' : 'start', // Keep legacy flag for minor logic
      bgScale: 1.0 + (targetBgScale - 1.0) * easeT,
      charScale: 1.0 + (targetCharScale - 1.0) * easeT,
      bgPanOffset: targetBgPanOffset * easeT,
      bgTiltOffset: targetBgTiltOffset * easeT,
      dutchAngle: targetDutchAngle * easeT,
      skewX: targetSkewX * easeT,
      currentRack: -rackVal + (2 * rackVal) * easeT
    };

    // Render exact frame to capture canvas
    renderExportFrame(captureCanvas, S.heroImage, frameSettings);
    
    // Update UI Progress
    const progressPercent = Math.round((i / totalFrames) * 100);
    if (window.updateRenderProgressUI) {
      window.updateRenderProgressUI('LOCAL PREVIZ', i/fps, i);
      const statusLbl = document.getElementById('renderProgressStatus');
      if (statusLbl) statusLbl.textContent = `BAKING PREVIZ... ${progressPercent}%`;
    } else {
      updateProgress(`Baking frame ${i+1}/${totalFrames}`, progressPercent);
    }

    // Yield to browser frequently to ensure MediaRecorder picks up the frame
    // and the UI stays responsive
    await new Promise(r => requestAnimationFrame(r));
  }

  // Allow a tiny bit of time for the last frame to be sampled
  await new Promise(r => setTimeout(r, 100));
  recorder.stop();
}

/**
 * Utility to map DOF strings to numeric blur radius
 */
function getBlurAmount(dof) {
  const blurs = {
    'f/1.4 Razor Thin': 24,
    'f/2.0 Shallow': 16,
    'f/2.8 Cinematic': 10,
    'f/4.0 Balanced': 6,
    'f/5.6 Deep': 3,
    'f/8.0 Sharp': 0.5,
    'f/11 Deep Focus': 0
  };
  return blurs[dof] || 0;
}

