import prisma from "../config/prisma";

export const applyLeave = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid leave dates",
      });
    }

    if (start > end) {
      return res.status(400).json({
        message: "End date must be after or equal to start date",
      });
    }

    const leave = await prisma.leave.create({
      data: {
        userId,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
      },
    });

    return res.status(201).json({
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to apply for leave",
    });
  }
};

export const getMyLeaves = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;

    const leaves = await prisma.leave.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ leaves });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch leave history",
    });
  }
};


export const getPendingLeavesForHR = async (req: any, res: any) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: {
        status: "PENDING_HR",
        requester: {
          role: "EMPLOYEE",
        },
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Pending employee leaves fetched successfully",
      leaves,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch pending leaves",
    });
  }
};


export const reviewLeaveByHR = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({
        message: "Action must be APPROVE or REJECT",
      });
    }

    const leave = await prisma.leave.findUnique({
      where: { id: Number(id) },
      include: {
        requester: {
          select: { role: true },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "PENDING_HR") {
      return res.status(400).json({
        message: "This leave is not pending HR review",
      });
    }

    if (leave.requester.role !== "EMPLOYEE") {
      return res.status(400).json({
        message: "HR can review employee leaves only",
      });
    }

    const updatedLeave = await prisma.leave.update({
      where: { id: Number(id) },
      data: {
        status: action === "APPROVE" ? "PENDING_ADMIN" : "HR_REJECTED",
        hrApprovedBy: req.user.userId,
        hrApprovedAt: new Date(),
      },
    });

    return res.status(200).json({
      message:
        action === "APPROVE"
          ? "Leave approved by HR and forwarded to Admin"
          : "Leave rejected by HR",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to review leave",
    });
  }
};

export const reviewLeaveByAdmin = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({
        message: "Action must be APPROVE or REJECT",
      });
    }

    const leave = await prisma.leave.findUnique({
      where: { id: Number(id) },
      include: {
        requester: {
          select: { role: true },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Employee leave must first be approved by HR
    if (
      leave.requester.role === "EMPLOYEE" &&
      leave.status !== "PENDING_ADMIN"
    ) {
      return res.status(400).json({
        message: "Employee leave must be approved by HR first",
      });
    }

    // HR's own leave goes directly to Admin
    if (
      leave.requester.role === "HR" &&
      leave.status !== "PENDING_HR"
    ) {
      return res.status(400).json({
        message: "This HR leave has already been reviewed",
      });
    }

    if (leave.requester.role === "ADMIN") {
      return res.status(400).json({
        message: "Admin cannot review their own leave",
      });
    }

    const updatedLeave = await prisma.leave.update({
      where: { id: Number(id) },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "ADMIN_REJECTED",
        adminApprovedBy: req.user.userId,
        adminApprovedAt: new Date(),
      },
    });

    return res.status(200).json({
      message:
        action === "APPROVE"
          ? "Leave finally approved by Admin"
          : "Leave rejected by Admin",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to review leave",
    });
  }
};
