// A-CAM Analyzer v9 — April 2026
// Stricter prompts to avoid conversational preamble
export const config = { runtime: 'edge' };

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

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({
      status: 'API v9 running',
      version: 'v9-strict-prompts'
    }), { status: 200, headers });
  }

  const { imageBase64, analyzeType } = body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !imageBase64) {
    return new Response(JSON.stringify({
      analyzed: false,
      error: !apiKey ? 'No API key' : 'No image',
      foreground: 'Street-level elements near camera',
      midground: 'Main activity area with pedestrians',
    }), { status: 200, headers });
  }

  if (analyzeType === 'outpaint') {
    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return new Response(JSON.stringify({ error: 'FAL_KEY not configured' }), { status: 500, headers });
    }

    try {
      const { maskBase64, cinematographyContext } = body;
      console.log("🎨 Calling fal-ai/flux-pro/v1/fill for outpainting...");
      
      const response = await fetch("https://fal.run/fal-ai/flux-pro/v1/fill", {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image_url: imageBase64,
          mask_url: maskBase64,
          prompt: cinematographyContext || 'cinematic environment, extremely detailed, seamless background continuation',
          num_inference_steps: 30,
          guidance_scale: 7.5
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Fal AI Error: ${response.status} ${text}`);
      }

      const data = await response.json();
      if (data.images && data.images[0]) {
        const imgResponse = await fetch(data.images[0].url);
        const arrayBuffer = await imgResponse.arrayBuffer();
        
        // Edge-safe base64 conversion
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Image = btoa(binary);
        
        return new Response(JSON.stringify({
          outpaintedImage: base64Image
        }), { status: 200, headers });
      } else {
        throw new Error('No images returned from outpaint');
      }
    } catch (e) {
      console.error("Outpaint error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
  const isBackground = analyzeType === 'background_layers' || analyzeType === 'background';

  // STRICT prompts - no preamble, direct answers only
  const prompt = isBackground
    ? `Task: Describe this location image in exactly 4 lines.

Line 1 - NEAR (0-5m): [describe objects/elements closest to camera]
Line 2 - MIDDLE (5-20m): [describe the main action area]
Line 3 - FAR (20m+): [describe distant elements, sky, horizon]
Line 4 - ENV: [write exactly "INDOOR" or "OUTDOOR"]

Rules: Each line must be 8-15 words except Line 4. No introductions. No explanations. Start directly with Line 1.`

    : `Task: Describe ONLY the clothing visible in this image.

Write ONE sentence (20-40 words) listing: shirt/top type and color, pants/bottom type and color, shoes, and any accessories like jewelry or bags.

Rules: No introductions like "The person is wearing". Start directly with the clothing item. Example format: "Dark blue denim jacket over white t-shirt, black jeans, white sneakers, silver watch"`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.1,  // Lower = more deterministic
          maxOutputTokens: 300
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log(`📝 Raw response: "${rawText.substring(0, 200)}"`);

    if (!rawText) {
      throw new Error('Empty response');
    }

    // Clean up the response
    let cleaned = rawText.trim();

    if (isBackground) {
      // Parse the 4-line format
      const lines = cleaned.split('\n').filter(l => l.trim());
      
      let foreground = '';
      let midground = '';
      let background = '';
      let environment = 'OUTDOOR';

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        // Extract content after the label
        const content = line
          .replace(/^(line\s*\d+\s*[-:.]?\s*)/i, '')
          .replace(/^(near|middle|far|foreground|midground|background|env)[\s\(\)0-9\-m:.]*/i, '')
          .replace(/^\[|\]$/g, '')
          .trim();

        if (lowerLine.includes('near') || lowerLine.includes('line 1') || lowerLine.includes('foreground') || lowerLine.match(/^1[\.\)]/)) {
          if (!foreground && content) foreground = content;
        } else if (lowerLine.includes('middle') || lowerLine.includes('line 2') || lowerLine.includes('midground') || lowerLine.match(/^2[\.\)]/)) {
          if (!midground && content) midground = content;
        } else if (lowerLine.includes('far') || lowerLine.includes('line 3') || lowerLine.includes('background') || lowerLine.includes('distant') || lowerLine.match(/^3[\.\)]/)) {
          if (!background && content) background = content;
        } else if (lowerLine.includes('env') || lowerLine.includes('line 4') || lowerLine.match(/^4[\.\)]/)) {
          if (content.toLowerCase().includes('indoor')) environment = 'INDOOR';
        }
      }

      // If parsing failed, try splitting by lines directly
      if (!foreground && !midground && !background && lines.length >= 3) {
        foreground = lines[0].replace(/^[^:]+:\s*/, '').trim();
        midground = lines[1].replace(/^[^:]+:\s*/, '').trim();
        background = lines[2].replace(/^[^:]+:\s*/, '').trim();
      }

      // Final fallbacks
      if (!foreground) foreground = 'Street-level elements and objects near camera';
      if (!midground) midground = 'Main scene area with pedestrian activity';
      if (!background) background = 'Distant buildings, sky, and horizon';

      console.log(`✅ Parsed: FG="${foreground}" MG="${midground}" BG="${background}"`);

      return new Response(JSON.stringify({
        analyzed: true,
        model: 'gemini-2.5-flash',
        foreground,
        midground,
        background,
        environment,
        horizonY: 0.35,
        groundY: 0.85
      }), { status: 200, headers });
    } 
    
    // Outfit analysis
    else {
      // Remove any preamble like "Here's..." or "The person is wearing..."
      let outfit = cleaned
        .replace(/^(here'?s?|this is|the person is wearing|the subject is wearing|i can see)[^:]*[:.]?\s*/i, '')
        .replace(/^(the image shows|in this image)[^:]*[:.]?\s*/i, '')
        .trim();

      // If it still starts with a label, remove it
      outfit = outfit.replace(/^(outfit|clothing|description)[\s:.-]*/i, '').trim();

      // Capitalize first letter
      if (outfit) {
        outfit = outfit.charAt(0).toUpperCase() + outfit.slice(1);
      }

      if (!outfit || outfit.length < 10) {
        outfit = 'Casual attire suitable for everyday wear';
      }

      console.log(`✅ Outfit: "${outfit}"`);

      return new Response(JSON.stringify({
        analyzed: true,
        model: 'gemini-2.5-flash',
        outfit: outfit,
        top: 'See outfit description',
        bottom: 'See outfit description',
        accessories: 'See outfit description',
        colors: 'Various'
      }), { status: 200, headers });
    }

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    
    if (isBackground) {
      return new Response(JSON.stringify({
        analyzed: false,
        error: err.message,
        foreground: 'Street-level elements near camera',
        midground: 'Main scene area with activity',
        background: 'Distant buildings and sky'
      }), { status: 200, headers });
    } else {
      return new Response(JSON.stringify({
        analyzed: false,
        error: err.message,
        outfit: 'Casual everyday attire'
      }), { status: 200, headers });
    }
  }
}
