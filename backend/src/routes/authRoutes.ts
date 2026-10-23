// import { Router } from "express";
// import { authMiddleware } from "../middleware/authMiddleware";
// const router = Router();

// router.get("/profile", authMiddleware, (req, res) => {
//   res.json({
//     message: "You are authenticated",
//   });
// });

// export default router;



import { Router } from "express";
import { forgotPassword, login, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getProfile, updateProfile } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);

export default router;