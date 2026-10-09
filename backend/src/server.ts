import express from "express";
import prisma from "./config/prisma";
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      message: "Employee Management API is running",
      database: "Connected",
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});