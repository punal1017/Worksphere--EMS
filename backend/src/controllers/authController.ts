import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export const login = async (req: any, res: any) => {
  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim()
      : "";
    const { password } = req.body;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = Number(req.user?.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid user session" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        dateOfBirth: true,
        address: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = Number(req.user?.userId);
    const { name, dateOfBirth, address, phoneNumber } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid user session" });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const parsedDate = dateOfBirth ? new Date(dateOfBirth) : null;
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        dateOfBirth: parsedDate,
        address: typeof address === "string" && address.trim() ? address.trim() : null,
        phoneNumber:
          typeof phoneNumber === "string" && phoneNumber.trim()
            ? phoneNumber.trim()
            : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        dateOfBirth: true,
        address: true,
        phoneNumber: true,
      },
    });

    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
