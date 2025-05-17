require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const memeRoutes = require("./routes/memeRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/meme", memeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
