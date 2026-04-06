export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image } = req.body; // This is the Base64 from A-CAM
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe only the clothing and accessories of the person in this image in one concise sentence for an AI prompt. Focus on colors, materials, and specific items (e.g., 'A matte black tactical vest over a grey cotton hoodie'). Do not mention the person's face or body." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    const data = await response.json();
    const description = data.choices[0].message.content;
    res.status(200).json({ description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
