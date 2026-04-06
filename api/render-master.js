// A-CAM Render Master — Photorealistic Keyframe Generation (Imagen 3)
export const config = { runtime: 'edge' };

async function getGoogleAuthToken() {
  const saJson = process.env.GCP_SERVICE_ACCOUNT;
  if (!saJson) throw new Error("GCP_SERVICE_ACCOUNT environment variable is missing.");
  const sa = JSON.parse(saJson);

  const header = { alg: 'RS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; 
  const payload = {
    iss: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    iat, exp
  };

  const base64url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unsignedData = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  const b64Lines = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s+/g, '');
  const b64Decoded = atob(b64Lines);
  const keyBuffer = new Uint8Array(b64Decoded.length);
  for (let i = 0; i < b64Decoded.length; i++) keyBuffer[i] = b64Decoded.charCodeAt(i);

  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyBuffer.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsignedData));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${unsignedData}.${encodedSignature}`
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers });

  try {
    const payload = await req.json();
    const { startFrame, endFrame, sceneDescription, performance, lighting, geometry, frameContext } = payload;
    
    const getBase64 = (dataUrl) => dataUrl ? (dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl) : null;
    
    const accessToken = await getGoogleAuthToken();
    const projectID = 'project-51cbdab8-586c-4f77-94c'; 
    const location = 'asia-southeast1';
    
    const vertexUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectID}/locations/${location}/publishers/google/models/imagen-3.0-capability-001:predict`;

    const renderFrame = async (draftBase64, isEndFrame = false) => {
      if (!draftBase64) return null;
      
      // CRITICAL: Describe the SCENE and SUBJECT only - NO camera/film equipment words!
      // The AI was literally drawing cameras when we mentioned "50mm lens" etc.
      const subjectAction = performance ? `The person is ${performance}.` : 'The person stands naturally.';
      const timeOfDay = lighting?.isIndoor ? 'indoor' : (lighting?.timeOfDay > 18 || lighting?.timeOfDay < 6 ? 'night' : 'daytime');
      const lightDir = lighting?.sunDirection === 'west' ? 'from the left' : 'from the right';
      
      // Build a pure scene description with NO technical camera terms
      const prompt = `Photorealistic image of a real person in a real location. 
${sceneDescription || 'Urban street scene'}.
${subjectAction}
The person's feet are firmly planted on the ground at the correct perspective.
${timeOfDay} lighting ${lightDir}.
Realistic shadows and reflections matching the environment.
Professional photograph quality, sharp focus on the subject.
The person is naturally integrated into the scene with matching color grading.
Do NOT include any film equipment, cameras, tripods, crew members, or studio elements.`;

      const response = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt,
            referenceImages: [{
              referenceId: 1,
              referenceType: "REFERENCE_TYPE_RAW",
              referenceImage: { bytesBase64Encoded: draftBase64 }
            }]
          }],
          parameters: {
            sampleCount: 1,
            editConfig: { editMode: "EDIT_MODE_DEFAULT" }
          }
        })
      });

      if (!response.ok) {
         const errorText = await response.text();
         console.error("Vertex API Error details:", errorText);
         throw new Error(`Google API Rejected: ${response.status}`);
      }

      const data = await response.json();
      if (data.predictions && data.predictions[0]) {
        return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
      }
      return null;
    };

    const renderedStart = await renderFrame(getBase64(startFrame), false);
    const renderedEnd = await renderFrame(getBase64(endFrame), true);

    return new Response(JSON.stringify({ 
      success: true, 
      startFrame: renderedStart || startFrame, 
      endFrame: renderedEnd || endFrame,
      message: renderedStart ? 'Rendered with AI enhancement' : 'Using original frames'
    }), { status: 200, headers });

  } catch (err) {
    console.error('Render master error:', err.message);
    return new Response(JSON.stringify({ error: err.message, success: false }), { status: 500, headers });
  }
}
