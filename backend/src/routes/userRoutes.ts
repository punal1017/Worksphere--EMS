import { Router } from "express";
import { createUser } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { getUsers } from "../controllers/userController";
import { updateUserStatus } from "../controllers/userController";
import { updateUser } from "../controllers/userController";
import { deleteUser } from "../controllers/userController";

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


router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateUserStatus
);


router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateUser
);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteUser
);



export default router;
