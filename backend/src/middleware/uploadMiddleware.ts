import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Local folder where images will be stored
const uploadDirectory = path.resolve(process.cwd(), "uploads");
const profilePicturesDirectory = path.resolve(
  process.cwd(),
  "profilePictures",
);

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
if (!fs.existsSync(profilePicturesDirectory)) {
  fs.mkdirSync(profilePicturesDirectory, { recursive: true });
}

// Configure where and how files will be saved
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${randomUUID()}${extension}`);
  },
});

// Allow only image files
const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export const uploadPostImage = upload.single("image");

const profilePictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profilePicturesDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProfilePicture = profilePictureUpload.single("profilePicture");