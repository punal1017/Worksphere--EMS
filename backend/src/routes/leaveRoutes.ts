import { Router } from "express";
import {
  applyLeave,
  getMyLeaves,
  getPendingLeavesForAdmin,
  getPendingLeavesForHR,
  reviewLeaveByHR,
  reviewLeaveByAdmin,
} from "../controllers/leaveController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.post("/apply", authMiddleware, applyLeave);
router.get("/my-leaves", authMiddleware, getMyLeaves);
router.get("/pending-hr", authMiddleware, roleMiddleware("HR"), getPendingLeavesForHR);
router.get("/pending-admin", authMiddleware, roleMiddleware("ADMIN"), getPendingLeavesForAdmin);
router.patch("/:id/hr-review", authMiddleware, roleMiddleware("HR"), reviewLeaveByHR);
router.patch("/:id/admin-review", authMiddleware, roleMiddleware("ADMIN"), reviewLeaveByAdmin);

export default router;