import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VITE_HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "HF error" });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}