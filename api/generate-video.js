// A-CAM Video Generator v8 - True 3D Camera Motion Fix
export const config = { runtime: 'edge' };

async function getAccessToken() {
  const saJson = process.env.GCP_SERVICE_ACCOUNT;
  if (!saJson) throw new Error("GCP_SERVICE_ACCOUNT is missing");
  const sa = JSON.parse(saJson);
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  };
  const base64url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const pemContent = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s+/g, '');
  const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', binaryKey.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsignedToken));
  const signedToken = `${unsignedToken}.${base64url(String.fromCharCode(...new Uint8Array(signature)))}`;
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedToken}`
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) throw new Error("Auth failed");
  return tokenData.access_token;
}

function validateAndCleanBase64(b64) {
  if (!b64) return null;
  let cleaned = b64;
  if (cleaned.startsWith('data:')) {
    const commaIndex = cleaned.indexOf(',');
    if (commaIndex > 0) cleaned = cleaned.substring(commaIndex + 1);
  }
  cleaned = cleaned.replace(/[\s\r\n]+/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
  const remainder = cleaned.length % 4;
  if (remainder !== 0) cleaned += '='.repeat(4 - remainder);
  if (cleaned.length < 1000) return null;
  return cleaned;
}

export default async function handler(req) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  try {
    const { prompt, startFrameBase64, duration = 5, aspectRatio = '16:9' } = await req.json();
    let validDuration = Number(duration) <= 5 ? 4 : (Number(duration) <= 7 ? 6 : 8);

    if (!prompt) throw new Error('Prompt is required');

    const accessToken = await getAccessToken();
    const instance = { prompt };
    
    const startFrameClean = validateAndCleanBase64(startFrameBase64);
    if (startFrameClean) {
      instance.image = { bytesBase64Encoded: startFrameClean, mimeType: "image/jpeg" };
    }

    // 🚨 THE FIX: Removed the `lastFrame` assignment completely. 
    // By giving Veo only a start frame and a strong prompt, it utilizes its internal 
    // 3D physics/spatial engine to fly the camera through the scene.

    const parameters = { aspectRatio: aspectRatio, durationSeconds: validDuration, sampleCount: 1, personGeneration: "allow_all" };
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/project-51cbdab8-586c-4f77-94c/locations/us-central1/publishers/google/models/veo-3.1-generate-001:predictLongRunning`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [instance], parameters })
    });

    const responseText = await response.text();
    if (!response.ok) throw new Error(`API Error: ${response.status} - ${responseText.substring(0, 200)}`);

    const data = JSON.parse(responseText);
    if (data.name) return new Response(JSON.stringify({ operationName: data.name, status: 'PENDING', success: true }), { status: 200, headers });
    
    throw new Error('No operation name returned');
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, success: false }), { status: 200, headers });
  }
}
