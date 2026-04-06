// A-CAM Video Poller v4 — Vertex AI :fetchPredictOperation (April 2026)
// Uses the correct endpoint for polling video generation operations
export const config = { runtime: 'edge' };

async function getAccessToken() {
  const saJson = process.env.GCP_SERVICE_ACCOUNT;
  if (!saJson) {
    throw new Error("GCP_SERVICE_ACCOUNT is missing");
  }
  
  const sa = JSON.parse(saJson);

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  };

  const base64url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  const pemContent = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

  const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedToken = `${unsignedToken}.${base64url(String.fromCharCode(...new Uint8Array(signature)))}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedToken}`
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    throw new Error("Token exchange failed: " + JSON.stringify(tokenData));
  }

  return tokenData.access_token;
}

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  console.log("📊 poll-video v4 (fetchPredictOperation) called");

  try {
    const body = await req.json();
    const { operationName } = body;

    if (!operationName) {
      return new Response(JSON.stringify({
        status: 'FAILED',
        error: 'operationName is required',
        success: false
      }), { status: 200, headers });
    }

    console.log("📊 Operation name:", operationName);

    // Extract project, location, and model from operation name
    // Format: projects/{project}/locations/{location}/publishers/google/models/{model}/operations/{id}
    const projectMatch = operationName.match(/projects\/([^\/]+)/);
    const locationMatch = operationName.match(/locations\/([^\/]+)/);
    const modelMatch = operationName.match(/models\/([^\/]+)/);
    
    if (!projectMatch || !locationMatch || !modelMatch) {
      return new Response(JSON.stringify({
        status: 'FAILED',
        error: 'Invalid operation name format',
        success: false
      }), { status: 200, headers });
    }

    const projectId = projectMatch[1];
    const location = locationMatch[1];
    const modelId = modelMatch[1];

    console.log(`📊 Project: ${projectId}, Location: ${location}, Model: ${modelId}`);

    // Get access token
    const accessToken = await getAccessToken();
    console.log("✅ Got access token");

    // Use :fetchPredictOperation endpoint (NOT a GET to the operation path!)
    // POST https://{location}-aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:fetchPredictOperation
    const fetchUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`;
    
    console.log("📊 Fetch URL:", fetchUrl);

    const pollResponse = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operationName: operationName
      })
    });

    const responseText = await pollResponse.text();
    console.log("📥 Response status:", pollResponse.status);
    console.log("📥 Response:", responseText.substring(0, 500));

    if (!pollResponse.ok) {
      return new Response(JSON.stringify({
        status: 'FAILED',
        error: `Poll HTTP error: ${pollResponse.status}`,
        details: responseText.substring(0, 300),
        success: false
      }), { status: 200, headers });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return new Response(JSON.stringify({
        status: 'FAILED',
        error: 'Invalid JSON response',
        rawResponse: responseText.substring(0, 200),
        success: false
      }), { status: 200, headers });
    }

    // Check if operation is complete
    if (data.done === true) {
      console.log("✅ Operation DONE");

      if (data.error) {
        return new Response(JSON.stringify({
          status: 'FAILED',
          error: data.error.message || 'Video generation failed',
          success: false
        }), { status: 200, headers });
      }

      // Extract video from response
      const response = data.response || {};
      console.log("📦 Response keys:", Object.keys(response));

      let videoUrl = null;
      let videoBase64 = null;

      // Try different response formats
      // Format 1: videos[].bytesBase64Encoded (common for Veo)
      if (response.videos && response.videos[0]) {
        const video = response.videos[0];
        videoBase64 = video.bytesBase64Encoded;
        videoUrl = video.uri || video.url;
        console.log("📦 Found video in videos array");
      }

      // Format 2: generatedSamples[].video
      if (!videoUrl && !videoBase64 && response.generatedSamples && response.generatedSamples[0]) {
        const sample = response.generatedSamples[0];
        if (sample.video) {
          videoUrl = sample.video.uri || sample.video.url;
          videoBase64 = sample.video.bytesBase64Encoded;
        }
        console.log("📦 Found video in generatedSamples");
      }

      // Format 3: predictions
      if (!videoUrl && !videoBase64 && response.predictions && response.predictions[0]) {
        const pred = response.predictions[0];
        videoUrl = pred.videoUrl || pred.uri;
        videoBase64 = pred.bytesBase64Encoded;
        console.log("📦 Found video in predictions");
      }

      if (videoUrl || videoBase64) {
        console.log("🎉 Video ready!");
        return new Response(JSON.stringify({
          status: 'COMPLETED',
          videoUrl: videoUrl,
          videoBase64: videoBase64,
          success: true
        }), { status: 200, headers });
      }

      // No video found
      console.log("⚠️ No video found. Full response:", JSON.stringify(data).substring(0, 1000));
      return new Response(JSON.stringify({
        status: 'FAILED',
        error: 'Video generation completed but no video data found',
        responseKeys: Object.keys(response),
        success: false
      }), { status: 200, headers });
    }

    // Still in progress
    const metadata = data.metadata || {};
    console.log("⏳ Still processing...");

    return new Response(JSON.stringify({
      status: 'IN_PROGRESS',
      progress: metadata.progressPercentage || 0,
      success: true
    }), { status: 200, headers });

  } catch (err) {
    console.error("❌ Error:", err.message);
    return new Response(JSON.stringify({
      status: 'FAILED',
      error: err.message,
      success: false
    }), { status: 200, headers });
  }
}
