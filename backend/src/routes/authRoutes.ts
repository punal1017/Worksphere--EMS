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
import { login } from "../controllers/authController";

const router = Router();

router.post("/login", login);

export default router;