import { Router } from "express";
import { createUser } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { getUsers } from "../controllers/userController";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createUser
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getUsers
);

export default router;
