'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navbar */}
      <Box
        component="header"
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            minHeight: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Stack component="div" direction="row" spacing={1} alignItems="center">
            <GroupsRoundedIcon
              sx={{ fontSize: 36, color: '#2563eb' }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#0f172a' }}
            >
              WorkSphere
            </Typography>
          </Stack>

          <Button
            variant="outlined"
            onClick={() => router.push('/sign-in')}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Sign in
          </Button>
        </Container>
      </Box>

      {/* Main introduction */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 7, md: 10 },
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              maxWidth: 780,
              mx: 'auto',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                mb: 3,
                borderRadius: 10,
                bgcolor: '#dbeafe',
                color: '#1d4ed8',
              }}
            >
              <GroupsRoundedIcon fontSize="small" />
              <Typography variant="body2" fontWeight={700}>
                A smarter way to work together
              </Typography>
            </Box>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.3rem' },
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#0f172a',
              }}
            >
              Your team.
              <Box component="span" sx={{ color: '#2563eb' }}>
                {' '}Your workspace.
              </Box>
              <br />
              Everything connected.
            </Typography>

            <Typography
              sx={{
                mt: 3,
                mx: 'auto',
                maxWidth: 650,
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.9,
                color: '#64748b',
              }}
            >
              Manage employees, track attendance, and simplify leave
              management with one organized workspace for your team.
            </Typography>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => router.push('/sign-in')}
              sx={{
                mt: 4,
                px: 4,
                py: 1.6,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
              }}
            >
              Get started
            </Button>

            <Typography
              variant="body2"
              sx={{ mt: 2, color: '#94a3b8' }}
            >
              Secure access for authorized team members
            </Typography>
          </Box>

          {/* Feature cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 3,
              mt: { xs: 7, md: 10 },
            }}
          >
            <FeatureCard
              icon={<DashboardRoundedIcon />}
              title="Team Management"
              description="Keep employee information organized in one place."
            />

            <FeatureCard
              icon={<AccessTimeRoundedIcon />}
              title="Attendance Tracking"
              description="Make daily check-in and check-out simple."
            />

            <FeatureCard
              icon={<EventAvailableRoundedIcon />}
              title="Leave Management"
              description="Submit and review leave requests with clear approval steps."
            />
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          bgcolor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2026 WorkSphere. Employee management made simple.
        </Typography>
      </Box>
    </Box>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        transition: '0.2s',
        '&:hover': {
          borderColor: '#93c5fd',
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
        },
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          bgcolor: '#dbeafe',
          color: '#2563eb',
        }}
      >
        {icon}
      </Box>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: '#64748b', lineHeight: 1.8 }}
      >
        {description}
      </Typography>
    </Box>
  );
}