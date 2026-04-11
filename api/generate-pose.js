export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, reference_image_url } = req.body;

  try {
    // STEP 1: Generate the pose with Flux PuLID (ENHANCED QUALITY)
    console.log("🎬 A-CAM: Generating pose with Flux PuLID...");
    
    // Enhance prompt with sharpness keywords
    const enhancedPrompt = `${prompt}, sharp focus, highly detailed, crisp edges, professional photography, 8k uhd`;
    
    const genResponse = await fetch("https://fal.run/fal-ai/flux-pulid", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        reference_image_url: reference_image_url,
        image_size: {
          width: 768,
          height: 1024
        },
        num_inference_steps: 30,           // More steps = sharper details (default is ~20)
        guidance_scale: 4.0,               // Higher = more prompt adherence
        id_weight: 1.0,                    // Strong face preservation
        true_cfg: 1.0,
        max_sequence_length: 128
      })
    });

    const genData = await genResponse.json();
    if (!genData.images || !genData.images[0]) {
      console.error("Flux error:", genData);
      throw new Error("Flux Generation failed");
    }

    const rawImageUrl = genData.images[0].url;
    console.log("🖼️ Raw image URL:", rawImageUrl);

    // STEP 2: Remove Background using rembg with alpha matting
    console.log("✂️ A-CAM: Removing background...");
    const remBgResponse = await fetch("https://fal.run/fal-ai/imageutils/rembg", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_url: rawImageUrl,
        model: "u2net",
        alpha_matting: true,
        alpha_matting_foreground_threshold: 240,
        alpha_matting_background_threshold: 10,
        alpha_matting_erode_size: 10
      })
    });

    const remBgData = await remBgResponse.json();
    const finalUrl = remBgData.image?.url || remBgData.url || rawImageUrl;
    console.log("✅ Final URL:", finalUrl);

    return res.status(200).json({ images: [{ url: finalUrl }] });

  } catch (error) {
    console.error("❌ A-CAM Logic Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
