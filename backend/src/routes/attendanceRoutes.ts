import { Router } from "express";
import {
  checkIn,
  checkOut,
  getAttendanceDashboardSummary,
  getMyAttendance,
} from "../controllers/attendanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/my-attendance", authMiddleware, getMyAttendance);
router.get(
  "/dashboard-summary",
  authMiddleware,
  getAttendanceDashboardSummary,
);


export default router;
