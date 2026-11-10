
import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs/promises";

// CREATE POST (HR only)
export const createPost = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const userId = Number(currentUser.userId);

    // Only HR can create posts
    if (currentUser.role !== "HR") {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      return res.status(403).json({
        message: "Only HR can create posts.",
      });
    }

    const content = req.body.content?.trim();
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    // At least text or image is required
    if (!content && !imageUrl) {
      return res.status(400).json({
        message: "Please provide text or an image.",
      });
    }

    const post = await prisma.post.create({
      data: {
        content: content || null,
        imageUrl,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);

    // Remove uploaded image if database creation fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      message: "Could not create post.",
    });
  }
};


// GET ALL POSTS
export const getPosts = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const userId = Number(currentUser.userId);

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        reactions: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const likes = post.reactions.filter(
        (reaction) => reaction.type === "LIKE",
      ).length;

      const dislikes = post.reactions.filter(
        (reaction) => reaction.type === "DISLIKE",
      ).length;

      const myReaction =
        post.reactions.find(
          (reaction) => reaction.userId === userId,
        )?.type || null;

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likes,
        dislikes,
        myReaction,
      };
    });

    return res.status(200).json({
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    return res.status(500).json({
      message: "Could not fetch posts.",
    });
  }
};

// UPDATE POST (HR only)
export const updatePost = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (currentUser.role !== "HR") {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ message: "Only HR can edit posts." });
    }

    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId) || postId <= 0) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ message: "Post not found." });
    }

    const content = typeof req.body.content === "string"
      ? req.body.content.trim()
      : post.content;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : post.imageUrl;

    if (!content && !imageUrl) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ message: "Please provide text or an image." });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content: content || null, imageUrl },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    if (req.file && post.imageUrl?.startsWith("/uploads/")) {
      await fs.unlink(`${process.cwd()}${post.imageUrl}`).catch(() => {});
    }

    return res.json({ message: "Post updated successfully.", post: updatedPost });
  } catch (error) {
    console.error("Update post error:", error);
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({ message: "Could not update post." });
  }
};

// DELETE POST (HR only)
export const deletePost = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (currentUser.role !== "HR") {
      return res.status(403).json({ message: "Only HR can delete posts." });
    }

    const postId = Number(req.params.postId);
    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found." });

    await prisma.post.delete({ where: { id: postId } });
    if (post.imageUrl?.startsWith("/uploads/")) {
      await fs.unlink(`${process.cwd()}${post.imageUrl}`).catch(() => {});
    }

    return res.json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({ message: "Could not delete post." });
  }
};


// LIKE / DISLIKE POST
export const togglePostReaction = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const userId = Number(currentUser.userId);
    const postId = Number(req.params.postId);
    const { type } = req.body;

    // Only ADMIN and EMPLOYEE can react
    if (!["ADMIN", "EMPLOYEE"].includes(currentUser.role)) {
      return res.status(403).json({
        message: "You are not allowed to react to posts.",
      });
    }

    // Validate post ID
    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    // Validate reaction type
    if (!["LIKE", "DISLIKE"].includes(type)) {
      return res.status(400).json({
        message: "Reaction must be LIKE or DISLIKE.",
      });
    }

    // Check whether post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Check existing reaction
    const existingReaction = await prisma.postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction clicked again: remove it
        await prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        // Different reaction: update it
        await prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
      }
    } else {
      // First reaction
      await prisma.postReaction.create({
        data: {
          postId,
          userId,
          type,
        },
      });
    }

    // Get updated reactions
    const reactions = await prisma.postReaction.findMany({
      where: { postId },
      select: { userId: true, type: true },
    });

    const likes = reactions.filter((r) => r.type === "LIKE").length;
    const dislikes = reactions.filter((r) => r.type === "DISLIKE").length;

    const myReaction =
      reactions.find((r) => r.userId === userId)?.type || null;

    return res.status(200).json({
      message: "Reaction updated successfully.",
      likes,
      dislikes,
      myReaction,
    });
  } catch (error) {
    console.error("Post reaction error:", error);
    return res.status(500).json({
      message: "Could not update reaction.",
    });
  }
};