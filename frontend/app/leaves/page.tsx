"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
Alert,
Avatar,
Box,
Button,
Card,
CardContent,
Chip,
CircularProgress,
Container,
Dialog,
DialogActions,
DialogContent,
DialogTitle,
Divider,
FormControl,
Grid,
InputLabel,
MenuItem,
Paper,
Select,
Snackbar,
Stack,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
TextField,
Typography,
} from "@mui/material";
import {
Add,
CheckCircleOutlineOutlined as CheckCircleOutline,
EventNote,
HourglassEmpty,
ThumbDownOutlined,
ThumbUpOutlined,
} from "@mui/icons-material";
import AppSidebar from "../../components/AppSidebar";
import { useProtectedRoute } from "../../components/ProtectedRoute";

const API_URL = "http://localhost:5000/api";

type Role = "ADMIN" | "HR" | "EMPLOYEE";

type LeaveRecord = {
id: string;
leaveType: string;
startDate: string;
endDate: string;
reason: string;
status: string;
requester?: {
id?: string;
name?: string;
email?: string;
role?: string;
};
createdAt?: string;
};

type CurrentUser = {
id: string;
name: string;
email: string;
role: Role;
};

const leaveTypes = [
"CASUAL",
"SICK",
"ANNUAL",
"UNPAID",
];

function getRecords(data: any): LeaveRecord[] {
if (Array.isArray(data)) return data;

const candidates = [
data?.leaves,
data?.requests,
data?.pendingLeaves,
data?.attendance,
data?.records,
data?.data,
];

for (const candidate of candidates) {
if (Array.isArray(candidate)) return candidate;
}

return [];
}

function formatDate(value?: string) {
if (!value) return "—";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return value;

return date.toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
}

function statusColor(
status: string
): "success" | "error" | "warning" | "info" | "default" {
const value = status?.toUpperCase();

if (value === "APPROVED") return "success";

if (
value === "HR_REJECTED" ||
value === "ADMIN_REJECTED" ||
value === "REJECTED"
) {
return "error";
}

if (value?.startsWith("PENDING")) return "warning";

return "default";
}

