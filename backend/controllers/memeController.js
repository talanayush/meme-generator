const axios = require("axios");

exports.generateTextMeme = async (req, res) => {
  try {
    const { theme } = req.body;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: `Write a single funny meme about: ${theme}` }] }],
      }
    );

    const memeText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't generate meme.";

    res.json({ success: true, memeText });
  } catch (error) {
    console.error(error?.response?.data || error);
    res.status(500).json({ success: false, error: "Failed to generate text meme" });
  }
};

exports.generateImageMeme = async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABLE_DIFFUSION_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imageUrl = response.data?.image_url || "Image generation failed";

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error(error?.response?.data || error);
    res.status(500).json({ success: false, error: "Failed to generate image meme" });
  }
};
