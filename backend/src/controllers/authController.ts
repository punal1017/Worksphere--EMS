import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { sendPasswordResetEmail } from "../config/mailer";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const hashResetToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const login = async (req: any, res: any) => {
  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim()
      : "";
    const { password } = req.body;

    if (!emailPattern.test(email)) {
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

export const forgotPassword = async (req: any, res: any) => {
  try {
    const email =
      typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash, resetTokenExpiry },
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error("Failed to send password reset email", error);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash: null, resetTokenExpiry: null },
      });
      return res.status(500).json({ message: "Unable to send password reset email" });
    }

    return res.json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    console.error("Forgot password request failed", error);
    return res.status(500).json({ message: "Unable to process password reset request" });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const token = typeof req.body.token === "string" ? req.body.token.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
      });
    }

    const resetTokenHash = hashResetToken(token);
    const now = new Date();
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiry: { gt: now },
      },
      select: { id: true },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updated = await prisma.$transaction(async (transaction) => {
      const tokenClaim = await transaction.user.updateMany({
        where: {
          id: user.id,
          resetTokenHash,
          resetTokenExpiry: { gt: new Date() },
        },
        data: {
          password: hashedPassword,
          resetTokenHash: null,
          resetTokenExpiry: null,
        },
      });

      return tokenClaim.count;
    });

    if (updated !== 1) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password request failed", error);
    return res.status(500).json({ message: "Unable to reset password" });
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
