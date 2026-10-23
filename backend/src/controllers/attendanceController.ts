import prisma from "../config/prisma";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getTodayDateValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRange = (value: unknown) => {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const start = new Date(year, month - 1, day);

  if (
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    return null;
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

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

export const getAttendanceDashboardSummary = async (req: any, res: any) => {
  try {
    const dateValue =
      typeof req.query.date === "string"
        ? req.query.date
        : getTodayDateValue();
    const dateRange = getDateRange(dateValue);

    if (!dateRange) {
      return res.status(400).json({
        message: "Date must be a valid date in YYYY-MM-DD format",
      });
    }

    const isPersonalScope = req.user.role === "EMPLOYEE";
    const requestedUserId = Number(req.user.userId);

    if (!Number.isInteger(requestedUserId) || requestedUserId <= 0) {
      return res.status(401).json({ message: "Invalid user session" });
    }

    // The existing check-in endpoint is available to every authenticated role,
    // so all active roles remain eligible for company attendance totals.
    const eligibleUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        ...(isPersonalScope ? { id: requestedUserId } : {}),
      },
      select: { id: true },
    });
    const eligibleUserIds = eligibleUsers.map((user) => user.id);

    if (eligibleUserIds.length === 0) {
      return res.json({
        date: dateValue,
        scope: isPersonalScope ? "PERSONAL" : "COMPANY",
        total: 0,
        present: 0,
        absent: 0,
        onLeave: 0,
        breakdown: { PRESENT: 0, ABSENT: 0, ON_LEAVE: 0 },
      });
    }

    const [attendance, approvedLeaves] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          userId: { in: eligibleUserIds },
          date: { gte: dateRange.start, lt: dateRange.end },
          checkIn: { not: null },
        },
        select: { userId: true },
      }),
      prisma.leave.findMany({
        where: {
          userId: { in: eligibleUserIds },
          status: "APPROVED",
          startDate: { lt: dateRange.end },
          endDate: { gte: dateRange.start },
        },
        select: { userId: true },
      }),
    ]);

    const presentUserIds = new Set(attendance.map((record) => record.userId));
    const onLeaveUserIds = new Set(approvedLeaves.map((leave) => leave.userId));
    const present = presentUserIds.size;
    const onLeave = [...onLeaveUserIds].filter(
      (userId) => !presentUserIds.has(userId),
    ).length;
    const total = eligibleUserIds.length;
    const absent = total - present - onLeave;

    return res.json({
      date: dateValue,
      scope: isPersonalScope ? "PERSONAL" : "COMPANY",
      total,
      present,
      absent,
      onLeave,
      breakdown: {
        PRESENT: present,
        ABSENT: absent,
        ON_LEAVE: onLeave,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch attendance summary",
    });
  }
};