function statusLabel(status: string) {
const label = (status || "UNKNOWN").replaceAll("_", " ").toLowerCase();
return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function LeavesPage() {
useProtectedRoute();
const [user, setUser] = useState<CurrentUser | null>(null);
const [myLeaves, setMyLeaves] = useState<LeaveRecord[]>([]);
const [pendingLeaves, setPendingLeaves] = useState<LeaveRecord[]>([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [reviewingId, setReviewingId] = useState<string | null>(null);

const [formOpen, setFormOpen] = useState(false);
const [leaveType, setLeaveType] = useState("CASUAL");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [reason, setReason] = useState("");

const [snackbar, setSnackbar] = useState({
open: false,
message: "",
severity: "success" as "success" | "error",
});

const showMessage = (
message: string,
severity: "success" | "error" = "success"
) => {
setSnackbar({ open: true, message, severity });
};

const getHeaders = useCallback(() => {
const token = localStorage.getItem("accessToken");

if (!token) {
  throw new Error("Your session has expired. Please sign in again.");
}

return {
  Authorization: `Bearer ${token}`,
};

}, []);

const loadLeaves = useCallback(async (role: Role) => {
setLoading(true);

try {
  const headers = getHeaders();

  const requests: Promise<any>[] = [
    axios.get(`${API_URL}/leaves/my-leaves`, { headers }),
  ];

  if (role === "HR") {
    requests.push(
      axios.get(`${API_URL}/leaves/pending-hr`, { headers })
    );
  }

  if (role === "ADMIN") {
    requests.push(
      axios.get(`${API_URL}/leaves/pending-admin`, { headers })
    );
  }

  const responses = await Promise.all(requests);

  setMyLeaves(getRecords(responses[0].data));
  setPendingLeaves(
    responses.length > 1 ? getRecords(responses[1].data) : []
  );
} catch (error: any) {
  showMessage(
    error.response?.data?.message ||
      error.message ||
      "Could not load leave records.",
    "error"
  );
} finally {
  setLoading(false);
}

}, [getHeaders]);

useEffect(() => {
const token = localStorage.getItem("accessToken");
const storedUser = localStorage.getItem("currentUser");

if (!token || !storedUser) {
  window.location.href = "/signin";
  return;
}

try {
  const parsedUser = JSON.parse(storedUser) as CurrentUser;

  if (!["ADMIN", "HR", "EMPLOYEE"].includes(parsedUser.role)) {
    window.location.href = "/dashboard";
    return;
  }

  setUser(parsedUser);
  void loadLeaves(parsedUser.role);
} catch {
  window.location.href = "/signin";
}

}, [loadLeaves]);

const handleApplyLeave = async () => {
if (!leaveType || !startDate || !endDate || !reason.trim()) {
showMessage("Please fill in all leave details.", "error");
return;
}

if (endDate < startDate) {
  showMessage("End date cannot be before start date.", "error");
  return;
}

setSubmitting(true);

try {
  const headers = getHeaders();

  await axios.post(
    `${API_URL}/leaves/apply`,
    {
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
    },
    { headers }
  );

  showMessage("Leave application submitted successfully.");

  setFormOpen(false);
  setLeaveType("CASUAL");
  setStartDate("");
  setEndDate("");
  setReason("");

  if (user) {
    await loadLeaves(user.role);
  }
} catch (error: any) {
  showMessage(
    error.response?.data?.message ||
      "Could not submit your leave application.",
    "error"
  );
} finally {
  setSubmitting(false);
}

};

const handleReview = async (
leaveId: string,
action: "APPROVE" | "REJECT"
) => {
if (!user) return;

setReviewingId(leaveId);

try {
  const headers = getHeaders();

  const endpoint =
    user.role === "HR"
      ? `${API_URL}/leaves/${leaveId}/hr-review`
      : `${API_URL}/leaves/${leaveId}/admin-review`;

  await axios.patch(endpoint, { action }, { headers });

  showMessage(
    action === "APPROVE"
      ? "Leave approved successfully."
      : "Leave rejected successfully."
  );

  await loadLeaves(user.role);
} catch (error: any) {
  showMessage(
    error.response?.data?.message ||
      "Could not review this leave request.",
    "error"
  );
} finally {
  setReviewingId(null);
}

};

if (!user) {
return (
<Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#f6f8fc" }}>
<AppSidebar />
<Box sx={{ flex: 1, minHeight: "60vh", display: "grid", placeItems: "center" }}>
<CircularProgress />
</Box>
</Box>
);
}

const canApply = user.role !== "ADMIN";

const pendingCount = myLeaves.filter((leave) =>
leave.status?.startsWith("PENDING")
).length;

const approvedCount = myLeaves.filter(
(leave) => leave.status === "APPROVED"
).length;

const rejectedCount = myLeaves.filter((leave) =>
["HR_REJECTED", "ADMIN_REJECTED", "REJECTED"].includes(leave.status)
).length;

return (
<Box
sx={{
minHeight: "100vh",
bgcolor: "#f6f8fc",
display: "flex",
}}
>
<AppSidebar />
<Box sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
<Container maxWidth="xl">
{/* Page heading */}
<Stack
direction={{ xs: "column", sm: "row" }}
justifyContent="space-between"
alignItems={{ xs: "flex-start", sm: "center" }}
spacing={2}
sx={{ mb: 4, width: "100%", position: "relative" }}
>
<Box>
<Stack direction="row" alignItems="center" spacing={1}>
<Avatar
sx={{
bgcolor: "#e8edff",
color: "#4056c9",
width: 46,
height: 46,
borderRadius: 2.5,
}}
>
<EventNote />
</Avatar>

          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color="#172554"
              sx={{ fontSize: { xs: 25, md: 32 ,color: "#172554"}  }}
            >
              Leave Management
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { color: "#172554"}  }}> 
              Welcome, {user.name} · {user.role}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{
          width: { xs: "100%", sm: "auto" },
          position: { xs: "static", sm: "absolute" },
          right: { sm: 0 },
          top: { sm: "50%" },
          transform: { sm: "translateY(-50%)" },
        }}
      >
      
    

        {canApply && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 2.5,
              bgcolor: "#4056c9",
              ml: { xs: "auto", sm: 0 },
              
              "&:hover": { bgcolor: "#3045ae" },
            }}
          >
            Apply leave
          </Button>
        )}
      </Stack>
    </Stack>

    {/* Summary cards */}
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {[
        {
          label: "Total Applications",
          value: myLeaves.length,
          icon: <EventNote />,
          color: "#4056c9",
        },
        {
          label: "Pending",
          value: pendingCount,
          icon: <HourglassEmpty />,
          color: "#d97706",
        },
        {
          label: "Approved",
          value: approvedCount,
          icon: <CheckCircleOutline />,
          color: "#16835d",
        },
        {
          label: "Rejected",
          value: rejectedCount,
          icon: <ThumbDownOutlined />,
          color: "#dc4545",
        },
      ].map((item) => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e7eaf2",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: "100%" }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ mt: 1, color: "#172554" }}
                  >
                    {loading ? "—" : item.value}
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: `${item.color}15`,
                    color: item.color,
                    borderRadius: 2.5,
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* HR/Admin pending requests */}
    {(user.role === "HR" || user.role === "ADMIN") && (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e7eaf2",
          borderRadius: 3,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} color="#172554">
            {user.role === "HR"
              ? "Employee Leave Requests"
              : "Final Approval Requests"}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user.role === "HR"
              ? "Review employee leave applications at the HR stage."
              : "Review requests waiting for final Admin approval."}
          </Typography>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ py: 5, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : pendingLeaves.length === 0 ? (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Avatar
              sx={{
                mx: "auto",
                mb: 1.5,
                bgcolor: "#e8f7ef",
                color: "#16835d",
              }}
            >
              <CheckCircleOutline />
            </Avatar>
            <Typography fontWeight={700}>All caught up!</Typography>
            <Typography variant="body2" color="text.secondary">
              There are no pending leave requests for your review.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 850 }}>
              <TableHead sx={{ bgcolor: "#f8faff" }}>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Leave type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pendingLeaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {leave.requester?.name || "Applicant"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {leave.requester?.email || ""}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {leave.leaveType || "—"}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(leave.startDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {formatDate(leave.endDate)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2">
                        {leave.reason || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={statusColor(leave.status)}
                        label={statusLabel(leave.status)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ThumbUpOutlined />}
                          disabled={reviewingId === leave.id}
                          onClick={() =>
                            void handleReview(leave.id, "APPROVE")
                          }
                          sx={{ textTransform: "none" }}
                        >
                          Approve
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<ThumbDownOutlined />}
                          disabled={reviewingId === leave.id}
                          onClick={() =>
                            void handleReview(leave.id, "REJECT")
                          }
                          sx={{ textTransform: "none" }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    )}

    {/* My leave history */}
    {user.role !== "ADMIN" && (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e7eaf2",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={800} color="#172554">
          My Leave History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track your applications and approval status.
        </Typography>
      </Box>

      <Divider />

      {loading ? (
        <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : myLeaves.length === 0 ? (
        <Box sx={{ p: 6, textAlign: "center" }}>
          <EventNote sx={{ fontSize: 42, color: "#9ca3af", mb: 1 }} />
          <Typography fontWeight={700}>No leave applications yet</Typography>
          <Typography variant="body2" color="text.secondary">
            {canApply
              ? "Use Apply Leave to submit your first request."
              : "Your leave history will appear here when available."}
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: "#f8faff" }}>
              <TableRow>
                <TableCell>Leave type</TableCell>
                <TableCell>Start date</TableCell>
                <TableCell>End date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {myLeaves.map((leave) => (
                <TableRow key={leave.id} hover>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {leave.leaveType || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>

                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2">
                      {leave.reason || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color={statusColor(leave.status)}
                      label={statusLabel(leave.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      </Paper>
    )}
  </Container>

  {/* Apply leave dialog */}
  <Dialog
    open={formOpen}
    onClose={() => !submitting && setFormOpen(false)}
    fullWidth
    maxWidth="sm"
  >
    <DialogTitle sx={{ fontWeight: 800, color: "#172554" }}>
      Apply for leave
    </DialogTitle>

    <DialogContent>
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Enter the dates and reason for your leave.
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="leave-type-label">Leave type</InputLabel>
          <Select
            labelId="leave-type-label"
            value={leaveType}
            label="Leave type"
            onChange={(event) => setLeaveType(event.target.value)}
          >
            {leaveTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Start date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          inputProps={{ min: new Date().toISOString().slice(0, 10) }}
        />

        <TextField
          label="End date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
          inputProps={{ min: startDate || new Date().toISOString().slice(0, 10) }}
        />

        <TextField
          label="Reason for leave"
          placeholder="Briefly explain why you need leave..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
      </Stack>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button
        onClick={() => setFormOpen(false)}
        disabled={submitting}
        sx={{ textTransform: "none" }}
      >
        Cancel
      </Button>

      <Button
        variant="contained"
        onClick={() => void handleApplyLeave()}
        disabled={submitting}
        sx={{
          textTransform: "none",
          bgcolor: "#4056c9",
          "&:hover": { bgcolor: "#3045ae" },
        }}
      >
        {submitting ? "Submitting..." : "Submit application"}
      </Button>
    </DialogActions>
  </Dialog>

  <Snackbar
    open={snackbar.open}
    autoHideDuration={4000}
    onClose={() =>
      setSnackbar((previous) => ({ ...previous, open: false }))
    }
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  >
    <Alert
      severity={snackbar.severity}
      variant="filled"
      onClose={() =>
        setSnackbar((previous) => ({ ...previous, open: false }))
      }
    >
      {snackbar.message}
    </Alert>
  </Snackbar>
</Box>
</Box>

);
}