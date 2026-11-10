
import { Router } from "express";

import {
  createPost,
  getPosts,
  togglePostReaction,
} from "../controllers/postController";

import { authMiddleware } from "../middleware/authMiddleware";
import { uploadPostImage } from "../middleware/uploadMiddleware";

const router = Router();

// Create a post with optional image
router.post(
  "/",
  authMiddleware,
  uploadPostImage,
  createPost,
);

// Fetch all posts
router.get(
  "/",
  authMiddleware,
  getPosts,
);

router.patch("/:postId/reaction", authMiddleware, togglePostReaction);
export default router;
