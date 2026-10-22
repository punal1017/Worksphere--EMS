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
import AppSidebar from "../../components/AppSidebar";

const API_URL = "http://localhost:5000/api";

type Profile = {
  name: string;
  email: string;
  role: string;
  dateOfBirth: string | null;
  address: string | null;
  phoneNumber: string | null;
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
      const response = await axios.patch<{ user: Profile }>(
        `${API_URL}/auth/profile`,
        form,
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

      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ ...storedUser, name: user.name }),
        );
      } catch {
        // The server update succeeded; cached sidebar data can refresh at next login.
      }

      setEditing(false);
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
            <Avatar sx={{ bgcolor: "#e8edff", color: "#4056c9", width: 48, height: 48 }}>
              <PersonRoundedIcon />
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
                      <TextField
                        label="Date of birth"
                        type="date"
                        fullWidth
                        value={form.dateOfBirth}
                        onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
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
