import cors = require("cors");
import dotenv = require("dotenv");
import express = require("express");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Catechism Management API is running!",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
