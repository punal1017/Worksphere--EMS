
// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   Alert,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   CircularProgress,
//   Container,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   MenuItem,
//   Snackbar,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from '@mui/material';
// import {
//   Add,
//   Edit,
//   Delete,
//   Refresh,
//   Person,
//   ArrowBack,
// } from '@mui/icons-material';
// import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
// import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
// import { useRouter } from 'next/navigation';

// const API_URL = 'http://localhost:5000/api';

// type User = {
//   id: number;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'HR' | 'EMPLOYEE';
//   status: 'ACTIVE' | 'INACTIVE';
//   createdAt?: string;
// };

// type FormData = {
//   name: string;
//   email: string;
//   password: string;
//   role: 'HR' | 'EMPLOYEE';
// };

// export default function EmployeesPage() {
//   const router = useRouter();

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('currentUser');
//     router.replace('/sign-in');
//   };

//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);

//   const [formOpen, setFormOpen] = useState(false);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState<FormData>({
//     name: '',
//     email: '',
//     password: '',
//     role: 'EMPLOYEE',
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success' as 'success' | 'error',
//   });

//   // Get the JWT token for protected API requests.
//   const getHeaders = () => {
//     const token = localStorage.getItem('accessToken');

//     return {
//       Authorization: `Bearer ${token}`,
//     };
//   };

//   const showMessage = (
//     message: string,
//     severity: 'success' | 'error' = 'success',
//   ) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   // Fetch all users from the backend.
//   const fetchUsers = async () => {
//     setLoading(true);

//     try {
//       const response = await axios.get(`${API_URL}/users`, {
//         headers: getHeaders(),
//       });

