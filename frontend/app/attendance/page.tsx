
// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import {
//   Alert,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   CircularProgress,
//   Container,
//   Snackbar,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from '@mui/material';
// import {
//   AccessTime,
//   ArrowBack,
//   Login,
//   Logout,
//   Refresh,
//   History,
// } from '@mui/icons-material';

// const API_URL = 'http://localhost:5000/api';

// type AttendanceRecord = {
//   id: number;
//   checkIn?: string | null;
//   checkOut?: string | null;
//   checkInTime?: string | null;
//   checkOutTime?: string | null;
//   date?: string;
//   status?: string;
//   totalHours?: number | null;
//   [key: string]: unknown;
// };

// type Message = {
//   open: boolean;
//   text: string;
//   severity: 'success' | 'error';
// };

// export default function AttendancePage() {
//   const router = useRouter();

//   const [records, setRecords] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [isEmployee, setIsEmployee] = useState(false);
//   const [message, setMessage] = useState<Message>({
//     open: false,
//     text: '',
//     severity: 'success',
//   });

//   const getHeaders = () => {
//     const token = localStorage.getItem('accessToken');

//     return {
//       Authorization: `Bearer ${token}`,
//     };
//   };

//   const showMessage = (
//     text: string,
//     severity: 'success' | 'error' = 'success',
//   ) => {
//     setMessage({ open: true, text, severity });
//   };

//   const fetchAttendance = useCallback(async () => {
//     setLoading(true);

//     try {
//       const response = await axios.get(
//         `${API_URL}/attendance/my-attendance`,
//         { headers: getHeaders() },
//       );

//       // Supports common response formats:
//       // { attendance: [...] }, { records: [...] }, or [...]
//       const data = response.data;
//       const list = Array.isArray(data)
//         ? data
//         : data.attendance ?? data.records ?? data.data ?? [];

//       if (!Array.isArray(list)) {
//         setRecords([]);
//         showMessage('Unexpected attendance response format', 'error');
//         return;
//       }

