import bcrypt from "bcrypt";
import prisma from "../config/prisma";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const createUser = async (req: any, res: any) => {
  try {
    const {
      name,
      email,
      password,
      role,
      dateOfBirth,
      address,
      phoneNumber,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (typeof password !== "string" || !passwordPattern.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const parsedDate = dateOfBirth ? new Date(dateOfBirth) : null;

    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        dateOfBirth: parsedDate,
        address: typeof address === "string" && address.trim() ? address.trim() : null,
        phoneNumber:
          typeof phoneNumber === "string" && phoneNumber.trim()
            ? phoneNumber.trim()
            : null,
      },
    });

    res.status(201).json({
      message: "User created successfully",
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
      message: "Failed to create user",
    });
  }
};


export const getUsers = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        dateOfBirth: true,
        address: true,
        phoneNumber: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};


export const updateUserStatus = async (req: any, res: any) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return res.json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update user status",
    });
  }
};


export const updateUser = async (req: any, res: any) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, role, dateOfBirth, address, phoneNumber } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!["HR", "EMPLOYEE"].includes(role)) {
      return res.status(400).json({
        message: "Role must be HR or EMPLOYEE",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.role === "ADMIN") {
      return res.status(403).json({
        message: "Admin account cannot be edited through this API",
      });
    }

    const parsedDate = dateOfBirth ? new Date(dateOfBirth) : null;
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
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

    return res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update user",
    });
  }
};  

export const deleteUser = async (req: any, res: any) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({
        message: "Admin account cannot be deleted",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to delete user",
    });
  }
};