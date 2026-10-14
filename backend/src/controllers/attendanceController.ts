import prisma from "../config/prisma";

export const checkIn = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: new Date(),
      },
    });

    return res.status(201).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Check-in failed",
    });
  }
};

export const checkOut = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Please check in first",
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        message: "Check-in not found",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out today",
      });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
      },
    });

    return res.json({
      message: "Check-out successful",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Check-out failed",
    });
  }
};

export const getMyAttendance = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const attendance = await prisma.attendance.findMany({
      where: { userId },
      orderBy: {
        date: "desc",
      },
    });

    return res.json({ attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch attendance history",
    });
  }
};