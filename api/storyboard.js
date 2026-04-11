// A-CAM Storyboard Generator — Gemini 2.5 Flash Image (Style Transfer)
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('Missing Gemini API key');
    return new Response(JSON.stringify({ 
      error: 'Gemini API key not configured',
      generated: false
    }), { status: 200, headers });
  }

  try {
    const { 
      frameImage,        // Base64 composite frame (hero + background)
      frameType,         // 'start' or 'end'
      movement,
      sceneDescription
    } = await req.json();

    if (!frameImage) {
      return new Response(JSON.stringify({ 
        error: 'No frame image provided',
        generated: false
      }), { status: 400, headers });
    }

    // Extract base64 data (remove data URL prefix if present)
    let imageBase64 = frameImage;
    let mimeType = 'image/jpeg';
    if (frameImage.includes(',')) {
      const parts = frameImage.split(',');
      if (parts[0].includes('png')) mimeType = 'image/png';
      imageBase64 = parts[1];
    }

    // Build prompt for sketch conversion
    const frameDesc = frameType === 'start' ? 'establishing shot' : 'end frame showing camera movement result';
    
    const prompt = `Convert this image into a professional Hollywood film storyboard panel in hand-drawn pencil sketch style.

CRITICAL REQUIREMENTS:
- Maintain the EXACT composition, character position, and scene layout
- Keep the same camera angle and framing
- Preserve all details of the person/character exactly as shown
- Black and white pencil sketch with confident linework
- Use hatching and cross-hatching for shadows and depth  
- Clean professional storyboard quality like a Hollywood production
- Visible pencil strokes and artistic hand-drawn quality
- White/cream paper background showing through

This is a ${frameDesc} for a ${movement || 'cinematic'} camera movement.
Scene context: ${sceneDescription || 'Cinematic urban environment'}

Transform this frame into a pencil sketch storyboard panel.`;

    console.log('Generating sketch with Gemini 2.5 Flash Image');

    // Call Gemini 2.5 Flash Image API
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64
            }
          },
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT']
      }
    };

    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      console.log('Gemini response received');
      
      // Extract image from response (handle both camelCase and snake_case)
      const parts = geminiData.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        // Check both naming conventions
        const inlineData = part.inlineData || part.inline_data;
        if (inlineData?.data) {
          const imageMime = inlineData.mimeType || inlineData.mime_type || 'image/png';
          console.log('Sketch generated successfully!');
          return new Response(JSON.stringify({
            image: `data:${imageMime};base64,${inlineData.data}`,
            generated: true,
            frameType: frameType,
            model: 'gemini-2.5-flash-image'
          }), { status: 200, headers });
        }
      }
      
      // No image in response
      console.log('No image in Gemini response:', JSON.stringify(geminiData).substring(0, 500));
      return new Response(JSON.stringify({
        error: 'No image generated',
        details: JSON.stringify(parts.map(p => p.text || '[image]')).substring(0, 200),
        generated: false
      }), { status: 200, headers });
      
    } else {
      const errText = await geminiResponse.text();
      console.log('Gemini error:', geminiResponse.status, errText.substring(0, 800));
      
      return new Response(JSON.stringify({
        error: `Gemini API error: ${geminiResponse.status}`,
        details: errText.substring(0, 500),
        generated: false
      }), { status: 200, headers });
    }

  } catch (err) {
    console.error('Storyboard error:', err.message);
    return new Response(JSON.stringify({
      error: err.message,
      generated: false
    }), { status: 200, headers });
  }
}
