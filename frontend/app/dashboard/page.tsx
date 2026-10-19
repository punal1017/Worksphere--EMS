// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Box,
//   Button,
//   Card,
//   Container,
//   Stack,
//   Typography,
// } from '@mui/material';
// import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

// type CurrentUser = {
//   name: string;
//   email: string;
//   role: string;
// };

// export default function DashboardPage() {
//   const router = useRouter();
//   const [user] = useState<CurrentUser | null>(() => {
//     if (typeof window === 'undefined') {
//       return null;
//     }

//     const storedUser = localStorage.getItem('currentUser');

//     if (!storedUser) {
//       return null;
//     }

//     try {
//       return JSON.parse(storedUser) as CurrentUser;
//     } catch {
//       localStorage.removeItem('currentUser');
//       localStorage.removeItem('accessToken');
//       return null;
//     }
//   });

//   useEffect(() => {
//     if (!user) {
//       router.replace('/signIn');
//     }
//   }, [router, user]);

//   const handleSignOut = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('currentUser');
//     router.replace('/signIn');
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
//       <Box
//         component="header"
//         sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 2 }}
//       >
//         <Container
//           maxWidth="lg"
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}
//         >
//           <Stack direction="row" spacing={1} alignItems="center">
//             <GroupsRoundedIcon sx={{ fontSize: 34, color: '#2563eb' }} />
//             <Typography variant="h5" fontWeight={800} color="#0f172a">
//               WorkSphere
//             </Typography>
//           </Stack>
//           <Button onClick={handleSignOut} sx={{ textTransform: 'none' }}>
//             Sign Out
//           </Button>
//         </Container>
//       </Box>

//       <Container maxWidth="lg" sx={{ py: 8 }}>
//         <Typography variant="h3" fontWeight={800} color="#0f172a" gutterBottom>
//           Welcome, {user.name}
//         </Typography>
//         <Typography color="text.secondary" sx={{ mb: 4 }}>
//           You are signed in as {user.email} ({user.role}).
//         </Typography>
//         <Card
//           elevation={0}
//           sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}
//         >
//           <Typography variant="h6" fontWeight={700}>
//             Your workspace is ready
//           </Typography>
//           <Typography color="text.secondary" sx={{ mt: 1 }}>
//             Attendance and leave management tools will appear here.
//           </Typography>
//         </Card>
//       </Container>
//     </Box>
//   );
// }



'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser');

    if (!token || !savedUser) {
      router.replace('/signIn');
      return;
    }

    try {
      const parsedUser: User = JSON.parse(savedUser);

      if (!parsedUser.name || !parsedUser.role) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        router.replace('/signIn');
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      router.replace('/signIn');
    } finally {
      setCheckingLogin(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');

    router.replace('/signIn');
  };

  if (checkingLogin || !user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const roleTitle = {
    ADMIN: 'Administrator',
    HR: 'Human Resources',
    EMPLOYEE: 'Employee',
  }[user.role];

  const dashboardCards = [
    {
      title: 'Team Management',
      description: 'Manage employee information and team members.',
      icon: <PeopleAltRoundedIcon />,
      roles: ['ADMIN', 'HR'],
    },
    {
      title: 'Attendance',
      description: 'Track your daily check-in and check-out.',
      icon: <AccessTimeRoundedIcon />,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
    {
      title: 'Leave Management',
      description: 'Apply for leave and review leave requests.',
      icon: <EventAvailableRoundedIcon />,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'white',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupsRoundedIcon
                sx={{ fontSize: 34, color: '#2563eb' }}
              />

              <Typography variant="h5" fontWeight={800}>
                WorkSphere
              </Typography>
            </Stack>

            <Button
              color="inherit"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
              Logout
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            color: 'white',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: 28,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Welcome, {user.name}!
                </Typography>

                <Typography sx={{ mt: 1, opacity: 0.9 }}>
                  You are signed in as {roleTitle}.
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, opacity: 0.85 }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ mb: 1, color: '#0f172a' }}
        >
          Your Workspace
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Here is an overview of the features available to your role.
        </Typography>

        {!['ADMIN', 'HR', 'EMPLOYEE'].includes(user.role) && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Your account role is not recognized. Please contact your administrator.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {dashboardCards
            .filter((card) => card.roles.includes(user.role))
            .map((card) => (
              <Card
                key={card.title}
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  transition: '0.2s',
                  '&:hover': {
                    borderColor: '#93c5fd',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#dbeafe',
                      color: '#2563eb',
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Typography variant="h6" fontWeight={700}>
                    {card.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, lineHeight: 1.8 }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
        </Box>
      </Container>
    </Box>
  );
}