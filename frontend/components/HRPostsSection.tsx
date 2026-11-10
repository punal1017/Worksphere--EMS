"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";

type Role = "ADMIN" | "HR" | "EMPLOYEE";
type Reaction = "LIKE" | "DISLIKE" | null;

type PostAuthor = {
  id: string | number;
  name: string;
  role: Role;
};

type Post = {
  id: string | number;
  content: string | null;
  imageUrl: string | null;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  myReaction: Reaction;
};

type PostsResponse = {
  posts: Post[];
};

type ReactionResponse = {
  likes: number;
  dislikes: number;
  myReaction: Reaction;
};

type Feedback = {
  severity: "success" | "error";
  message: string;
};

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");
const API_URL = `${BACKEND_URL}/api`;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const getStoredRole = (): Role | null => {
  if (typeof window === "undefined") return null;

  const savedUser = localStorage.getItem("currentUser");
  if (!savedUser) return null;

  try {
    const parsedUser = JSON.parse(savedUser) as { role?: Role };
    return parsedUser.role === "ADMIN" ||
      parsedUser.role === "HR" ||
      parsedUser.role === "EMPLOYEE"
      ? parsedUser.role
      : null;
  } catch {
    return null;
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

export default function HRPostsSection() {
  const router = useRouter();
  const [role] = useState<Role | null>(getStoredRole);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reactingPostId, setReactingPostId] = useState<string | number | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    router.replace("/sign-in");
  }, [router]);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token || ""}` };
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get<PostsResponse>(`${API_URL}/posts`, {
        headers: getHeaders(),
      });
      setPosts(response.data.posts);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getErrorMessage(requestError, "Could not load posts."));
    } finally {
      setLoading(false);
    }
  }, [getHeaders, handleUnauthorized]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const imageUrl = useCallback((path: string) => {
    return path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  }, []);

  const formattedDate = useMemo(
    () =>
      (date: string) =>
        new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(date)),
    [],
  );

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFeedback({ severity: "error", message: "Use a JPG, PNG, WEBP, or GIF image." });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFeedback({ severity: "error", message: "Images must be 5 MB or smaller." });
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedImage) {
      setFeedback({ severity: "error", message: "Add some text or select an image before publishing." });
      return;
    }

    const formData = new FormData();
    if (content.trim()) formData.append("content", content.trim());
    if (selectedImage) formData.append("image", selectedImage);

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/posts`, formData, { headers: getHeaders() });
      setContent("");
      removeImage();
      setFeedback({ severity: "success", message: "Post published successfully." });
      await fetchPosts();
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setFeedback({ severity: "error", message: getErrorMessage(requestError, "Could not publish the post.") });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (post: Post, type: "LIKE" | "DISLIKE") => {
    if (reactingPostId !== null) return;
    setReactingPostId(post.id);

    try {
      const response = await axios.patch<ReactionResponse>(
        `${API_URL}/posts/${post.id}/reaction`,
        { type },
        { headers: getHeaders() },
      );
      setPosts((currentPosts) =>
        currentPosts.map((currentPost) =>
          currentPost.id === post.id
            ? { ...currentPost, ...response.data }
            : currentPost,
        ),
      );
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setFeedback({ severity: "error", message: getErrorMessage(requestError, "Could not update your reaction.") });
    } finally {
      setReactingPostId(null);
    }
  };

  return (
    <Stack spacing={2.5}>
      {role === "HR" && (
        <Card elevation={0} sx={{ border: "1px solid #e5eaf2", borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" color="#172554" sx={{ fontWeight: 800 }}>
              Create Post
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share an announcement with your company..."
              sx={{ mt: 2 }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddPhotoAlternateOutlinedIcon />}
                disabled={submitting}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Add image
                <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
              </Button>
              <Button
                variant="contained"
                onClick={handleCreatePost}
                disabled={submitting || (!content.trim() && !selectedImage)}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Publish Post"}
              </Button>
            </Stack>
            {imagePreview && (
              <Box sx={{ position: "relative", mt: 2, width: "fit-content" }}>
                <Box component="img" src={imagePreview} alt="Selected preview" sx={{ display: "block", maxWidth: "100%", width: 240, maxHeight: 180, objectFit: "cover", borderRadius: 2 }} />
                <Tooltip title="Remove image">
                  <IconButton onClick={removeImage} size="small" sx={{ position: "absolute", top: 6, right: 6, bgcolor: "white", "&:hover": { bgcolor: "#f8fafc" } }}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : posts.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid #e5eaf2", borderRadius: 3 }}>
          <CardContent><Typography color="text.secondary">No posts have been published yet.</Typography></CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} elevation={0} sx={{ border: "1px solid #e5eaf2", borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 700 }}>
                  {post.author.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{post.author.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.author.role} · {formattedDate(post.createdAt)}
                  </Typography>
                </Box>
              </Stack>
              {post.content && <Typography sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{post.content}</Typography>}
              {post.imageUrl && (
                <Box component="img" src={imageUrl(post.imageUrl)} alt="Post attachment" sx={{ display: "block", width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 2, mt: 2 }} />
              )}
              {role !== "HR" && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    startIcon={post.myReaction === "LIKE" ? <ThumbUpAltRoundedIcon /> : <ThumbUpAltOutlinedIcon />}
                    onClick={() => void handleReaction(post, "LIKE")}
                    disabled={reactingPostId !== null}
                    sx={{ textTransform: "none", color: post.myReaction === "LIKE" ? "#2563eb" : "text.secondary" }}
                  >
                    {post.likes}
                  </Button>
                  <Button
                    size="small"
                    startIcon={post.myReaction === "DISLIKE" ? <ThumbDownAltRoundedIcon /> : <ThumbDownAltOutlinedIcon />}
                    onClick={() => void handleReaction(post, "DISLIKE")}
                    disabled={reactingPostId !== null}
                    sx={{ textTransform: "none", color: post.myReaction === "DISLIKE" ? "#dc2626" : "text.secondary" }}
                  >
                    {post.dislikes}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar open={Boolean(feedback)} autoHideDuration={4500} onClose={() => setFeedback(null)}>
        {feedback ? <Alert onClose={() => setFeedback(null)} severity={feedback.severity} variant="filled">{feedback.message}</Alert> : undefined}
      </Snackbar>
    </Stack>
  );
}