//       setRecords(list);
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         showMessage(
//           error.response?.data?.message ||
//             'Could not load attendance. Please try again.',
//           'error',
//         );
//       } else {
//         showMessage('Something went wrong', 'error');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     const savedUser = localStorage.getItem('currentUser');

//     if (!token || !savedUser) {
//       router.replace('/signin');
//       return;
//     }

//     try {
//       const user = JSON.parse(savedUser);

//       if (user.role !== 'EMPLOYEE') {
//         setIsEmployee(false);
//         setLoading(false);
//         return;
//       }

//       setIsEmployee(true);
//       void fetchAttendance();
//     } catch {
//       router.replace('/signin');
//     }
//   }, [router, fetchAttendance]);

//   const handleAttendanceAction = async (action: 'check-in' | 'check-out') => {
//     setActionLoading(true);

//     try {
//       const response = await axios.post(
//         `${API_URL}/attendance/${action}`,
//         {},
//         { headers: getHeaders() },
//       );

//       showMessage(
//         response.data?.message ||
//           (action === 'check-in'
//             ? 'Checked in successfully!'
//             : 'Checked out successfully!'),
//         'success',
//       );

//       await fetchAttendance();
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         showMessage(
//           error.response?.data?.message ||
//             `Failed to ${action === 'check-in' ? 'check in' : 'check out'}.`,
//           'error',
//         );
//       } else {
//         showMessage('Something went wrong', 'error');
//       }
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const formatDateTime = (value?: string | null) => {
//     if (!value) return '—';

//     const parsed = new Date(value);

//     if (Number.isNaN(parsed.getTime())) return value;

//     return parsed.toLocaleString([], {
//       dateStyle: 'medium',
//       timeStyle: 'short',
//     });
//   };

//   const getCheckIn = (record: AttendanceRecord) =>
//     record.checkIn ?? record.checkInTime ?? null;

//   const getCheckOut = (record: AttendanceRecord) =>
//     record.checkOut ?? record.checkOutTime ?? null;

//   const calculateHours = (record: AttendanceRecord) => {
//     if (typeof record.totalHours === 'number') {
//       return `${record.totalHours.toFixed(2)} hrs`;
//     }

//     const start = getCheckIn(record);
//     const end = getCheckOut(record);

//     if (!start || !end) return 'In progress';

//     const difference =
//       new Date(end).getTime() - new Date(start).getTime();

//     if (!Number.isFinite(difference) || difference < 0) return '—';

//     return `${(difference / (1000 * 60 * 60)).toFixed(2)} hrs`;
//   };

//   const today = new Date().toDateString();

//   const todayRecord = records.find((record) => {
//     const checkIn = getCheckIn(record);
//     const dateValue = record.date ?? checkIn;

//     return dateValue && new Date(dateValue).toDateString() === today;
//   });

//   const todayCheckedIn = Boolean(
//     todayRecord && getCheckIn(todayRecord) && !getCheckOut(todayRecord),
//   );

//   if (!isEmployee) {
//     return (
//       <Container maxWidth="md" sx={{ py: 8 }}>
//         <Card>
//           <CardContent sx={{ textAlign: 'center', py: 5 }}>
//             <Typography variant="h5" fontWeight={700} gutterBottom>
//               Employee Attendance
//             </Typography>

//             <Typography color="text.secondary" sx={{ mb: 3 }}>
//               This page is for employee attendance. Admin and HR attendance
//               views can be added separately.
//             </Typography>

//             <Button
//               variant="contained"
//               onClick={() => router.push('/dashboard')}
//             >
//               Back to Dashboard
//             </Button>
//           </CardContent>
//         </Card>
//       </Container>
//     );
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: 4 }}>
//       <Container maxWidth="lg">
//         <Stack
//           direction={{ xs: 'column', sm: 'row' }}
//           justifyContent="space-between"
//           alignItems={{ xs: 'stretch', sm: 'center' }}
//           spacing={2}
//           sx={{ mb: 4 }}
//         >
//           <Box>
//             <Button
//               startIcon={<ArrowBack />}
//               onClick={() => router.push('/dashboard')}
//               sx={{ mb: 1 }}
//             >
//               Dashboard
//             </Button>

//             <Typography variant="h4" fontWeight={700}>
//               Attendance
//             </Typography>

//             <Typography color="text.secondary" sx={{ mt: 1 }}>
//               Manage your daily check-in and check-out.
//             </Typography>
//           </Box>

//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={() => void fetchAttendance()}
//             disabled={loading}
//           >
//             Refresh History
//           </Button>
//         </Stack>

//         <Card elevation={0} sx={{ mb: 3 }}>
//           <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//             <Stack
//               direction={{ xs: 'column', sm: 'row' }}
//               alignItems={{ xs: 'stretch', sm: 'center' }}
//               justifyContent="space-between"
//               spacing={3}
//             >
//               <Box>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <AccessTime color="primary" />
//                   <Typography variant="h6" fontWeight={700}>
//                     Today&apos;s Attendance
//                   </Typography>
//                 </Stack>

//                 <Typography color="text.secondary" sx={{ mt: 1 }}>
//                   {new Date().toLocaleDateString([], {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric',
//                   })}
//                 </Typography>

//                 <Chip
//                   sx={{ mt: 2 }}
//                   label={
//                     todayCheckedIn
//                       ? 'Currently Checked In'
//                       : todayRecord && getCheckOut(todayRecord)
//                         ? 'Attendance Completed'
//                         : 'Not Checked In'
//                   }
//                   color={
//                     todayCheckedIn
//                       ? 'success'
//                       : todayRecord && getCheckOut(todayRecord)
//                         ? 'info'
//                         : 'default'
//                   }
//                 />
//               </Box>

//               <Stack
//                 direction={{ xs: 'column', sm: 'row' }}
//                 spacing={2}
//               >
//                 <Button
//                   variant="contained"
//                   color="success"
//                   size="large"
//                   startIcon={<Login />}
//                   disabled={actionLoading || todayCheckedIn}
//                   onClick={() => void handleAttendanceAction('check-in')}
//                 >
//                   {actionLoading ? (
//                     <CircularProgress size={22} color="inherit" />
//                   ) : (
//                     'Check In'
//                   )}
//                 </Button>

//                 <Button
//                   variant="contained"
//                   color="error"
//                   size="large"
//                   startIcon={<Logout />}
//                   disabled={actionLoading || !todayCheckedIn}
//                   onClick={() => void handleAttendanceAction('check-out')}
//                 >
//                   {actionLoading ? (
//                     <CircularProgress size={22} color="inherit" />
//                   ) : (
//                     'Check Out'
//                   )}
//                 </Button>
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>

//         <Card elevation={0}>
//           <CardContent>
//             <Stack
//               direction="row"
//               alignItems="center"
//               spacing={1}
//               sx={{ mb: 3 }}
//             >
//               <History color="primary" />
//               <Typography variant="h6" fontWeight={700}>
//                 Attendance History
//               </Typography>
//             </Stack>

//             {loading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
//                 <CircularProgress />
//               </Box>
//             ) : records.length === 0 ? (
//               <Typography
//                 color="text.secondary"
//                 textAlign="center"
//                 sx={{ py: 5 }}
//               >
//                 No attendance records found yet. Check in to get started.
//               </Typography>
//             ) : (
//               <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Date</TableCell>
//                       <TableCell>Check In</TableCell>
//                       <TableCell>Check Out</TableCell>
//                       <TableCell>Total Hours</TableCell>
//                       <TableCell>Status</TableCell>
//                     </TableRow>
//                   </TableHead>

//                   <TableBody>
//                     {records.map((record) => {
//                       const checkIn = getCheckIn(record);
//                       const checkOut = getCheckOut(record);

//                       return (
//                         <TableRow key={record.id} hover>
//                           <TableCell>
//                             {formatDateTime(record.date ?? checkIn)}
//                           </TableCell>

//                           <TableCell>{formatDateTime(checkIn)}</TableCell>

//                           <TableCell>{formatDateTime(checkOut)}</TableCell>

//                           <TableCell>{calculateHours(record)}</TableCell>

//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={
//                                 record.status ??
//                                 (checkOut
//                                   ? 'COMPLETED'
//                                   : checkIn
//                                     ? 'IN PROGRESS'
//                                     : '—')
//                               }
//                               color={
//                                 checkOut
//                                   ? 'success'
//                                   : checkIn
//                                     ? 'warning'
//                                     : 'default'
//                               }
//                             />
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </CardContent>
//         </Card>
//       </Container>

//       <Snackbar
//         open={message.open}
//         autoHideDuration={4000}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//         onClose={() => setMessage((previous) => ({
//           ...previous,
//           open: false,
//         }))}
//       >
//         <Alert
//           severity={message.severity}
//           variant="filled"
//           onClose={() => setMessage((previous) => ({
//             ...previous,
//             open: false,
//           }))}
//         >
//           {message.text}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }




'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  ArrowBack,
  Login,
  Logout,
  History,
} from '@mui/icons-material';
import AppSidebar from '../../components/AppSidebar';
import { useProtectedRoute } from '../../components/ProtectedRoute';

