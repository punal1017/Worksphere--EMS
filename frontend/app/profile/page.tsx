"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import AppSidebar from "../../components/AppSidebar";
import { useProtectedRoute } from "../../components/ProtectedRoute";
import CalendarDateField from "../../components/CalendarDateField";

const API_URL = "http://localhost:5000/api";
const BACKEND_URL = API_URL.replace(/\/api$/, "");

type Profile = {
  name: string;
  email: string;
  role: string;
  dateOfBirth: string | null;
  address: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
};

type ProfileForm = {
  name: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
};

const formatDate = (value: string | null) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function ProfilePage() {
  useProtectedRoute();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState("");

  useEffect(() => {
    if (!selectedProfilePicture) {
      setPicturePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(selectedProfilePicture);
    setPicturePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedProfilePicture]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.replace("/sign-in");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await axios.get<{ user: Profile }>(
          `${API_URL}/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const user = response.data.user;
        setProfile(user);
        setForm({
          name: user.name,
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
          address: user.address || "",
          phoneNumber: user.phoneNumber || "",
        });
        setSelectedProfilePicture(null);
      } catch (requestError) {
        const message = axios.isAxiosError(requestError)
          ? requestError.response?.data?.message
          : undefined;
        setError(message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("address", form.address);
      formData.append("phoneNumber", form.phoneNumber);
      if (selectedProfilePicture) {
        formData.append("profilePicture", selectedProfilePicture);
      }

      const response = await axios.patch<{ user: Profile }>(
        `${API_URL}/auth/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const user = response.data.user;
      setProfile(user);
      setForm({
        name: user.name,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
      });
      setSelectedProfilePicture(null);

      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...storedUser,
            name: user.name,
            profilePicture: user.profilePicture,
          }),
        );
        window.dispatchEvent(new Event("worksphere-profile-updated"));
      } catch {
        // The server update succeeded; cached sidebar data can refresh at next login.
      }

      setEditing(false);
      setError("");
      setSuccessMessage("Changes saved successfully");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#f6f8fc" }}>
      <AppSidebar />
      <Box sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="md">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
            <Avatar
              src={profile?.profilePicture ? `${BACKEND_URL}${profile.profilePicture}` : undefined}
              sx={{ bgcolor: "#e8edff", color: "#4056c9", width: 48, height: 48 }}
            >
              {!profile?.profilePicture && <PersonRoundedIcon />}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#172554" }}>
                My Profile
              </Typography >
              <Typography sx={{ color: "#172554" }}>
                Manage your personal information
              </Typography>
            </Box>
          </Stack>

          <Card elevation={0} sx={{ border: "1px solid #e7eaf2", borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {loading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : profile ? (
                <Stack spacing={2.5}>
                  {editing ? (
                    <>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          component="label"
                          sx={{
                            position: "relative",
                            display: "inline-flex",
                            cursor: "pointer",
                            borderRadius: "50%",
                            overflow: "hidden",
                            "&:hover .profile-picture-overlay": {
                              opacity: 1,
                            },
                          }}
                        >
                          <Avatar
                            src={
                              picturePreview ||
                              (profile.profilePicture
                                ? `${BACKEND_URL}${profile.profilePicture}`
                                : undefined)
                            }
                            sx={{ width: 86, height: 86, bgcolor: "#e8edff", color: "#4056c9" }}
                          >
                            {!picturePreview && !profile.profilePicture && <PersonRoundedIcon />}
                          </Avatar>
                          <Box
                            className="profile-picture-overlay"
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "rgba(15, 23, 42, 0.58)",
                              color: "white",
                              opacity: 0,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            <CameraAltRoundedIcon />
                          </Box>
                          <input
                            hidden
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (!file) return;
                              if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
                                setError("Use a JPG, PNG, WEBP, or GIF image.");
                                return;
                              }
                              if (file.size > 5 * 1024 * 1024) {
                                setError("Profile pictures must be 5 MB or smaller.");
                                return;
                              }
                              setSelectedProfilePicture(file);
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          
                        </Typography>
                      </Stack>
                      <TextField
                        label="Name"
                        fullWidth
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                      />
                      <TextField
                        label="Email"
                        fullWidth
                        value={profile.email}
                        disabled
                      />
                      <CalendarDateField
                        label="Date of birth"
                        value={form.dateOfBirth}
                        onChange={(dateOfBirth) => setForm({ ...form, dateOfBirth })}
                      />
                      <TextField
                        label="Address"
                        fullWidth
                        multiline
                        minRows={2}
                        value={form.address}
                        onChange={(event) => setForm({ ...form, address: event.target.value })}
                      />
                      <TextField
                        label="Phone number"
                        fullWidth
                        value={form.phoneNumber}
                        onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                      />
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          onClick={() => setEditing(false)}
                          disabled={saving}
                          sx={{ textTransform: "none" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => void saveProfile()}
                          disabled={saving}
                          sx={{ textTransform: "none" }}
                        >
                          {saving ? "Saving..." : "Save changes"}
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <ProfileField label="Name" value={profile.name} />
                      <ProfileField label="Email" value={profile.email} />
                      <ProfileField label="Role" value={profile.role} />
                      <ProfileField label="Date of birth" value={formatDate(profile.dateOfBirth)} />
                      <ProfileField label="Address" value={profile.address || "Not provided"} />
                      <ProfileField label="Phone number" value={profile.phoneNumber || "Not provided"} />
                      <Button
                        variant="contained"
                        onClick={() => setEditing(true)}
                        sx={{ alignSelf: "flex-end", textTransform: "none" }}
                      >
                        Edit profile
                      </Button>
                    </>
                  )}
                </Stack>
              ) : null}
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8, zIndex: 1500 }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ pb: 2, borderBottom: "1px solid #eef2f7" }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, color: "#172554" }}>{value}</Typography>
    </Box>
  );
}
