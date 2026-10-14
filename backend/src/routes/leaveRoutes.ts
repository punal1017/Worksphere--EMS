import { Router } from "express";
import { applyLeave, getMyLeaves, reviewLeaveByHR ,reviewLeaveByAdmin} from "../controllers/leaveController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getPendingLeavesForHR } from "../controllers/leaveController";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.post("/apply", authMiddleware, applyLeave);
router.get("/my-leaves", authMiddleware, getMyLeaves);
router.get("/pending-hr", authMiddleware, roleMiddleware("HR"), getPendingLeavesForHR);
router.patch("/:id/hr-review",authMiddleware,roleMiddleware("HR"),reviewLeaveByHR);
router.patch("/:id/admin-review",authMiddleware,roleMiddleware("ADMIN"),reviewLeaveByAdmin);

export default router;