const API_URL = 'http://localhost:5000/api';

type AttendanceRecord = {
  id: number;
  checkIn?: string | null;
  checkOut?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  date?: string;
  status?: string;
  totalHours?: number | null;
  [key: string]: unknown;
};

type Message = {
  open: boolean;
  text: string;
  severity: 'success' | 'error';
};

function formatBadgeLabel(value: string) {
  const label = value.replaceAll('_', ' ').toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function AttendancePage() {
  useProtectedRoute();
  const router = useRouter();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [message, setMessage] = useState<Message>({
    open: false,
    text: '',
    severity: 'success',
  });

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const showMessage = (
    text: string,
    severity: 'success' | 'error' = 'success',
  ) => {
    setMessage({ open: true, text, severity });
  };

  const fetchAttendance = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/attendance/my-attendance`,
        { headers: getHeaders() },
      );

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data.attendance ?? data.records ?? data.data ?? [];

      if (!Array.isArray(list)) {
        setRecords([]);
        showMessage('Unexpected attendance response format', 'error');
        return;
      }

      setRecords(list);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(
          error.response?.data?.message ||
            'Could not load attendance. Please try again.',
          'error',
        );
      } else {
        showMessage('Something went wrong', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser');

    if (!token || !savedUser) {
      router.replace('/signin');
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== 'EMPLOYEE') {
        setIsEmployee(false);
        setLoading(false);
        return;
      }

      setIsEmployee(true);
      void fetchAttendance();
    } catch {
      router.replace('/signin');
    }
  }, [router, fetchAttendance]);

  const handleAttendanceAction = async (
    action: 'check-in' | 'check-out',
  ) => {
    setActionLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/attendance/${action}`,
        {},
        { headers: getHeaders() },
      );

      showMessage(
        response.data?.message ||
          (action === 'check-in'
            ? 'Checked in successfully!'
            : 'Checked out successfully!'),
        'success',
      );

      await fetchAttendance();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(
          error.response?.data?.message ||
            `Failed to ${action === 'check-in' ? 'check in' : 'check out'}.`,
          'error',
        );
      } else {
        showMessage('Something went wrong', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getCheckIn = (record: AttendanceRecord) =>
    record.checkIn ?? record.checkInTime ?? null;

  const getCheckOut = (record: AttendanceRecord) =>
    record.checkOut ?? record.checkOutTime ?? null;

  const calculateHours = (record: AttendanceRecord) => {
    if (typeof record.totalHours === 'number') {
      return `${record.totalHours.toFixed(2)} hrs`;
    }

    const start = getCheckIn(record);
    const end = getCheckOut(record);

    if (!start || !end) return 'In progress';

    const difference =
      new Date(end).getTime() - new Date(start).getTime();

    if (!Number.isFinite(difference) || difference < 0) return '—';

    return `${(difference / (1000 * 60 * 60)).toFixed(2)} hrs`;
  };

  const today = new Date().toDateString();

  const todayRecord = records.find((record) => {
    const checkIn = getCheckIn(record);
    const dateValue = record.date ?? checkIn;

    return dateValue && new Date(dateValue).toDateString() === today;
  });

  const todayCheckedIn = Boolean(
    todayRecord && getCheckIn(todayRecord) && !getCheckOut(todayRecord),
  );

  const buttonSx = {
    px: 2.5,
    py: 1,
    minWidth: 120,
    borderRadius: 2,
    textTransform: 'none' as const,
    fontWeight: 600,
    boxShadow: 'none',
  };

  if (!isEmployee) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f5f7fb' }}>
        <AppSidebar />
        <Box sx={{ flex: 1, py: 8 }}>
          <Container maxWidth="md">
            <Card
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
            >
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Employee Attendance
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  This page is for employee attendance. Admin and HR attendance
                  views can be added separately.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/dashboard')}
                  sx={buttonSx}
                >
                  Back to dashboard
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f7fb',
        display: 'flex',
      }}
    >
      <AppSidebar />
      <Box sx={{ flex: 1, py: { xs: 2.5, md: 4 } }}>
        <Container maxWidth="lg">
        {/* Page header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 3 }}
        >
          <Box>
            <Button
              size="small"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/dashboard')}
              sx={{
                mb: 0.75,
                px: 1,
                textTransform: 'none',
                color: 'text.secondary',
              }}
            >
              Dashboard
            </Button>

            <Typography variant="h4" fontWeight={700} sx={{ color: '#0f172a' }}>
              Attendance
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 , color: '#475569'}}>
              Manage your daily check-in and check-out.
            </Typography>
          </Box>

        </Stack>

        {/* Today's attendance card */}
        <Card
          elevation={0}
          sx={{
            mb: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={2.5}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTime color="primary" fontSize="small" />

                  <Typography variant="h6" fontWeight={700}>
                    Today&apos;s Attendance
                  </Typography>
                </Stack>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 0.75 }}
                >
                  {new Date().toLocaleDateString([], {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>

                <Chip
                  size="small"
                  sx={{ mt: 1.5, fontWeight: 600 }}
                  label={
                    todayCheckedIn
                      ? 'Currently checked in'
                      : todayRecord && getCheckOut(todayRecord)
                        ? 'Attendance completed'
                        : 'Not checked in'
                  }
                  color={
                    todayCheckedIn
                      ? 'success'
                      : todayRecord && getCheckOut(todayRecord)
                        ? 'info'
                        : 'default'
                  }
                />
              </Box>

              <Stack
                direction={{ xs: 'row', sm: 'row' }}
                spacing={1.5}
                sx={{
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <Login fontSize="small" />
                    )
                  }
                  disabled={actionLoading || todayCheckedIn}
                  onClick={() => void handleAttendanceAction('check-in')}
                  sx={{
                    ...buttonSx,
                    '&:hover': { boxShadow: 'none' },
                  }}
                >
                  Check in
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  size="medium"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <Logout fontSize="small" />
                    )
                  }
                  disabled={actionLoading || !todayCheckedIn}
                  onClick={() => void handleAttendanceAction('check-out')}
                  sx={{
                    ...buttonSx,
                    '&:hover': { boxShadow: 'none' },
                  }}
                >
                  Check out
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Attendance history */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <History color="primary" fontSize="small" />

              <Typography variant="h6" fontWeight={700}>
                Attendance History
              </Typography>
            </Stack>

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 5,
                }}
              >
                <CircularProgress size={28} />
              </Box>
            ) : records.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <AccessTime
                  sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }}
                />

                <Typography fontWeight={600}>
                  No attendance records yet
                </Typography>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 0.5 }}
                >
                  Check in to get started.
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  overflowX: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {[
                        'Date',
                        'Check in',
                        'Check out',
                        'Total hours',
                        'Status',
                      ].map((heading) => (
                        <TableCell
                          key={heading}
                          sx={{
                            py: 1.5,
                            fontWeight: 700,
                            color: 'text.secondary',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {records.map((record) => {
                      const checkIn = getCheckIn(record);
                      const checkOut = getCheckOut(record);

                      const status =
                        record.status ??
                        (checkOut
                          ? 'COMPLETED'
                          : checkIn
                            ? 'IN PROGRESS'
                            : '—');

                      return (
                        <TableRow key={record.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDateTime(record.date ?? checkIn)}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDateTime(checkIn)}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDateTime(checkOut)}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {calculateHours(record)}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={formatBadgeLabel(status)}
                              color={
                                checkOut
                                  ? 'success'
                                  : checkIn
                                    ? 'warning'
                                    : 'default'
                              }
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
        </Container>
      </Box>

      {/* Success and error notifications */}
      <Snackbar
        open={message.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() =>
          setMessage((previous) => ({
            ...previous,
            open: false,
          }))
        }
      >
        <Alert
          severity={message.severity}
          variant="filled"
          onClose={() =>
            setMessage((previous) => ({
              ...previous,
              open: false,
            }))
          }
          sx={{ borderRadius: 2 }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
