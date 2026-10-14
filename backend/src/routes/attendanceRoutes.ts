import { Router } from "express";
import { checkIn, checkOut, getMyAttendance } from "../controllers/attendanceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/my-attendance", authMiddleware, getMyAttendance);


export default router;