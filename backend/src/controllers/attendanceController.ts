import prisma from "../config/prisma";

const BUSINESS_TIME_ZONE = "Asia/Kolkata";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const attendanceInclude = { sessions: { orderBy: { checkIn: "asc" as const } } };

type SessionValue = {
  checkIn: Date;
  checkOut: Date | null;
};

const getBusinessDate = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);

const getDateRange = (value: unknown) => {
  const dateValue = typeof value === "string" ? value : getBusinessDate();
  if (!DATE_ONLY_PATTERN.test(dateValue)) return null;

  const [year, month, day] = dateValue.split("-").map(Number);
  const start = new Date(`${dateValue}T00:00:00+05:30`);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(start.getTime()) ||
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    dateValue,
    start,
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
};

const minutesBetween = (start: Date, end: Date) => {
  const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
  return Math.max(0, minutes);
};

const calculateAttendance = (
  attendance: {
    date: Date;
    checkIn: Date | null;
    checkOut: Date | null;
    sessions: SessionValue[];
  },
  now = new Date(),
) => {
  const sessions = attendance.sessions
    .filter(
      (session) =>
        session.checkIn instanceof Date &&
        (!session.checkOut || session.checkOut >= session.checkIn),
    )
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
  const firstCheckIn = sessions[0]?.checkIn ?? attendance.checkIn;
  const activeSession = sessions.find((session) => !session.checkOut);
  const lastClosed = [...sessions]
    .reverse()
    .find((session) => session.checkOut)?.checkOut ?? attendance.checkOut;
  const isToday = getBusinessDate(attendance.date) === getBusinessDate(now);
  const grossEnd = activeSession || (isToday && lastClosed) ? now : lastClosed;
  const grossDurationMinutes =
    firstCheckIn && grossEnd
      ? minutesBetween(firstCheckIn, grossEnd)
      : 0;
  let breakDurationMinutes = 0;

  for (let index = 1; index < sessions.length; index += 1) {
    const previous = sessions[index - 1];
    const current = sessions[index];
    if (previous.checkOut) {
      breakDurationMinutes += minutesBetween(
        previous.checkOut,
        current.checkIn,
      );
    }
  }
  if (!activeSession && isToday && lastClosed) {
    breakDurationMinutes += minutesBetween(lastClosed, now);
  }

  const netWorkingMinutes = Math.max(
    0,
    grossDurationMinutes - breakDurationMinutes,
  );
  const currentStatus = activeSession
    ? "WORKING"
    : sessions.length > 0
      ? "ON_BREAK"
      : "NOT_CHECKED_IN";

  return {
    firstCheckIn,
    lastCheckOut: activeSession ? null : lastClosed,
    grossDurationMinutes,
    breakDurationMinutes,
    netWorkingMinutes,
    currentStatus,
  };
};

const serializeAttendance = (attendance: {
  id: number;
  userId: number;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  sessions: SessionValue[];
}) => {
  const calculation = calculateAttendance(attendance);
  return {
  ...attendance,
  ...calculation,
  status: calculation.currentStatus,
  };
};

export const checkIn = async (req: any, res: any) => {
  try {
    const userId = Number(req.user?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid user session" });
    }
    const range = getDateRange(getBusinessDate());
    if (!range) return res.status(500).json({ message: "Invalid business date" });
    const now = new Date();
    const attendance = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${userId})`;
      const current = await transaction.attendance.findFirst({
        where: { userId, date: { gte: range.start, lt: range.end } },
        include: attendanceInclude,
      });
      const latest = current?.sessions[current.sessions.length - 1];
      if (latest && !latest.checkOut) {
        throw new Error("ALREADY_WORKING");
      }
      const daily = current
        ? current
        : await transaction.attendance.create({
            data: { userId, date: range.start, checkIn: now },
            include: attendanceInclude,
          });
      await transaction.attendanceSession.create({
        data: { attendanceId: daily.id, checkIn: now },
      });
      return transaction.attendance.update({
        where: { id: daily.id },
        data: { checkIn: daily.checkIn ?? now, checkOut: null },
        include: attendanceInclude,
      });
    });
    return res.status(201).json({
      message: "Check-in successful",
      attendance: serializeAttendance(attendance),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_WORKING") {
      return res.status(400).json({ message: "Already checked in and working" });
    }
    console.error(error);
    return res.status(500).json({ message: "Check-in failed" });
  }
};

export const checkOut = async (req: any, res: any) => {
  try {
    const userId = Number(req.user?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid user session" });
    }
    const now = new Date();
    const updated = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${userId})`;
      const currentDateRange = getDateRange(getBusinessDate());
      const attendance = await transaction.attendance.findFirst({
        where: {
          userId,
          date: { gte: currentDateRange!.start, lt: currentDateRange!.end },
        },
        include: attendanceInclude,
      });
      if (!attendance) throw new Error("NOT_CHECKED_IN");
      const activeSession = attendance.sessions[attendance.sessions.length - 1];
      if (!activeSession || activeSession.checkOut) {
        throw new Error("NOT_WORKING");
      }
      await transaction.attendanceSession.update({
        where: { id: activeSession.id },
        data: { checkOut: now },
      });
      return transaction.attendance.update({
        where: { id: attendance.id },
        data: { checkOut: now },
        include: attendanceInclude,
      });
    });
    return res.json({
      message: "Check-out successful",
      attendance: serializeAttendance(updated),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_CHECKED_IN") {
      return res.status(400).json({ message: "Please check in first" });
    }
    if (error instanceof Error && error.message === "NOT_WORKING") {
      return res.status(400).json({ message: "You are not currently working" });
    }
    console.error(error);
    return res.status(500).json({ message: "Check-out failed" });
  }
};

export const getMyAttendance = async (req: any, res: any) => {
  try {
    const userId = Number(req.user?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid user session" });
    }
    const attendance = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: attendanceInclude,
    });
    return res.json({ attendance: attendance.map(serializeAttendance) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch attendance history" });
  }
};

export const getAttendanceDashboardSummary = async (req: any, res: any) => {
  try {
    const dateValue =
      typeof req.query.date === "string" ? req.query.date : getBusinessDate();
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
    const eligibleUsers = await prisma.user.findMany({
      where: { status: "ACTIVE", ...(isPersonalScope ? { id: requestedUserId } : {}) },
      select: { id: true },
    });
    const eligibleUserIds = eligibleUsers.map((user) => user.id);
    if (eligibleUserIds.length === 0) {
      return res.json({
        date: dateValue, scope: isPersonalScope ? "PERSONAL" : "COMPANY",
        total: 0, present: 0, absent: 0, onLeave: 0,
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
    const onLeave = [...onLeaveUserIds].filter((id) => !presentUserIds.has(id)).length;
    const total = eligibleUserIds.length;
    const absent = total - present - onLeave;
    return res.json({
      date: dateValue, scope: isPersonalScope ? "PERSONAL" : "COMPANY",
      total, present, absent, onLeave,
      breakdown: { PRESENT: present, ABSENT: absent, ON_LEAVE: onLeave },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch attendance summary" });
  }
};
