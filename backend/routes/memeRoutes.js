const express = require("express");
const router = express.Router();
const axios = require("axios");
const  FormData = require("form-data");
const { generateTextMeme } = require("../controllers/memeController");

// POST /api/meme/text
router.post("/text", generateTextMeme);

// POST /api/meme/image
router.post("/image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: "Prompt is required" 
    });
  }

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "png");
    
    // You might want to add some parameters for better results
    formData.append("model", "stable-diffusion-xl-1024-v1-0");
    formData.append("seed", 0); // Optional: for reproducibility
    formData.append("cfg_scale", 7); // Optional: creativity vs prompt adherence
    formData.append("steps", 30); // Optional: quality vs speed

    const stabilityResponse = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json",
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (!stabilityResponse.data.image) {
      throw new Error("No image data received from Stability AI");
    }

    return res.json({ 
      success: true, 
      imageUrl: `data:image/png;base64,${stabilityResponse.data.image}` 
    });

  } catch (err) {
    console.error("Stability AI error:", err.response?.data || err.message);
    
    // More specific error messages
    let errorMessage = "Image generation failed";
    if (err.response?.status === 429) {
      errorMessage = "API rate limit exceeded";
    } else if (err.response?.status === 403) {
      errorMessage = "Invalid API key or permissions";
    }

    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