//       setUsers(response.data.users ?? []);
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         showMessage(
//           error.response?.data?.message || 'Failed to fetch users',
//           'error',
//         );
//       } else {
//         showMessage('Something went wrong', 'error');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Only Admin can access this page.
//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     const savedUser = localStorage.getItem('currentUser');

//     if (!token || !savedUser) {
//       router.replace('/sign-in');
//       return;
//     }

//     try {
//       const user = JSON.parse(savedUser);

//       if (user.role !== 'ADMIN') {
//         setIsAdmin(false);
//         setLoading(false);
//         return;
//       }

//       setIsAdmin(true);
//       void fetchUsers();
//     } catch {
//       router.replace('/sign-in');
//     }
//   }, [router]);

//   const resetForm = () => {
//     setForm({
//       name: '',
//       email: '',
//       password: '',
//       role: 'EMPLOYEE',
//     });
//     setEditingUser(null);
//   };

//   const openCreateForm = () => {
//     resetForm();
//     setFormOpen(true);
//   };

//   const openEditForm = (user: User) => {
//     setEditingUser(user);
//     setForm({
//       name: user.name,
//       email: user.email,
//       password: '',
//       role: user.role === 'HR' ? 'HR' : 'EMPLOYEE',
//     });
//     setFormOpen(true);
//   };

//   const handleSaveUser = async () => {
//     if (!form.name.trim() || !form.email.trim()) {
//       showMessage('Please enter name and email', 'error');
//       return;
//     }

//     if (!editingUser && !form.password.trim()) {
//       showMessage('Please enter a password for the new account', 'error');
//       return;
//     }

//     setSaving(true);

//     try {
//       if (editingUser) {
//         await axios.patch(
//           `${API_URL}/users/${editingUser.id}`,
//           {
//             name: form.name.trim(),
//             email: form.email.trim(),
//             role: form.role,
//           },
//           { headers: getHeaders() },
//         );

//         showMessage('User updated successfully');
//       } else {
//         await axios.post(
//           `${API_URL}/users`,
//           {
//             name: form.name.trim(),
//             email: form.email.trim(),
//             password: form.password,
//             role: form.role,
//           },
//           { headers: getHeaders() },
//         );

//         showMessage('User created successfully');
//       }

//       setFormOpen(false);
//       resetForm();
//       await fetchUsers();
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         showMessage(
//           error.response?.data?.message || 'Failed to save user',
//           'error',
//         );
//       } else {
//         showMessage('Something went wrong', 'error');
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggleStatus = async (user: User) => {
//     const newStatus =
//       user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

//     try {
//       await axios.patch(
//         `${API_URL}/users/${user.id}/status`,
//         { status: newStatus },
//         { headers: getHeaders() },
//       );

//       showMessage(
//         `${user.name} is now ${newStatus.toLowerCase()}`,
//       );

//       await fetchUsers();
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         showMessage(
//           error.response?.data?.message || 'Failed to update status',
//           'error',
//         );
//       } else {
//         showMessage('Something went wrong', 'error');
//       }
//     }
//   };

//   const handleDeleteUser = async (user: User) => {
//     const confirmed = window.confirm(
//       `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
//     );

//     if (!confirmed) return;

//     try {
//       await axios.delete(`${API_URL}/users/${user.id}`, {
//         headers: getHeaders(),
//       });

//       showMessage('User deleted successfully');
//       await fetchUsers();
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         showMessage(
//           error.response?.data?.message || 'Failed to delete user',
//           'error',
//         );
//       } else {
//         showMessage('Something went wrong', 'error');
//       }
//     }
//   };

//   if (!isAdmin) {
//     return (
//       <Container maxWidth="md" sx={{ py: 8 }}>
//         <Card>
//           <CardContent sx={{ textAlign: 'center', py: 5 }}>
//             <Typography variant="h5" gutterBottom>
//               Access Restricted
//             </Typography>
//             <Typography color="text.secondary" sx={{ mb: 3 }}>
//               Only Admin can access Employee Management.
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

//   const adminCount = users.filter(
//     (user) => user.role === 'ADMIN',
//   ).length;

//   const hrCount = users.filter(
//     (user) => user.role === 'HR',
//   ).length;

//   const employeeCount = users.filter(
//     (user) => user.role === 'EMPLOYEE',
//   ).length;

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
//       <Box
//         component="header"
//         sx={{
//           bgcolor: '#ffffff',
//           borderBottom: '1px solid #e2e8f0',
//         }}
//       >
//         <Container
//           maxWidth="lg"
//           sx={{
//             minHeight: 76,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             gap: 2,
//           }}
//         >
//           <Stack direction="row" spacing={1} alignItems="center">
//             <GroupsRoundedIcon sx={{ fontSize: 36, color: '#2563eb' }} />
//             <Typography
//               variant="h5"
//               sx={{ fontWeight: 800, color: '#0f172a' }}
//             >
//               WorkSphere
//             </Typography>
//           </Stack>

//           <Button
//             variant="outlined"
//             startIcon={<LogoutRoundedIcon />}
//             onClick={handleLogout}
//             sx={{ borderRadius: 2, px: 3, textTransform: 'none' }}
//           >
//             Sign out
//           </Button>
//         </Container>
//       </Box>

//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Stack
//           direction={{ xs: 'column', sm: 'row' }}
//           justifyContent="space-between"
//           spacing={2}
//           sx={{ mb: 4, alignItems: { xs: 'stretch', sm: 'center' } }}
//         >
//           <Box>
//             <Button
//               startIcon={<ArrowBack />}
//               onClick={() => router.push('/dashboard')}
//               sx={{ mb: 1 }}
//             >
//               Dashboard
//             </Button>

//             <Typography variant="h4" fontWeight={600} sx={{ fontWeight: 800, color: '#0f172a' }}>
//               Employee Management
//             </Typography>

//             <Typography color="text.secondary" sx={{ mt: 1 , color: '#475569' }}>
//               Create and manage HR and employee accounts.
//             </Typography>
//           </Box>

//           <Stack direction="row" spacing={1}>
//             <Button
//               variant="outlined"
//               startIcon={<Refresh />}
//               onClick={() => void fetchUsers()}
//             >
//               Refresh
//             </Button>

//             <Button
//               variant="contained"
//               startIcon={<Add />}
//               onClick={openCreateForm}
//             >
//               Add User
//             </Button>
//           </Stack>
//         </Stack>

//         <Box
//           sx={{
//             display: 'grid',
//             gridTemplateColumns: {
//               xs: '1fr',
//               sm: 'repeat(2, 1fr)',
//               md: 'repeat(4, 1fr)',
//             },
//             gap: 2,
//             mb: 4,
//           }}
//         >
//           {[
//             { title: 'Total Users', value: users.length },
//             { title: 'Admins', value: adminCount },
//             { title: 'HR Members', value: hrCount },
//             { title: 'Employees', value: employeeCount },
//           ].map((item) => (
//             <Card key={item.title} elevation={0}>
//               <CardContent>
//                 <Typography color="text.secondary" variant="body2">
//                   {item.title}
//                 </Typography>
//                 <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
//                   {item.value}
//                 </Typography>
//               </CardContent>
//             </Card>
//           ))}
//         </Box>

//         <Card elevation={0}>
//           <CardContent>
//             <Stack
//               direction="row"
//               alignItems="center"
//               spacing={1}
//               sx={{ mb: 2 }}
//             >
//               <Person color="primary" />
//               <Typography variant="h6" fontWeight={700}>
//                 All Users
//               </Typography>
//             </Stack>

//             {loading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
//                 <CircularProgress />
//               </Box>
//             ) : users.length === 0 ? (
//               <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
//                 No users found. Click Add User to create an account.
//               </Typography>
//             ) : (
//               <TableContainer sx={{ overflowX: 'auto' }}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Name</TableCell>
//                       <TableCell>Email</TableCell>
//                       <TableCell>Role</TableCell>
//                       <TableCell>Status</TableCell>
//                       <TableCell>Created</TableCell>
//                       <TableCell align="right">Actions</TableCell>
//                     </TableRow>
//                   </TableHead>

//                   <TableBody>
//                     {users.map((user) => (
//                       <TableRow key={user.id} hover>
//                         <TableCell>
//                           <Typography fontWeight={600}>
//                             {user.name}
//                           </Typography>
//                         </TableCell>

//                         <TableCell>{user.email}</TableCell>

//                         <TableCell>
//                           <Chip
//                             size="small"
//                             label={user.role}
//                             color={
//                               user.role === 'ADMIN'
//                                 ? 'secondary'
//                                 : user.role === 'HR'
//                                   ? 'primary'
//                                   : 'default'
//                             }
//                           />
//                         </TableCell>

//                         <TableCell>
//                           <Chip
//                             size="small"
//                             label={user.status}
//                             color={
//                               user.status === 'ACTIVE'
//                                 ? 'success'
//                                 : 'default'
//                             }
//                           />
//                         </TableCell>

//                         <TableCell>
//                           {user.createdAt
//                             ? new Date(user.createdAt).toLocaleDateString()
//                             : '—'}
//                         </TableCell>

//                         <TableCell align="right">
//                           {user.role !== 'ADMIN' && (
//                             <Stack
//                               direction="row"
//                               spacing={0.5}
//                               justifyContent="flex-end"
//                             >
//                               <IconButton
//                                 aria-label="Edit user"
//                                 color="primary"
//                                 onClick={() => openEditForm(user)}
//                               >
//                                 <Edit />
//                               </IconButton>

//                               <Button
//                                 size="small"
//                                 variant="outlined"
//                                 color={
//                                   user.status === 'ACTIVE'
//                                     ? 'warning'
//                                     : 'success'
//                                 }
//                                 onClick={() => void handleToggleStatus(user)}
//                               >
//                                 {user.status === 'ACTIVE'
//                                   ? 'Deactivate'
//                                   : 'Activate'}
//                               </Button>

//                               <IconButton
//                                 aria-label="Delete user"
//                                 color="error"
//                                 onClick={() => void handleDeleteUser(user)}
//                               >
//                                 <Delete />
//                               </IconButton>
//                             </Stack>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             )}
//           </CardContent>
//         </Card>
//       </Container>

//       <Dialog
//         open={formOpen}
//         onClose={() => {
//           if (!saving) {
//             setFormOpen(false);
//             resetForm();
//           }
//         }}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>
//           {editingUser ? 'Edit User' : 'Create New User'}
//         </DialogTitle>

//         <DialogContent>
//           <Stack spacing={2.5} sx={{ pt: 1 }}>
//             <TextField
//               label="Full Name"
//               fullWidth
//               value={form.name}
//               onChange={(event) =>
//                 setForm({ ...form, name: event.target.value })
//               }
//               required
//             />

//             <TextField
//               label="Email Address"
//               type="email"
//               fullWidth
//               value={form.email}
//               onChange={(event) =>
//                 setForm({ ...form, email: event.target.value })
//               }
//               required
//             />

//             {!editingUser && (
//               <TextField
//                 label="Temporary Password"
//                 type="password"
//                 fullWidth
//                 value={form.password}
//                 onChange={(event) =>
//                   setForm({ ...form, password: event.target.value })
//                 }
//                 helperText="Share the login credentials securely with the new user."
//                 required
//               />
//             )}

//             <TextField
//               select
//               label="Role"
//               fullWidth
//               value={form.role}
//               onChange={(event) =>
//                 setForm({
//                   ...form,
//                   role: event.target.value as 'HR' | 'EMPLOYEE',
//                 })
//               }
//             >
//               <MenuItem value="EMPLOYEE">Employee</MenuItem>
//               <MenuItem value="HR">HR</MenuItem>
//             </TextField>
//           </Stack>
//         </DialogContent>

//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button
//             onClick={() => {
//               setFormOpen(false);
//               resetForm();
//             }}
//             disabled={saving}
//           >
//             Cancel
//           </Button>

//           <Button
//             variant="contained"
//             onClick={() => void handleSaveUser()}
//             disabled={saving}
//           >
//             {saving ? (
//               <CircularProgress size={22} color="inherit" />
//             ) : editingUser ? (
//               'Save Changes'
//             ) : (
//               'Create User'
//             )}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert
//           severity={snackbar.severity}
//           variant="filled"
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }




'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
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
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AppSidebar from '../../components/AppSidebar';

const API_URL = 'http://localhost:5000/api';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  dateOfBirth?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
};

type FormData = {
  name: string;
  email: string;
  password: string;
  role: 'HR' | 'EMPLOYEE';
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
};

type SortField = 'name' | 'email' | 'role' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function EmployeesPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Return a sorted copy without mutating the original users state.
  const sortedUsers = [...users].sort((a, b) => {
    let comparison: number;

    if (sortBy === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      comparison = dateA - dateB;
    } else {
      comparison = String(a[sortBy] ?? '').localeCompare(
        String(b[sortBy] ?? ''),
        undefined,
        { sensitivity: 'base', numeric: true },
      );
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // JWT headers for protected API requests.
  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const showMessage = (
    message: string,
    severity: 'success' | 'error' = 'success',
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch users from the backend.
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: getHeaders(),
      });

      setUsers(response.data.users ?? []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(
          error.response?.data?.message || 'Failed to fetch users',
          'error',
        );
      } else {
        showMessage('Something went wrong', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Admin-only page access check.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser');

    if (!token || !savedUser) {
      router.replace('/sign-in');
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== 'ADMIN') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      void fetchUsers();
    } catch {
      router.replace('/sign-in');
    }
    // Run on initial page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'EMPLOYEE',
    });

    setEditingUser(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role === 'HR' ? 'HR' : 'EMPLOYEE',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      address: user.address || '',
      phoneNumber: user.phoneNumber || '',
    });

    setFormOpen(true);
  };

  const handleSaveUser = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showMessage('Please enter name and email', 'error');
      return;
    }

    if (!editingUser && !form.password.trim()) {
      showMessage('Please enter a password for the new account', 'error');
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        await axios.patch(
          `${API_URL}/users/${editingUser.id}`,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            dateOfBirth: form.dateOfBirth || null,
            address: form.address,
            phoneNumber: form.phoneNumber,
          },
          { headers: getHeaders() },
        );

        showMessage('User updated successfully');
      } else {
        await axios.post(
          `${API_URL}/users`,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            dateOfBirth: form.dateOfBirth || null,
            address: form.address,
            phoneNumber: form.phoneNumber,
          },
          { headers: getHeaders() },
        );

        showMessage('User created successfully');
      }

      setFormOpen(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(
          error.response?.data?.message || 'Failed to save user',
          'error',
        );
      } else {
        showMessage('Something went wrong', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus =
      user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await axios.patch(
        `${API_URL}/users/${user.id}/status`,
        { status: newStatus },
        { headers: getHeaders() },
      );

      showMessage(`${user.name} is now ${newStatus.toLowerCase()}`);
      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(
          error.response?.data?.message || 'Failed to update status',
          'error',
        );
      } else {
        showMessage('Something went wrong', 'error');
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/users/${user.id}`, {
        headers: getHeaders(),
      });

      showMessage('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(
          error.response?.data?.message || 'Failed to delete user',
          'error',
        );
      } else {
        showMessage('Something went wrong', 'error');
      }
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8fafc' }}>
        <AppSidebar />
        <Box sx={{ flex: 1, py: 8 }}>
          <Container maxWidth="md">
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h5" gutterBottom>
                  Access Restricted
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Only Admin can access Employee Management.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/dashboard')}
                  sx={{ textTransform: 'none' }}
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

  const adminCount = users.filter(
    (user) => user.role === 'ADMIN',
  ).length;

  const hrCount = users.filter(
    (user) => user.role === 'HR',
  ).length;

  const employeeCount = users.filter(
    (user) => user.role === 'EMPLOYEE',
  ).length;

  const sortableColumns: [SortField, string][] = [
    ['name', 'Name'],
    ['email', 'Email'],
    ['role', 'Role'],
    ['status', 'Status'],
    ['createdAt', 'Created'],
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex' }}>
      <AppSidebar />
      <Box sx={{ flex: 1 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page title and actions */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            mb: 4,
            alignItems: { xs: 'stretch', sm: 'center' },
            width: '100%',
            position: 'relative',
          }}
        >
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/dashboard')}
              sx={{ mb: 1, textTransform: 'none' }}
            >
              Dashboard
            </Button>

            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#0f172a' }}
            >
              Employee Management
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1, color: '#475569' }}
            >
              Create and manage HR and employee accounts.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              position: { xs: 'static', sm: 'absolute' },
              right: { sm: 0 },
              top: { sm: '50%' },
              transform: { sm: 'translateY(-50%)' },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateForm}
              sx={{
                ml: { xs: 'auto', sm: 0 },
                textTransform: 'none',
              }}
            >
              Add user
            </Button>
          </Stack>
        </Stack>

        {/* Summary cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
          {[
            { title: 'Total Users', value: users.length },
            { title: 'Admins', value: adminCount },
            { title: 'HR Members', value: hrCount },
            { title: 'Employees', value: employeeCount },
          ].map((item) => (
            <Card key={item.title} elevation={0}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {item.title}
                </Typography>

                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Users table */}
        <Card elevation={0}>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Person color="primary" />

              <Typography variant="h6" fontWeight={700}>
                All Users
              </Typography>
            </Stack>

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ py: 4, textAlign: 'center' }}
              >
                No users found. Click Add user to create an account.
              </Typography>
            ) : (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {sortableColumns.map(([field, label]) => (
                        <TableCell key={field}>
                          <TableSortLabel
                            active={sortBy === field}
                            direction={
                              sortBy === field ? sortOrder : 'asc'
                            }
                            onClick={() => handleSort(field)}
                          >
                            {label}
                          </TableSortLabel>
                        </TableCell>
                      ))}

                      <TableCell>Phone</TableCell>
                      <TableCell>Date of birth</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell align="left">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {user.name}
                          </Typography>
                        </TableCell>

                        <TableCell>{user.email}</TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={user.role}
                            color={
                              user.role === 'ADMIN'
                                ? 'secondary'
                                : user.role === 'HR'
                                  ? 'primary'
                                  : 'default'
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={user.status}
                            color={
                              user.status === 'ACTIVE'
                                ? 'success'
                                : 'default'
                            }
                          />
                        </TableCell>

                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : '—'}
                        </TableCell>

                        <TableCell>{user.phoneNumber || '—'}</TableCell>

                        <TableCell>
                          {user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString()
                            : '—'}
                        </TableCell>

                        <TableCell sx={{ minWidth: 180 }}>
                          {user.address || '—'}
                        </TableCell>

                        <TableCell align="right">
                          {user.role !== 'ADMIN' && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >
                              <IconButton
                                aria-label="Edit user"
                                color="primary"
                                onClick={() => openEditForm(user)}
                              >
                                <Edit />
                              </IconButton>

                              <Button
                                size="small"
                                variant="outlined"
                                color={
                                  user.status === 'ACTIVE'
                                    ? 'warning'
                                    : 'success'
                                }
                                onClick={() =>
                                  void handleToggleStatus(user)
                                }
                                sx={{ textTransform: 'none' }}
                              >
                                {user.status === 'ACTIVE'
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </Button>

                              <IconButton
                                aria-label="Delete user"
                                color="error"
                                onClick={() => void handleDeleteUser(user)}
                              >
                                <Delete />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Create/Edit User Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => {
          if (!saving) {
            setFormOpen(false);
            resetForm();
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingUser ? 'Edit user' : 'Create new user'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Full name"
              fullWidth
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />

            <TextField
              label="Email address"
              type="email"
              fullWidth
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />

            {!editingUser && (
              <TextField
                label="Temporary password"
                type="password"
                fullWidth
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                helperText="Share the login credentials securely with the new user."
                required
              />
            )}

            <TextField
              select
              label="Role"
              fullWidth
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value as 'HR' | 'EMPLOYEE',
                })
              }
            >
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
            </TextField>

            <TextField
              label="Date of birth"
              type="date"
              fullWidth
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm({ ...form, dateOfBirth: event.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Address"
              fullWidth
              multiline
              minRows={2}
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
            />

            <TextField
              label="Phone number"
              fullWidth
              value={form.phoneNumber}
              onChange={(event) =>
                setForm({ ...form, phoneNumber: event.target.value })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setFormOpen(false);
              resetForm();
            }}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleSaveUser()}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : editingUser ? (
              'Save changes'
            ) : (
              'Create user'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
}
